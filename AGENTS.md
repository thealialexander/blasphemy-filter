# Browser extension parity

- Use `thealialexander/blasphemy-filter` on GitHub as the source of truth. Fetch `origin/main` before making changes, publish approved changes there, and verify the local checkout matches it afterward. Regenerate local Safari packages when their shared inputs change and reload installed extensions when needed.
- Treat `extension/` as the shared source for Chrome, Edge, Firefox, and Safari. Update the matcher, fingerprints, custom phrase storage, censor styles, popup, and icons there once.
- Generate Safari resources and Xcode targets with `python3 extension/safari/prepare.py`. Keep Safari-specific manifest adjustments in that script and document their effect in `extension/safari/README.md`.
- Keep literal expressions out of source, documentation, and committed fixtures. Use numeric fingerprints for matching and derive saved hints from partial numeric data. Keep filtering and preferences local.
- Keep automatic updates event-driven. Scan affected sections in batches when the page changes, and preserve the full rescan when the user selects **Test**.
- Record user-visible changes, compatibility differences, and important fixes in the [changelog](CHANGELOG.md) under **Unreleased**. Move the entries to a dated version heading at release time and keep the README linked to the changelog.
- Keep both README versions and dates aligned with the current release. Use `extension/manifest.json` as the source of truth for the version. The Safari packager derives the Apple marketing version from the same manifest.
- For feature changes, check automatic filtering, **Test** and its completion count, reveal and re-cover behavior, all three censor styles, and custom phrase persistence and editing. For Safari changes, check desktop and narrow popup layouts and build the macOS and iOS targets. Record any platform behavior you could not verify.
