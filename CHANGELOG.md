# Changelog

Changes for NO BLASPHEMY are listed newest first. Changes awaiting a release go under **Unreleased**.

## Unreleased

- Updated the extension description to emphasize its purpose, offline operation, and free availability.
- Added Safari packaging from the shared extension source, with macOS and iPhone/iPad targets, Safari installation instructions, and platform-specific coverage notes.
- Verified the Apple builds and shared assets. Tested mobile filtering, reveal, styles, manual rescans, and custom rules in an iPhone Simulator WebKit host. Tested initial and newly appended text, reveal, and scan counts in macOS WebKit.
- Verified temporary installation and site access in desktop Safari against two X pages. Documented the generated folder to select and the permission prompt behind Safari’s orange exclamation mark. Physical iPhone or iPad installation remains unverified.
- Added contributor instructions for keeping the browser versions, docs, and release history in sync.

## 1.8.1 · 2026-11-25

- **Test** now reports when the scan completes and how many matches it found on the main page, including zero.

## 1.8.0 · 2026-11-25

- Renamed the button to **Test** and made it rescan the active tab, including when the text box is empty. A rescan covers previously revealed matches.
- Replaced the gold toolbar artwork with a high-contrast black-and-white cross.

## 1.7.0 · 2026-11-25

- Added the gold cross on limestone toolbar icon, simplified the checker, and removed the sample-test feature.

## 1.6.0 · 2026-11-25

- Made **Blur** the default for fresh installs and retained each profile’s last selected style.
- Simplified the popup labels and removed source labels from custom phrases.

## 1.5.0 · 2026-11-25

- Bundled the responsive Roman frame with the cross carved into its centered keystone.

## 1.4.0 · 2026-11-25

- Added fixed, starred hints for saved phrases and a way to generate hints for older entries by pasting the same phrase again.

## 1.3.0 · 2026-11-25

- Renamed the extension **NO BLASPHEMY** and widened the popup.
- Added **Blackout**, **Blur**, and the opening line of **Exodus 20:7 RSVCE** as censor styles.
- Added editing for saved phrases.

## 1.2.0 · 2026-11-25

- Added locally saved custom phrases represented by numeric fingerprints. Adding or removing a rule updates open pages.

## 1.1.0 · 2026-11-25

- Added the offline toolbar checker and recognition of common profane exclamations involving “holy,” including some respellings and symbol substitutions.

## 1.0.0 · 2026-11-25

- Added offline webpage filtering with numeric fingerprints, contextual rules, click-to-reveal masks, and automatic handling of newly loaded text.
