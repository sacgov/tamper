# scripts

Userscripts for [Tampermonkey](https://www.tampermonkey.net/). Push this folder to GitHub and Tampermonkey keeps them updated.

## Setup (one time)

1. Repo: `git@github.com:sacgov/tamper.git` (branch `main`). The repo must be public so the raw URLs are reachable.
2. Push changes: `git add . && git commit -m "..." && git push`.
3. In Tampermonkey, install only the loader (see "Scripts loader" below). It loads the redirector and everything else from `scripts.json`.

## Updating

- **Rules:** edit `redirector/config.json` and push. Applied within ~10 minutes (the script caches the config).
- **Script code:** push. Loaded scripts refresh within ~10 minutes. Only `loader/loader.user.js` itself needs an `@version` bump.

## Redirector rules

```json
{ "match": "*://*.reddit.com/*", "action": "block", "message": "I committed to not use this site." }
{ "match": "*://example.com/*",  "action": "redirect", "target": "https://example.org/" }
```

`enabled: false` disables a rule. `*` in `match` is a wildcard over the full URL.

## Adding a script

Add a plain `.js` file and a `scripts.json` entry (see below).

## Home dashboard

`home/index.html` shows your logged attempts (streak, 14-day chart, top sites, recent). The redirector logs every block/redirect to Tampermonkey storage and hands the log to the page at `https://sacgov.github.io/tamper/home/`.

1. Enable GitHub Pages: repo Settings → Pages → Deploy from branch `main`, folder `/ (root)`.
2. Set Chrome's Home button / startup page to that URL.

Data stays in this browser only.

## Scripts loader (add scripts without touching Tampermonkey)

Install once: `https://raw.githubusercontent.com/sacgov/tamper/main/loader/loader.user.js`

It reads `scripts.json` and runs every enabled entry whose `match` fits the page. To add a script:

1. Put a plain `.js` file in the repo (not `.user.js`), e.g. `mything/mything.js`.
2. Add an entry to `scripts.json`:
   ```json
   { "name": "mything", "path": "mything/mything.js", "match": ["*://example.com/*"], "runAt": "document-idle", "enabled": true }
   ```
   `runAt` is `document-start` or `document-idle` (default). Optional `exclude` patterns.
3. Push. It applies within ~10 minutes, or use the Tampermonkey menu command "Loader: refresh scripts now".

Notes:
- Loaded scripts get `GM_getValue`, `GM_setValue`, `GM_deleteValue`, `GM_addStyle`, `GM_registerMenuCommand`, `GM_xmlhttpRequest` and `unsafeWindow` as variables. To use another GM API, add its `@grant` in the loader header and to `GM_API`, then bump `@version`.
- The redirector is loaded this way too (`runAt: document-start`). Don't also install a standalone copy, or attempts get logged twice.
- Sites with a strict Content-Security-Policy may block loaded scripts; check the console for `[Loader]` warnings.
