# NO BLASPHEMY for Safari

**By Ali Alexander** · **Version 1.8.1** · **November 25, 2026** · [MIT License](../../LICENSE)

One Safari Web Extension supplies the Mac, iPhone, and iPad editions. It shares the JavaScript, popup, icons, and rules with the desktop browser extension. The packager stages those files and adapts the manifest, then generates one Xcode project with macOS and iOS app and extension targets. Settings and custom phrases are stored locally in each browser. [Safari Web Extensions](https://developer.apple.com/documentation/safariservices/safari-web-extensions)

## Try it on a Mac

From the repository root, run:

```sh
python3 extension/safari/prepare.py --web-only
```

In a current Safari release, open **Safari → Settings → Advanced** and enable **Show features for web developers**. Open **Settings → Developer**, choose **Add Temporary Extension**, and select the generated `WebExtension` folder printed by the command. Grant the extension access to the sites you want to filter and reload any open pages. [Apple’s temporary installation guide](https://developer.apple.com/documentation/safariservices/running-your-safari-web-extension#Temporarily-install-a-web-extension-folder-in-macOS-Safari)

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

Both unsigned targets built in Xcode. The iPhone Simulator passed a WebKit extension test covering automatic masking, the popup, reveal and re-cover, **Test** completion, style changes, and custom rules. An isolated macOS WebKit view passed tests for initial and newly inserted post text, reveal and re-cover, and scan counts. Safari’s Mac enablement flow and a physical iPhone or iPad install remain to be verified.
