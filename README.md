<p align="center">
  <img src="assets/generated/repo-cover-1280x640.png" alt="Shorts Keyboard Controls artwork" width="100%" />
</p>

<h1 align="center">Shorts Keyboard Controls</h1>

<p align="center">
  The keyboard controls YouTube, Shorts, and YouTube Music should already have.
</p>

<p align="center">
  <a href="https://github.com/Asforaa/shorts-keyboard-controls/releases/latest"><img alt="Latest release" src="https://img.shields.io/github/v/release/Asforaa/shorts-keyboard-controls?style=flat-square&color=ff4343" /></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-171717?style=flat-square" /></a>
  <img alt="Manifest V3" src="https://img.shields.io/badge/Manifest-V3-171717?style=flat-square" />
</p>

## What it does

- Press `L` to like or remove your Like from the current video, Short, or YouTube Music track.
- Press `←` or `→` to seek backward or forward on videos, Shorts, and YouTube Music.
- Press `K` or `J` to move to the previous or next Short.
- Press `;` to open or close the Shorts comments panel.
- Press `[` or `'` to scroll up or down inside Shorts comments.
- Change every key, seek duration, scroll amount, and feature toggle from the toolbar popup.
- Ignore shortcuts while you are typing in search, comments, or another text field.
- Show no injected notifications, overlays, analytics, or ads.

## Settings

<p align="center">
  <img src="assets/screenshots/settings-popup.png" alt="Shorts Keyboard Controls settings popup" width="380" />
</p>

Settings save automatically with Chromium's synced extension storage and update open YouTube and YouTube Music pages immediately.

| Action | Default |
| --- | --- |
| Like / unlike | `L` |
| Seek backward | `←` |
| Seek forward | `→` |
| Previous Short | `K` |
| Next Short | `J` |
| Open / close Shorts comments | `;` |
| Scroll comments up | `[` |
| Scroll comments down | `'` |
| Seek distance | 5 seconds |
| Comment scroll distance | 85% of the panel |

Like/unlike and seeking work on both `youtube.com` and `music.youtube.com`. Shorts navigation and comment controls only activate on Shorts.

The popup prevents duplicate shortcuts. All shortcuts use one key without modifiers.

## Install in Brave

1. Download `shorts-keyboard-controls-v1.5.0.zip` from the [latest release](https://github.com/Asforaa/shorts-keyboard-controls/releases/latest).
2. Extract the ZIP somewhere you will keep it. Do not delete that extracted folder after installation.
3. Open `brave://extensions`.
4. Turn on **Developer mode** in the top-right corner.
5. Click **Load unpacked**.
6. Select the extracted folder containing `manifest.json`.
7. Refresh any open YouTube or YouTube Music tabs.

Pin the extension from Brave's extensions menu if you want quick access to its settings.

## Install in Chrome or another Chromium browser

The same unpacked installation works in Chrome, Edge, Vivaldi, and other Chromium browsers:

1. Open the browser's extensions page, such as `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the extracted release folder.

## Updating

1. Download and extract the new release over the old extension folder.
2. Return to your browser's extensions page.
3. Click **Reload** on Shorts Keyboard Controls.
4. Refresh YouTube or YouTube Music.

Your customized settings are stored separately by the browser and should remain in place.

## Privacy

Shorts Keyboard Controls has no analytics, servers, accounts, ads, or telemetry. It does not collect or transmit browsing history, video history, comments, account information, or personal data.

The extension requests only Chromium's `storage` permission to save your settings. It runs only on `youtube.com` and `music.youtube.com` pages. See [PRIVACY.md](PRIVACY.md) for the complete statement.

## Development

There is no build step and there are no dependencies.

```text
manifest.json   Extension configuration
content.js      YouTube and YouTube Music shortcuts and DOM targeting
popup.html      Settings popup markup
popup.css       Settings popup styling
popup.js        Shortcut editing and synced settings
icons/          Extension icon sizes
```

After editing, reload the unpacked extension from your browser's extensions page and refresh YouTube or YouTube Music.

## Compatibility note

YouTube changes its page structure regularly. If a shortcut stops working, please [open an issue](https://github.com/Asforaa/shorts-keyboard-controls/issues) with the browser version, the page type (video, Short, or Music), and what happened.

This project is unofficial and is not affiliated with, endorsed by, or sponsored by YouTube or Google.

## License

[MIT](LICENSE) © 2026 Asforaa
