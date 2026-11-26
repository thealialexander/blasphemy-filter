"""Stage shared web resources and optionally create both Safari app targets."""

import argparse
import json
from pathlib import Path
import re
import shutil
import subprocess
import tempfile


SAFARI_DIR = Path(__file__).resolve().parent
WEB_SOURCE = SAFARI_DIR.parent
APP_NAME = "NO BLASPHEMY"


def stage_web_extension(destination):
    shutil.copytree(WEB_SOURCE, destination, ignore=shutil.ignore_patterns("safari", ".*"))
    manifest_path = destination / "manifest.json"
    manifest = json.loads(manifest_path.read_text())

    # The native Safari packager does not support these static-script options.
    scripts = []
    for script in manifest["content_scripts"]:
        if script.get("world") == "MAIN":
            if script["js"] != ["shadow-roots.js"]:
                raise ValueError("Review Safari support for the new main-world content script.")
            continue
        for key in ("match_about_blank", "match_origin_as_fallback"):
            script.pop(key, None)
        script["matches"] = [pattern for pattern in script["matches"] if not pattern.startswith("file:")]
        scripts.append(script)
    manifest["content_scripts"] = scripts
    manifest["host_permissions"] = sorted({pattern for script in scripts for pattern in script["matches"]})
    (destination / "shadow-roots.js").unlink(missing_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest["version"]


def configure_project(project, version):
    # Xcode's packager can create either an xcproj or a legacy pbxproj file.
    for path in (project / "project.xcproj", project / "project.pbxproj"):
        if path.is_file():
            source = path.read_text()
            if path.suffix == ".xcproj":
                setting = r'(?m)^([ \t]*)"MARKETING_VERSION"\s*:\s*"[^"]*",'
                updated, count = re.subn(setting, lambda match: (
                    f'{match[1]}"COMPRESS_PNG_FILES": "NO",\n{match[1]}"STRIP_PNG_TEXT": "NO",\n'
                    f'{match[1]}"MARKETING_VERSION": "{version}",'
                ), source)
            else:
                setting = r'(?m)^([ \t]*)MARKETING_VERSION\s*=\s*(?:"[^"]*"|[\d.]+);'
                updated, count = re.subn(setting, lambda match: (
                    f'{match[1]}MARKETING_VERSION = "{version}";\n{match[1]}COMPRESS_PNG_FILES = NO;\n'
                    f'{match[1]}STRIP_PNG_TEXT = NO;'
                ), source)
            if count:
                path.write_text(updated)
                return
    raise ValueError("Could not find the generated Xcode marketing version setting.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--web-only", action="store_true", help="Stage a folder for a temporary Mac Safari install.")
    parser.add_argument("--bundle-id", default="com.alialexander.noblasphemy", help="Bundle ID for the Apple app.")
    args = parser.parse_args()

    build_root = SAFARI_DIR / "build"
    build_root.mkdir(exist_ok=True)
    output = Path(tempfile.mkdtemp(prefix="safari-", dir=build_root))
    web = output / "WebExtension"
    version = stage_web_extension(web)
    print(f"Safari web extension {version}\n{web}", flush=True)
    if args.web_only:
        return

    project_output = output / "Xcode"
    project_output.mkdir()
    subprocess.run([
        "xcrun", "safari-web-extension-packager",
        "--project-location", str(project_output),
        "--app-name", APP_NAME, "--bundle-identifier", args.bundle_id,
        "--swift", "--no-open", "--no-prompt", str(web),
    ], check=True)
    project = project_output / APP_NAME / f"{APP_NAME}.xcodeproj"
    configure_project(project, version)
    print(f"Mac and iPhone/iPad Xcode project\n{project}")


if __name__ == "__main__":
    main()
