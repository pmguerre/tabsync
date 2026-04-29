# TabSync

![MIT License](https://img.shields.io/badge/License-MIT-green.svg)
![Issues](https://img.shields.io/github/issues/pmguerre/tabsync)
![PRs](https://img.shields.io/github/issues-pr/pmguerre/tabsync)
![Last Commit](https://img.shields.io/github/last-commit/pmguerre/tabsync)

Chrome/Edge extension to sync, save and restore tab sessions per window, across devices using the same browser profile.


## Features

- Save all open tabs in a window as a named session
- List and manage multiple sessions (one per work context)
- Restore a session (opens its tabs on another device via account sync)
- Update a session (syncs current window tabs into the saved session)
- Remove old sessions
- View the list of tabs/titles in each session
- Quick action buttons: open/restore (📂), update (💾), remove (🗑️)
- Supports tab groups — saves and restores group name, colour and collapsed state
- Update restricted to the session's original window (prevents accidental changes)
- Automatically syncs across devices via Google/Microsoft account


## Install (development)

1. Open `chrome://extensions` or `edge://extensions` and enable Developer mode
2. Click "Load unpacked" and select the `src/` folder


## Install (production)

1. Run `npm run pack` to generate the `dist/` folder and `tabsync.zip`
2. Submit `tabsync.zip` to the store, or load `dist/` as an unpacked extension


## Available scripts

```sh
npm run build   # Copy src/ → dist/
npm run pack    # Build + create tabsync.zip (ready to publish)
npm test        # Run unit tests with coverage (Jest)
```


## Usage

- Click the TabSync icon in the browser toolbar
- Type a name and click **Save** to register the current window's tabs as a session
- Use the action buttons to open, update or remove sessions
- Click a tab title to navigate directly to that tab (if in the session's window)
- Open the extension on another device (with a synced account) to access the same saved sessions


## Limitations

- Only works with an authenticated browser profile (Chrome/Edge)
- Only non-pinned tabs with valid URLs are saved


## License

MIT

---

© 2026 Pedro Guerreiro. All rights reserved.
