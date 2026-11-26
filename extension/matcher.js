(() => {
  "use strict";

  function fingerprint(word) {
    const normalized = word.normalize("NFKC").toLowerCase()
      .replace(/[\p{Cf}]/gu, "")
      .replace(/[’‘]/g, "'");
    let fnv = 0x811c9dc5;
    let djb = 0x1505;
    for (let i = 0; i < normalized.length; i++) {
      const unit = normalized.charCodeAt(i);
      fnv = Math.imul(fnv ^ unit, 0x01000193);
      djb = Math.imul(djb, 33) ^ unit;
    }

    // Pack 32 + 21 bits into an integer that JavaScript represents exactly.
    return (fnv >>> 0) * 0x200000 + (djb & 0x1fffff);
  }

  const wordChoices = (...keys) => keys.map(key => [key]);
  const words = (...choices) => wordChoices(...choices.map(fingerprint));

  // Fingerprints use the same normalization and hash as tokens from a page.
  // These values are compared directly. The matcher never decodes a word list.
  const [generalName, personalName, messianicTitle, lordTitle] = [
    0x90373dfa73c69, 0xa18a573a7b61f, 0x1097ffb0bc312, 0x1e864a1f4f25d0,
  ];
  const otherNames = wordChoices(0x5a10c6662f38f, 0x17841f91177532, 0x17ec2677ad9a2d);
  const fatherTitle = 0x161fdc4c6b1129;
  const sonTitle = 0x1c06c74f679077;
  const spiritTitle = 0x18c5fa3d0aa5e0;
  const ghostTitle = 0xf08007a0536a2;
  const holy = 0x1758cbc5f13497;
  const trinityTitle = 0x12dc14dd8be1c0;
  const almightyTitle = 0x2348c52dbfe2e;
  const heavenly = 0x1bc666cda85601;
  const heaven = 0x19138c9c0d494;

  const curses = wordChoices(
    0x1b75f7a3aadbe3, 0x10fc3f173148dd, 0x1949eaac915c82, 0x1b48ce87115d1e,
    0x1d8023a87cfde3, 0x874e685465830, 0x10106f44cf949e,
  );
  const intensifiers = wordChoices(
    0x1127b9b6daee1e, 0xc79f49ff5c7f7, 0x17deb2878daca0, 0x57511f686af9e,
    0x103a350c4e8e10, 0x1a43e1f458df98, 0x19763ab473436, 0x110042daa9a54f,
    0xf2179738838ee, 0x1b75f7a3aadbe3, 0x1949eaac915c82, 0x18f74190c8640e,
    0x117efcaaaa8359, 0x1ccee9a94e687e,
  );
  const attacks = wordChoices(
    0x1ccee9a94e687e, 0x880b505eb2095, 0x11a8083eaf1717,
  );
  const insults = wordChoices(
    0x12549ff21c75ea, 0x102c042e0f7136, 0x14eb33ed0d5dba, 0xd89ff9a082254,
    0xb341b57f49813, 0x5a04f4358761, 0x179bf7393f9169, 0x1fa885e405c7a6,
    0xf935cc7f0f4a9, 0x6f00d10c18448, 0xbecd2f7d3dbc2, 0xc983f91428342,
    0xaf095453665ab, 0x123710fa7d7311, 0x1b008412276839, 0x1fdb1606af1b73,
    0x1f84e4907fa3eb, 0xfacfb36486b6a, 0x11ce918eba793, 0x8490039630b13,
    0xb0a2b6a4fa49a, 0x42b012a8e146c, 0x13f368151b58ce, 0x188eb0a6ce95a8,
    0x120ecc89576080,
  );
  const standaloneExpressions = wordChoices(
    0x110042daa9a54f, 0x731f328282331, 0xd250690083872, 0xf2179738838ee,
    0x1d440cd3290501, 0x18625023139ab0, 0x190a8be67c4d53, 0x10314ea56f450f,
    0x182934ea5e4f5c, 0x328e383cceeb2, 0x1585ea55475c20, 0x1f703935d2e026,
    0x16dd6978c7688a,
  );
  const profaneExclamations = wordChoices(
    0x150add6679abc3, 0x65f95cf6f1aaf, 0xada8f0c4f2446, 0x171c29ad79a21b,
    0x1505c91879a9d3, 0x10480bcb30efc5, 0x38e2efcd15c88, 0x1ccee9a94e687e,
    0x15bb7007a7397d, 0xb513125d5aab0, 0x11c964d49599fe, 0x1b75f7a3aadbe3,
  );
  const maskedExclamations = new Set([
    0x16ddc2c719a360, 0x70a39084e0a8a, 0x12dbe588d88aa2, 0x109db8f059a33e,
    0x1d4a29af0e0ad4, 0x17210b9b79a40b, 0x18baf015ed18e1, 0x17cc7f76cd0f08,
    0x1fec8c412d0f49, 0x1bbd24c26e60d7,
  ]);
  const singular = [generalName, personalName, messianicTitle, lordTitle];
  const fullSonName = [personalName, messianicTitle];
  const middleInitial = fingerprint("h");
  const the = fingerprint("the");
  const of = fingerprint("of");

  const names = [
    ...wordChoices(...singular, almightyTitle),
    ...otherNames,
    fullSonName,
    [messianicTitle, personalName],
    [personalName, middleInitial, messianicTitle],
    [lordTitle, personalName],
    [lordTitle, ...fullSonName],
    [lordTitle, generalName],
    [generalName, almightyTitle],
    [almightyTitle, generalName],
    [the, lordTitle],
    [generalName, the, fatherTitle],
    [generalName, the, sonTitle],
    [fatherTitle, generalName],
    [heavenly, fatherTitle],
    [fatherTitle, fingerprint("in"), heaven],
    [holy, spiritTitle],
    [holy, ghostTitle],
    [spiritTitle, of, generalName],
    [holy, trinityTitle],
  ];

  const emphasis = [
    ...intensifiers,
    ...intensifiers.map(word => [word[0], fingerprint("ass")]),
  ];
  const interjections = words("oh", "ohh", "ohhh");
  const interjectionKeys = new Set(interjections.map(([key]) => key));
  const mildAddressNames = wordChoices(generalName, lordTitle, almightyTitle);
  const prayerContinuation = /^(?:[\s,!.:;—–-]+|$)(?:(?:please\s+)?(?:hear|help|save|bless|forgive|guide|protect|deliver|lead|teach|heal|strengthen|receive|comfort|grant|show|fill|renew|have mercy|be with|be praised|come to|be glorified|come upon)\b|(?:i|we)\s+(?:pray|ask|thank|trust|need|praise|believe|love|worship|repent|confess|adore|offer|seek|call upon|give thanks|give you)\b|(?:in|by|through)\s+(?:your|thy)\b|(?:you|thou)\s+(?:are|art|have|hast|alone)\b|is\s+(?:good|great|faithful|holy|love)\b|our\s+(?:father|creator|savior|saviour)\b|amen\b)/iu;
  const prayerLeadIn = /\b(?:prayed|praying|prayer|prays|we pray|i pray|supplication|invocation|hymn)\s*(?:(?:to|and said|saying)\s*)?[:,“"‘']*\s*$/iu;
  const conversation = /^[\s]*,\s*(?:what|why|how|no|yes|really|well|look|wow|man|dude|that|this|come on)\b/iu;

  function passesContext(condition, text, start, end) {
    if (condition === "always") return true;

    const before = text.slice(Math.max(0, start - 100), start);
    const after = text.slice(end, end + 150);
    if (prayerLeadIn.test(before) || prayerContinuation.test(after)) return false;
    if (condition === "interjection") return true;

    const startsClause = start === before.length && /^[\s"'“‘([{]*$/u.test(before)
      || /[.!?;:—–]\s*["'“‘([{]*\s*$/u.test(before);
    if (condition === "clause") return startsClause;
    if (condition === "address") return startsClause && (/^\s*!/u.test(after) || conversation.test(after));
    return startsClause && /^\s*!/u.test(after);
  }

  function trieNode() {
    return { next: new Map(), conditions: new Set() };
  }

  const dictionary = trieNode();
  let customDictionary = trieNode();

  function insertPath(node, keys) {
    for (const key of keys) {
      if (!node.next.has(key)) node.next.set(key, trieNode());
      node = node.next.get(key);
    }
    return node;
  }

  function addRule(condition, ...slots) {
    function insert(node, slot) {
      if (slot === slots.length) {
        node.conditions.add(condition);
        return;
      }

      for (const choice of slots[slot]) {
        insert(insertPath(node, choice), slot + 1);
      }
    }
    insert(dictionary, 0);
  }

  // Swearing formulas, compounds, explicit insults, and emphatic variants.
  addRule("always", standaloneExpressions);
  addRule("always", names, curses);
  addRule("always", curses, names);
  addRule("always", attacks, names);
  addRule("always", intensifiers, names);
  addRule("always", wordChoices(personalName), emphasis, wordChoices(messianicTitle));
  addRule("always", wordChoices(holy), emphasis, wordChoices(spiritTitle, ghostTitle, trinityTitle));
  addRule("always", wordChoices(holy), [[], ...emphasis], [
    ...profaneExclamations,
    ...wordChoices(...maskedExclamations),
  ]);
  addRule("always", wordChoices(generalName), words("the"), emphasis, wordChoices(fatherTitle, sonTitle));
  addRule("always", wordChoices(heavenly), emphasis, wordChoices(fatherTitle));
  const articles = [[], ...words("a", "an", "just"), [fingerprint("such"), fingerprint("a")]];
  addRule("always", names, words("is"), articles, insults);
  addRule("always", names, words("'s"), [[], ...words("a", "an")], insults);
  addRule("always", words("for"), names, words("'s"), words("sake"));
  addRule("always", words("what", "why", "how"), words("in"), names, words("'s"), words("name"));
  addRule("always", words("swear"), words("to", "on"), names);

  // Lighter exclamations use punctuation and devotional context.
  addRule("interjection", interjections, [[], ...words("my")], [[], ...emphasis], names);
  addRule("clause", words("good"), mildAddressNames);
  addRule("address", words("dear", "my"), names);
  addRule("address", names);
  addRule("exclamation", words("by", "on"), mildAddressNames);
  addRule("exclamation", wordChoices(lordTitle), [[fingerprint("have"), fingerprint("mercy")]]);

  const tokenPattern = /[\p{L}\p{M}\p{N}_][\p{L}\p{M}\p{N}_\p{Cf}]*|['’‘][sS](?![\p{L}\p{M}\p{N}_])/gu;
  const maskedWordEnd = /(?:\\?\*)+[\p{L}\p{M}\p{N}_\p{Cf}]*|![\p{L}\p{M}\p{N}_\p{Cf}]+/uy;
  const wordGap = /^[\s\p{Cf}\p{Pd}]*$/u;
  const initialGap = /^\.[\s\p{Cf}]*$/u;
  const interjectionGap = /^[\s\p{Cf}]*,[\s\p{Cf}]*$/u;

  function tokenize(text) {
    const tokens = [];
    let previousEnd = 0;
    let previousKey;
    for (const match of text.matchAll(tokenPattern)) {
      const start = match.index;
      if (start < previousEnd) continue;
      let end = start + match[0].length;
      let key = fingerprint(match[0]);

      // Join masking punctuation only when the whole word is a known variant.
      maskedWordEnd.lastIndex = end;
      if (maskedWordEnd.test(text)) {
        const maskedEnd = maskedWordEnd.lastIndex;
        const maskedKey = fingerprint(text.slice(start, maskedEnd).replaceAll("\\*", "*"));
        if (maskedExclamations.has(maskedKey)) {
          end = maskedEnd;
          key = maskedKey;
        }
      }

      const gap = text.slice(previousEnd, start);
      const joinsPrevious = wordGap.test(gap)
        || (previousKey === middleInitial && initialGap.test(gap))
        || (interjectionKeys.has(previousKey) && interjectionGap.test(gap));
      tokens.push({ start, end, key, joinsPrevious });
      previousEnd = end;
      previousKey = key;
    }
    return tokens;
  }

  const customTokenPattern = /[\p{L}\p{M}\p{N}_][\p{L}\p{M}\p{N}_\p{Cf}]*(?:['’‘][\p{L}\p{M}\p{N}_][\p{L}\p{M}\p{N}_\p{Cf}]*)*|[^\s\p{Cf}]/gu;

  function tokenizeCustom(text) {
    return Array.from(text.matchAll(customTokenPattern), match => ({
      start: match.index,
      end: match.index + match[0].length,
      key: fingerprint(match[0]),
    }));
  }

  function customPattern(phrase) {
    if (!/[\p{L}\p{N}]/u.test(phrase)) return [];
    return tokenizeCustom(phrase).map(token => token.key);
  }

  function setCustomRules(patterns) {
    customDictionary = trieNode();
    for (const keys of patterns) {
      insertPath(customDictionary, keys).conditions.add("always");
    }
  }

  function findTokenMatches(text, tokens, root, builtIn) {
    const matches = [];
    for (let i = 0; i < tokens.length; i++) {
      const start = tokens[i].start;
      if (builtIn && start > 0 && /[@#/]/.test(text[start - 1])) continue;

      let cursor = root;
      let lastMatch = i - 1;

      for (let j = i; j < tokens.length; j++) {
        const token = tokens[j];
        if (j > i && token.joinsPrevious === false) break;
        cursor = cursor.next.get(token.key);
        if (!cursor) break;
        if (builtIn && /[/@]/.test(text[token.end] || "")) continue;

        for (const condition of cursor.conditions) {
          if (!passesContext(condition, text, start, token.end)) continue;
          lastMatch = j;
          break;
        }
      }

      if (lastMatch >= i) {
        matches.push({ start, end: tokens[lastMatch].end });
        if (builtIn) i = lastMatch;
      }
    }

    return matches;
  }

  function findMatches(text) {
    const builtIn = findTokenMatches(text, tokenize(text), dictionary, true);
    if (!customDictionary.next.size) return builtIn;

    const custom = findTokenMatches(text, tokenizeCustom(text), customDictionary, false);
    if (!custom.length) return builtIn;

    const matches = [];
    for (const range of [...builtIn, ...custom].sort((a, b) => a.start - b.start)) {
      const previous = matches.at(-1);
      if (previous && range.start < previous.end) {
        previous.end = Math.max(previous.end, range.end);
      } else {
        matches.push(range);
      }
    }
    return matches;
  }

  globalThis.NoBlaspheme = Object.freeze({ findMatches, customPattern, setCustomRules });
})();
