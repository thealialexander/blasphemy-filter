# NO BLASPHEMY

**By Ali Alexander** · **Version 1.8.1** · **November 25, 2026** · [MIT License](LICENSE)

NO BLASPHEMY is an offline browser extension for common English expressions that use the names of God the Father, the Son, or the Holy Spirit irreverently. It also catches common profane exclamations involving the word “holy,” including some respellings and symbol substitutions. The filter includes built-in rules and supports custom phrases.

[Changelog](CHANGELOG.md) · [Contributor instructions](AGENTS.md)

The changelog tracks released versions and work under **Unreleased**, including the Safari packaging and verification for this version.

## Install in Chrome or Edge

1. Download or clone this repository. If you downloaded a ZIP, extract it first.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Enable **Developer mode**, select **Load unpacked**, and choose the [`extension` folder](extension/) containing `manifest.json`.
4. Open **NO BLASPHEMY** from the browser’s Extensions menu. In Chrome, use the pin beside its name to keep the cross icon in the toolbar.
5. Refresh any webpages that were already open.

After updating the files, select **Reload** on the extension’s card and refresh the webpages you want to filter. To filter saved HTML files in Chrome or Edge, enable **Allow access to file URLs** in the extension’s details. [Chrome installation guide](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked) · [Edge installation guide](https://learn.microsoft.com/en-us/microsoft-edge/extensions/getting-started/extension-sideloading)

### Try it temporarily in Firefox

Open `about:debugging#/runtime/this-firefox`, choose **Load Temporary Add-on**, and select [`extension/manifest.json`](extension/manifest.json). Firefox removes temporary add-ons when it restarts. The current release was tested in Chrome. [Firefox temporary installation guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Your_first_WebExtension#trying_it_out)

### Safari on Mac, iPhone, and iPad

The Safari build shares the same web extension source and uses one Xcode project for the Mac and mobile targets. On Mac, **Add Temporary Extension** takes the generated `WebExtension` folder. If the toolbar icon shows an orange exclamation mark, open it and grant access to the site you want to filter. See the [Safari README](extension/safari/README.md) for the exact folder path, permission choices, Xcode builds, and Safari-specific coverage.

## Use the filter

- **Browse.** The filter checks webpage text automatically as it loads or changes.
- **Reveal a match.** Click the mask, or focus it and press **Enter** or **Space**. Activate it again to cover the expression.
- **Rescan a page.** Select **Test** with the box empty. This reapplies the rules to the active tab, covers previously revealed matches, and reports the number of matches on the main page when the scan finishes.
- **Check pasted text.** Paste text and select **Test**. The pane shows a filtered preview when the pasted text has matches and also rescans the active tab.

Choose **Blackout**, **Blur**, or **Exodus 20:7 RSVCE** from the toolbar dropdown. The verse option displays the opening line and reference once per match. The browser remembers your last style locally and starts with **Blur** on a fresh install. The selected style applies to both webpages and the popup preview. [Exodus 20:7 RSVCE](https://www.biblegateway.com/passage/?search=Exodus+20%3A7&version=RSVCE)

The toolbar uses a high-contrast black-and-white cross. The popup prefers a 500-pixel width, wraps controls in narrower space, and keeps the Roman keystone and its carved cross centered above the scrolling content.

## Add your own phrases

Paste an expression and choose **Add phrase**. The rule takes effect on open pages. Custom rules match whole words and punctuation while allowing differences in capitalization and spacing between tokens.

**Custom phrases** shows fixed, starred hints. A hint stores up to eight word lengths and at most one letter per longer word as numbers. Open **Edit** to replace a phrase. Choose **Remove** to delete a rule.

Rules saved before hints were introduced keep their original filters. To add a hint to an existing numbered entry, paste the same phrase again and choose **Add phrase**.

## Methodology

1. **Fingerprint the text.** The matcher splits text into tokens, normalizes Unicode and casing, and computes a deterministic 53-bit fingerprint from two integer hashes. Built-in rules contain numeric fingerprints and patterns. The literal expressions are absent from the source.
2. **Match sequences and context.** The matcher walks prefix trees of fingerprint sequences. Built-in rules also use nearby wording and punctuation to help preserve ordinary references and recognizable prayer. Custom phrases use the token sequence you save.
3. **Mask the matched ranges.** The content script groups text across inline formatting, tracks page changes, and applies the selected style. It retains the original wording in page memory so a reveal restores the exact text.

### New posts and browser workload

A page observer notices new or changed text, such as posts added while scrolling. The extension queues the affected sections, combines repeated changes, and scans in short batches. Idle pages have no recurring scan. **Test** explicitly rescans the active page. Work grows with the amount of text the site inserts or changes, so a burst of new posts or a full rescan can briefly use more CPU.

### Privacy and coverage

Matching runs entirely in the browser without accounts, network requests, or runtime dependencies. The extension saves custom fingerprints, numeric hint data, and the style setting in browser-local storage. It processes raw custom phrases during entry and saves their numeric representations.

The filter scans supported webpage text, including eligible frames and open shadow roots. The **Test** count covers the main page. Editable fields, form controls, browser settings pages, PDFs, and text drawn into images or video fall outside the filter’s coverage. Context rules are approximate, so ambiguous uses may be missed or masked.

## License

Copyright © 2026 Ali Alexander. The extension’s source code and original artwork are available under the [MIT License](LICENSE).

The Scripture excerpt is from the Catholic Edition of the Revised Standard Version, copyright © 1965, 1966 National Council of the Churches of Christ in the United States of America. [RSVCE credit](https://www.biblegateway.com/passage/?search=Exodus+20%3A7&version=RSVCE)
