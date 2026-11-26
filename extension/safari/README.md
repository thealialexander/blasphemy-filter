# NO BLASPHEMY for Safari

**By Ali Alexander** · **Version 1.8.1** · **November 25, 2026** · [MIT License](../../LICENSE)

One Safari Web Extension supplies the Mac, iPhone, and iPad editions. It shares the JavaScript, popup, icons, and rules with the desktop browser extension. The packager stages those files and adapts the manifest, then generates one Xcode project with macOS and iOS app and extension targets. Settings and custom phrases are stored locally in each browser. [Safari Web Extensions](https://developer.apple.com/documentation/safariservices/safari-web-extensions)

## Try it on a Mac

From the repository root, run:

```sh
python3 extension/safari/prepare.py --web-only
```

1. In Safari, open **Safari → Settings → Advanced** and enable **Show features for web developers**.
2. Go to **Settings → Developer → Add Temporary Extension**. In the folder picker, press **Command–Shift–G** and paste the full path printed by the command. It ends in `extension/safari/build/safari-…/WebExtension`. Select that **WebExtension** folder. Its top level contains the Safari-specific `manifest.json` beside `checker.html`. The `safari-…` part changes each time you run the command.
3. In **Settings → Extensions**, look under **Temporary** and make sure **NO BLASPHEMY** is checked.
4. Open a site you want filtered, such as `x.com`. If the toolbar icon shows an **orange exclamation mark**, click it to open Safari’s website-access prompt. Choose **Allow for One Day** for a quick test or **Always Allow on This Website** to keep access for that site. Repeat on other sites you want filtered. Safari also offers **Always Allow on Every Website…** if you want filtering across sites.
5. Refresh the page after granting access. Open **NO BLASPHEMY** again and click **Test**. A **Page scan complete** message confirms that the extension scanned the page, even when it reports zero matches.

To review or change a site’s access later, open **Safari → Settings → Extensions**, select **NO BLASPHEMY**, and choose **Edit Websites…**. If Safari asks again after you chose **Allow for One Day**, grant access again or choose the persistent per-site option. [Apple’s temporary installation guide](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension#Temporarily-install-a-web-extension-folder-in-macOS-Safari) · [Apple’s website-access settings](https://support.apple.com/en-us/102343)

## Build for Mac, iPhone, or iPad

Install Xcode and select it as the active developer directory. From the repository root, run:

```sh
python3 extension/safari/prepare.py
```

1. Open the `.xcodeproj` path printed by the command. Keep the project and staged web resources in their generated locations relative to each other.
2. Choose **NO BLASPHEMY (macOS)** for Mac or **NO BLASPHEMY (iOS)** for iPhone or iPad. Select a destination and run the containing app.
3. On Mac, manage the extension in **Safari → Settings → Extensions**. On iPhone or iPad, open **Settings → Apps → Safari → Extensions**, enable **NO BLASPHEMY**, and grant access to the sites you want filtered. Open Safari and load a webpage.

For a physical iPhone or iPad, configure Xcode signing for both iOS targets and use a bundle ID registered to your team. Pass `--bundle-id your.registered.identifier` to the script to set the app’s bundle ID when generating the project. Public distribution uses a signed app through Apple’s distribution process. [Apple’s Xcode packaging guide](https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari) · [Apple’s distribution guide](https://developer.apple.com/documentation/safariservices/distributing-your-safari-web-extension)

## Safari coverage

The Safari manifest requests access to HTTP and HTTPS pages. It uses Safari’s standard content scripts for matching and reveal controls, including eligible web frames. Safari output omits Chromium’s fallback injection into special URL frames and its main-world hook for late-attached shadow roots. **Test** can discover open shadow roots already present when it scans. See the [main README](../../README.md) for the filtering methodology and use of **Test**, censor styles, and custom phrases.

The generator creates a fresh build folder each time. Make feature changes in the shared `extension/` source, then rerun the generator to refresh the Safari output.

## Verification for 1.8.1

Both unsigned targets built in Xcode. On desktop Safari, the temporary extension installed successfully and completed scans on two X pages after access to `x.com` was granted. An isolated macOS WebKit view also passed tests for newly inserted post text, reveal and re-cover, and scan counts. The iPhone Simulator passed a WebKit extension test covering automatic masking, the popup, reveal and re-cover, **Test** completion, style changes, and custom rules. A physical iPhone or iPad install remains to be verified.
