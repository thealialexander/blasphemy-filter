(() => {
  "use strict";

  const { findMatches, setCustomRules } = globalThis.NoBlaspheme;
  const { defaultStyle, render, scripture } = globalThis.NoBlasphemyMask;
  const blockTags = new Set((
    "address article aside blockquote body caption center dd details dialog div dl dt fieldset " +
    "figcaption figure footer form h1 h2 h3 h4 h5 h6 header hgroup hr legend li main menu nav " +
    "ol p pre section summary table tbody td tfoot th thead tr ul"
  ).split(" "));
  const excludedTags = new Set((
    "audio button canvas datalist embed iframe input noscript object option script " +
    "select style svg template textarea video"
  ).split(" "));
  const textBreaks = new Set(["br", "img", "math"]);
  const masks = new WeakMap();
  const replacements = new WeakSet();
  const observedShadows = new WeakSet();
  const pending = new Map();
  const runtime = (globalThis.browser ?? globalThis.chrome).runtime;
  let scanRound = 0;
  let manualScan;
  let maskStyle = defaultStyle;
  let body;
  let timer;

  function excluded(node) {
    return node.nodeType === Node.ELEMENT_NODE
      && (excludedTags.has(node.localName) || node.isContentEditable || masks.has(node));
  }

  function block(node) {
    return node.nodeType === Node.ELEMENT_NODE && blockTags.has(node.localName);
  }

  function enclosingScope(node) {
    let scope;
    for (let current = node; current; current = current.parentNode || current.host) {
      if (excluded(current)) return null;
      if (current === body) return scope || body;
      if (!scope && (block(current) || current instanceof ShadowRoot)) scope = current;
    }
    return null;
  }

  function queue(scope, deep) {
    pending.set(scope, deep || pending.get(scope) === true);
    if (timer === undefined) timer = setTimeout(processQueue, 0);
  }

  function watchShadow(element, deep = false) {
    const root = element.shadowRoot;
    if (!root) return;
    if (!observedShadows.has(root)) {
      observedShadows.add(root);
      observer.observe(root, observerOptions);
    } else if (!deep) {
      return;
    }
    queue(root, true);
  }

  function discoverBlocks(root) {
    const elements = [root];
    while (elements.length) {
      const element = elements.pop();
      if (excluded(element)) continue;
      if (block(element)) {
        queue(element, true);
        continue;
      }
      watchShadow(element);
      for (const child of element.children) elements.push(child);
    }
  }

  function collectEdits(run, edits) {
    const previousRanges = new Map();
    let length = 0;
    const sources = run.map(node => {
      const piece = masks.get(node);
      const value = piece ? piece.original : node.data;
      const from = length;
      length += value.length;

      if (piece) {
        const range = previousRanges.get(piece.group);
        if (range) {
          range.end = length;
          range.count++;
        } else {
          previousRanges.set(piece.group, { start: from, end: length, count: 1 });
        }
      }

      return { node, piece, value, from };
    });
    const matches = findMatches(sources.map(source => source.value).join(""));
    if (!matches.length && !previousRanges.size) return;

    // Keep existing controls and reveal state when a rule change leaves a match intact.
    const previousByStart = new Map();
    for (const [group, range] of previousRanges) {
      if (range.count === group.pieces.length) {
        previousByStart.set(range.start, { end: range.end, group });
      }
    }
    const groups = matches.map(({ start, end }) => {
      const previous = previousByStart.get(start);
      if (previous?.end !== end) return { revealed: false, pieces: [], round: scanRound };
      const group = previous.group;
      if (group.round !== scanRound) {
        group.revealed = false;
        group.round = scanRound;
      }
      return group;
    });
    if (manualScan) {
      for (const group of groups) manualScan.groups.add(group);
    }

    let matchIndex = 0;
    for (const { node, piece, value, from: offset } of sources) {
      const nodeEnd = offset + value.length;
      const parts = [];
      while (matchIndex < matches.length && matches[matchIndex].start < nodeEnd) {
        const { start, end } = matches[matchIndex];
        const from = Math.max(start - offset, 0);
        const to = Math.min(end - offset, value.length);
        if (/\S/u.test(value.slice(from, to))) {
          parts.push({ from, to, group: groups[matchIndex] });
        }
        if (end > nodeEnd) break;
        matchIndex++;
      }
      const unchanged = piece && parts.length === 1 && parts[0].group === piece.group
        && parts[0].from === 0 && parts[0].to === value.length;
      if (unchanged) {
        if (piece.style !== maskStyle || piece.revealed !== piece.group.revealed) {
          renderPiece(piece, piece.group.revealed);
        }
      } else if (parts.length || piece) {
        edits.push({ node, value, parts });
      }
    }
  }

  function renderPiece(piece, revealed) {
    const { element, original, first } = piece;
    const label = revealed ? "Hide expression" : "Reveal hidden expression";
    render(element, original, maskStyle, first, revealed);
    piece.style = maskStyle;
    piece.revealed = revealed;
    element.dataset.noBlaspheme = revealed ? "revealed" : "masked";
    element.title = label;
    if (first) {
      element.setAttribute("aria-pressed", String(revealed));
      if (revealed) element.removeAttribute("aria-label");
      else element.setAttribute("aria-label", maskStyle === "scripture" ? scripture + ". " + label : label);
    } else if (revealed) {
      element.removeAttribute("aria-hidden");
    } else {
      element.setAttribute("aria-hidden", "true");
    }
  }

  function makeMask(original, group) {
    const element = document.createElement("span");
    const first = group.pieces.length === 0;
    const piece = { element, original, first, group };
    group.pieces.push(piece);
    masks.set(element, piece);
    element.style.cursor = "pointer";
    element.style.borderRadius = "0.15em";
    if (first) {
      element.tabIndex = 0;
      element.setAttribute("role", "button");
    }

    function toggle(event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.repeat) return;
      group.revealed = !group.revealed;
      for (const part of group.pieces) renderPiece(part, group.revealed);
    }

    element.addEventListener("click", toggle);
    if (first) {
      element.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") toggle(event);
      });
    }
    renderPiece(piece, group.revealed);
    return element;
  }

  function applyEdits(edits) {
    for (const { node, value, parts } of edits) {
      const fragment = document.createDocumentFragment();
      let offset = 0;
      for (const { from, to, group } of parts) {
        if (from > offset) fragment.append(value.slice(offset, from));
        fragment.append(makeMask(value.slice(from, to), group));
        offset = to;
      }
      if (offset < value.length) fragment.append(value.slice(offset));

      replacements.add(node);
      node.replaceWith(fragment);
    }
  }

  function scan(scope, deep) {
    if (!enclosingScope(scope)) return;
    if (scope.nodeType === Node.ELEMENT_NODE) watchShadow(scope, deep);

    const edits = [];
    let run = [];
    function flushRun() {
      if (!run.length) return;
      collectEdits(run, edits);
      run = [];
    }

    let node = scope.firstChild;
    while (node) {
      let descend = false;
      if (masks.has(node) || (node.nodeType === Node.TEXT_NODE && node.length)) {
        run.push(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (excluded(node) || textBreaks.has(node.localName)) {
          flushRun();
        } else if (block(node)) {
          flushRun();
          if (deep) queue(node, true);
        } else {
          watchShadow(node, deep);
          descend = true;
        }
      }

      if (descend && node.firstChild) {
        node = node.firstChild;
      } else {
        while (node !== scope && !node.nextSibling) node = node.parentNode;
        node = node === scope ? null : node.nextSibling;
      }
    }
    flushRun();
    applyEdits(edits);
  }

  function processQueue() {
    const deadline = performance.now() + 8;
    for (const [scope, deep] of pending) {
      pending.delete(scope);
      scan(scope, deep);
      if (performance.now() >= deadline) break;
    }
    timer = pending.size ? setTimeout(processQueue, 0) : undefined;
    if (timer === undefined && manualScan) {
      const scan = manualScan;
      manualScan = undefined;
      let matches = 0;
      for (const group of scan.groups) {
        if (group.pieces.some(piece => piece.element.isConnected)) matches++;
      }
      for (const respond of scan.replies) respond({ matches });
    }
  }

  const observerOptions = { childList: true, characterData: true, subtree: true };
  const observer = new MutationObserver(records => {
    if (body !== document.body) {
      body = document.body;
      pending.clear();
      if (body) queue(body, true);
      return;
    }
    if (!body) return;

    for (const record of records) {
      if (record.removedNodes.length === 1 && replacements.delete(record.removedNodes[0])) continue;
      const scope = enclosingScope(record.target);
      if (!scope) continue;
      queue(scope, false);
      for (const node of record.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) discoverBlocks(node);
      }
    }
  });

  document.addEventListener("no-blaspheme-shadow-attached", event => {
    const host = event.composedPath()[0];
    if (host instanceof Element && enclosingScope(host)) watchShadow(host);
  }, { capture: true });

  observer.observe(document, observerOptions);
  body = document.body;
  if (body) queue(body, true);

  runtime.onMessage.addListener((message, _sender, respond) => {
    if (message?.type !== "rescan-page" || !body) return;
    if (!manualScan) {
      manualScan = { groups: new Set(), replies: [] };
      scanRound++;
      queue(body, true);
    }
    if (window !== window.top) return;
    manualScan.replies.push(respond);
    return true;
  });

  globalThis.NoBlasphemeCustom.watch((rules, style) => {
    maskStyle = style;
    setCustomRules(rules.map(rule => rule.pattern));
    if (body) queue(body, true);
  });
})();
