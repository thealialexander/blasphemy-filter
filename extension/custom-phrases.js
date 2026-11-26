(() => {
  "use strict";

  const { customPattern } = globalThis.NoBlaspheme;
  const { defaultStyle, normalizeStyle } = globalThis.NoBlasphemyMask;
  const storage = (globalThis.browser ?? globalThis.chrome).storage;
  const prefix = "custom-phrase:";
  const styleKey = "mask-style";
  const maxLength = 500;
  const maxHintWords = 8;
  const maxStars = 10;

  function makeHint(phrase) {
    const words = phrase.normalize("NFKC").match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}*'’]*/gu) ?? [];
    return {
      words: words.slice(0, maxHintWords).map(word => {
        // A longer word can contribute just its first ASCII letter.
        const letter = /^[a-z]{4}/i.test(word) ? word.toLowerCase().charCodeAt(0) : 0;
        const stars = Math.min(maxStars, Math.max(1, [...word].length - (letter ? 1 : 0)));
        return [letter, stars];
      }),
      more: words.length > maxHintWords,
    };
  }

  function formatHint(hint) {
    if (!Array.isArray(hint?.words) || !hint.words.length) return "";
    const parts = [];
    for (const word of hint.words.slice(0, maxHintWords)) {
      if (!Array.isArray(word)) return "";
      const [letter, stars] = word;
      if (!Number.isInteger(letter) || (letter !== 0 && (letter < 97 || letter > 122))
          || !Number.isInteger(stars) || stars < 1 || stars > maxStars) return "";
      parts.push((letter ? String.fromCharCode(letter) : "") + "*".repeat(stars));
    }
    if (hint.more === true) parts.push("…");
    return parts.join(" ");
  }

  function watch(onUpdate, onError = () => {}) {
    const entries = new Map();
    const updates = new Map();
    let loaded = false;
    let style = defaultStyle;

    function apply(id, rule) {
      if (id === styleKey) {
        style = normalizeStyle(rule);
      } else if (Array.isArray(rule?.pattern) && rule.pattern.length && rule.pattern.every(Number.isSafeInteger)) {
        entries.set(id, {
          id,
          pattern: rule.pattern,
          addedAt: rule.addedAt,
          hint: rule.hint,
        });
      } else {
        entries.delete(id);
      }
    }

    function publish() {
      onUpdate([...entries.values()], style);
    }

    storage.onChanged.addListener((changes, area) => {
      if (area !== "local") return;
      let changed = false;
      for (const [id, change] of Object.entries(changes)) {
        if (id !== styleKey && !id.startsWith(prefix)) continue;
        if (loaded) apply(id, change.newValue);
        else updates.set(id, change.newValue);
        changed = true;
      }
      if (loaded && changed) publish();
    });

    storage.local.get(null).then(values => {
      for (const [id, rule] of Object.entries(values)) {
        if (id === styleKey || id.startsWith(prefix)) apply(id, rule);
      }
      for (const [id, rule] of updates) apply(id, rule);
      updates.clear();
      loaded = true;
      publish();
    }).catch(onError);
  }

  function setStyle(style) {
    return storage.local.set({ [styleKey]: normalizeStyle(style) });
  }

  function withPhraseLock(operation) {
    return navigator.locks ? navigator.locks.request("custom-phrases", operation) : operation();
  }

  function samePattern(a, b) {
    return a?.length === b.length && b.every((key, index) => key === a[index]);
  }

  async function save(input, original) {
    const phrase = input.trim();
    if (phrase.length > maxLength) return "too-long";

    const pattern = customPattern(phrase);
    if (!pattern.length) return "empty";

    return withPhraseLock(async () => {
      const values = await storage.local.get(null);
      const saved = original && values[original.id];
      if (original && !samePattern(saved?.pattern, original.pattern)) return "changed";

      const duplicate = Object.entries(values).find(([id, rule]) =>
        id !== original?.id && id.startsWith(prefix) && samePattern(rule?.pattern, pattern)
      );
      if (duplicate) {
        const [id, rule] = duplicate;
        if (!original && !formatHint(rule.hint)) {
          await storage.local.set({
            [id]: { pattern, addedAt: rule.addedAt, hint: makeHint(phrase) },
          });
          return "hint-added";
        }
        return "exists";
      }

      const replacing = !samePattern(saved?.pattern, pattern);
      const hint = phrase && (replacing || !formatHint(saved?.hint)) ? makeHint(phrase) : saved?.hint;
      if (!replacing && hint === saved.hint) return "unchanged";

      const rule = { pattern, addedAt: saved?.addedAt ?? Date.now() };
      if (hint) rule.hint = hint;
      // Legacy IDs contain the old fingerprint. Move them when editing.
      if (original && replacing && !original.id.slice(prefix.length).includes("-")) {
        const id = prefix + crypto.randomUUID();
        await storage.local.set({ [original.id]: null, [id]: rule });
        await storage.local.remove(original.id).catch(() => {});
      } else {
        const id = original?.id ?? prefix + crypto.randomUUID();
        await storage.local.set({ [id]: rule });
      }
      return original ? "edited" : "added";
    });
  }

  function remove(id) {
    return withPhraseLock(() => storage.local.remove(id));
  }

  globalThis.NoBlasphemeCustom = Object.freeze({ watch, save, remove, setStyle, maxLength, formatHint });
})();
