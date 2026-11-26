(() => {
  "use strict";

  const defaultStyle = "blur";
  const styles = new Set(["blackout", defaultStyle, "scripture"]);
  const reference = "Exodus 20:7 RSVCE";
  const scripture = "“You shall not take the name of the Lord your God in vain…” " + reference;

  function normalizeStyle(value) {
    return styles.has(value) ? value : defaultStyle;
  }

  function render(element, original, style, first = true, revealed = false) {
    element.replaceChildren();
    element.style.display = "";
    element.style.backgroundColor = "";
    element.style.color = "";
    element.style.userSelect = "";
    element.dataset.noBlasphemeStyle = style;

    if (revealed) {
      element.textContent = original;
    } else if (style === "scripture") {
      if (first) {
        element.textContent = scripture;
      } else {
        element.style.display = "none";
      }
    } else if (style === "blur") {
      const blurred = element.ownerDocument.createElement("span");
      blurred.textContent = original;
      blurred.style.display = "inline-block";
      blurred.style.maxWidth = "100%";
      blurred.style.overflowWrap = "anywhere";
      blurred.style.filter = "blur(0.32em)";
      blurred.setAttribute("aria-hidden", "true");
      element.style.userSelect = "none";
      element.append(blurred);
    } else {
      element.textContent = original.replace(/\S+/gu, "•••");
      element.style.backgroundColor = "#111";
      element.style.color = "#111";
      element.style.userSelect = "none";
    }
  }

  globalThis.NoBlasphemyMask = Object.freeze({ defaultStyle, normalizeStyle, render, scripture });
})();
