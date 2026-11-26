(() => {
  "use strict";

  const { findMatches, setCustomRules } = globalThis.NoBlaspheme;
  const { save, remove, watch, setStyle, maxLength, formatHint } = globalThis.NoBlasphemeCustom;
  const { defaultStyle, render } = globalThis.NoBlasphemyMask;
  const form = document.querySelector("#checker");
  const sample = document.querySelector("#sample");
  const status = document.querySelector("#status");
  const pageStatus = document.querySelector("#page-status");
  const tabs = (globalThis.browser ?? globalThis.chrome).tabs;
  const preview = document.querySelector("#preview");
  const redacted = document.querySelector("#redacted");
  const checkButton = form.querySelector('button[type="submit"]');
  const addButton = document.querySelector("#add");
  const custom = document.querySelector("#custom");
  const customSummary = custom.querySelector("summary");
  const customList = document.querySelector("#custom-list");
  const styleSelect = document.querySelector("#mask-style");
  const editForm = document.querySelector("#edit-form");
  const editLabel = document.querySelector("#edit-label");
  const hintHelp = document.querySelector("#hint-help");
  const replacement = document.querySelector("#replacement");
  const saveReplacement = document.querySelector("#save-replacement");
  const cancelEdit = document.querySelector("#cancel-edit");
  const editStatus = document.querySelector("#edit-status");
  let loaded = false;
  let style = defaultStyle;
  let checkedText = null;
  let pageRequest = 0;
  let editing = null;
  let savingEdit = false;

  function showResult(message, maskedText = null) {
    status.textContent = message;
    redacted.replaceChildren();
    if (maskedText) redacted.append(maskedText);
    preview.hidden = !maskedText;
    if (!maskedText) checkedText = null;
  }

  function checkText(text) {
    const matches = findMatches(text);
    if (!matches.length) {
      showResult("No matches.");
      return;
    }

    const pieces = document.createDocumentFragment();
    let cursor = 0;
    for (const { start, end } of matches) {
      const mask = document.createElement("span");
      render(mask, text.slice(start, end), style);
      if (style !== "scripture") {
        mask.setAttribute("role", "img");
        mask.setAttribute("aria-label", "Hidden expression");
      }
      pieces.append(text.slice(cursor, start), mask);
      cursor = end;
    }
    pieces.append(text.slice(cursor));
    checkedText = text;
    showResult(matches.length === 1 ? "1 match." : matches.length + " matches.", pieces);
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (sample.value.trim()) checkText(sample.value);
    else showResult("");

    const request = ++pageRequest;
    pageStatus.textContent = "Scanning page…";
    try {
      const [tab] = await tabs.query({ active: true, currentWindow: true });
      const result = await tabs.sendMessage(tab.id, { type: "rescan-page" });
      if (!Number.isSafeInteger(result?.matches)) throw new Error("Page is unavailable.");
      const count = result.matches;
      if (request === pageRequest) {
        pageStatus.textContent = count === 0
          ? "Page scan complete. No matches on the main page."
          : "Page scan complete. " + count + (count === 1 ? " match" : " matches") + " on the main page.";
      }
    } catch {
      if (request === pageRequest) pageStatus.textContent = "This tab couldn’t be scanned. If it’s a webpage, try reloading it.";
    }
  });

  sample.addEventListener("input", () => showResult(""));

  addButton.addEventListener("click", async () => {
    addButton.disabled = true;
    const text = sample.value;
    try {
      const result = await save(text);
      if (result === "empty") {
        showResult("Paste a phrase to add.");
        sample.focus();
      } else if (result === "too-long") {
        showResult("Use " + maxLength + " characters or fewer to add a phrase.");
        sample.focus();
      } else {
        if (sample.value === text) sample.value = "";
        if (result !== "exists") custom.open = true;
        showResult({
          exists: "Phrase already saved.",
          "hint-added": "Masked hint added to the saved phrase.",
          added: "Custom phrase added.",
        }[result]);
      }
    } catch {
      showResult("The phrase could not be saved.");
    } finally {
      addButton.disabled = false;
    }
  });

  styleSelect.addEventListener("change", async () => {
    const requested = styleSelect.value;
    try {
      await setStyle(requested);
    } catch {
      if (styleSelect.value === requested) styleSelect.value = style;
      showResult("The censor style could not be saved.");
    }
  });

  function closeEditor() {
    editing = null;
    editForm.hidden = true;
    replacement.value = "";
    editStatus.textContent = "";
  }

  cancelEdit.addEventListener("click", () => {
    closeEditor();
    customSummary.focus();
  });

  editForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!editing || savingEdit) return;
    savingEdit = true;
    saveReplacement.disabled = true;
    cancelEdit.disabled = true;
    try {
      const result = await save(replacement.value, editing);
      if (result === "edited" || result === "unchanged" || result === "changed") {
        closeEditor();
        const message = {
          edited: "Custom phrase updated.",
          unchanged: "Phrase is unchanged.",
          changed: "This phrase changed in another window. Open it again to edit.",
        }[result];
        showResult(message);
        if (custom.hidden) sample.focus();
        else customSummary.focus();
      } else {
        editStatus.textContent = {
          empty: "Paste a phrase with at least one letter or number.",
          "too-long": "Use " + maxLength + " characters or fewer.",
          exists: "That phrase is already saved as another rule.",
        }[result];
        replacement.focus();
      }
    } catch {
      editStatus.textContent = "The changes could not be saved.";
    } finally {
      savingEdit = false;
      saveReplacement.disabled = false;
      cancelEdit.disabled = false;
    }
  });

  watch((rules, savedStyle) => {
    checkButton.disabled = false;
    styleSelect.disabled = false;
    if (!loaded) addButton.disabled = false;
    loaded = true;
    style = savedStyle;
    styleSelect.value = style;
    setCustomRules(rules.map(rule => rule.pattern));
    if (checkedText !== null) checkText(checkedText);
    custom.hidden = !rules.length;
    customSummary.textContent = "Custom phrases (" + rules.length + ")";
    customList.replaceChildren();
    if (editing && !savingEdit && !rules.some(rule => rule.id === editing.id)) closeEditor();

    rules.sort((a, b) => a.addedAt - b.addedAt).forEach((rule, index) => {
      const label = "Phrase " + (index + 1);
      const item = document.createElement("li");
      const display = document.createElement("div");
      display.className = "rule-name";
      const hint = formatHint(rule.hint);
      const identity = document.createElement("span");
      identity.textContent = hint || label;
      if (hint) identity.className = "rule-hint";
      display.append(identity);
      item.append(display);

      const actions = document.createElement("div");
      actions.className = "rule-actions";
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edit";
      editButton.setAttribute("aria-label", "Edit " + label.toLowerCase());
      editButton.addEventListener("click", () => {
        if (savingEdit) return;
        editing = rule;
        editLabel.textContent = "Edit " + label.toLowerCase();
        hintHelp.hidden = Boolean(hint);
        editForm.hidden = false;
        replacement.value = "";
        editStatus.textContent = "";
        replacement.focus();
      });
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Remove";
      button.setAttribute("aria-label", "Remove " + label.toLowerCase());
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          await remove(rule.id);
          showResult("Custom phrase removed.");
          if (custom.hidden) sample.focus();
          else customSummary.focus();
        } catch {
          showResult("The phrase could not be removed.");
          button.disabled = false;
        }
      });
      actions.append(editButton, button);
      item.append(actions);
      customList.append(item);
    });
  }, () => {
    checkButton.disabled = false;
    showResult("Custom phrases could not be loaded.");
  });
})();
