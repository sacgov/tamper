# scripts

Userscripts for [Tampermonkey](https://www.tampermonkey.net/). Push this folder to GitHub and Tampermonkey keeps them updated.

## Setup (one time)

1. Repo: `git@github.com:sacgov/tamper.git` (branch `main`). The repo must be public so the raw URLs are reachable.
2. Push changes: `git add . && git commit -m "..." && git push`.
3. In Tampermonkey, install from the raw URL:
   `https://raw.githubusercontent.com/sacgov/tamper/main/redirector/redirector.user.js`

## Updating

- **Rules:** edit `redirector/config.json` and push. Applied within ~10 minutes (the script caches the config).
- **Script code:** bump `@version` in the `.user.js` and push. Tampermonkey picks it up on its next update check.

## Redirector rules

```json
{ "match": "*://*.reddit.com/*", "action": "block", "message": "I committed to not use this site." }
{ "match": "*://example.com/*",  "action": "redirect", "target": "https://example.org/" }
```

`enabled: false` disables a rule. `*` in `match` is a wildcard over the full URL.

## Adding a script

Create `<name>/<name>.user.js` with `@updateURL`/`@downloadURL` pointing at its raw URL.

## Home dashboard

`home/index.html` shows your logged attempts (streak, 14-day chart, top sites, recent). The redirector logs every block/redirect to Tampermonkey storage and hands the log to the page at `https://sacgov.github.io/tamper/home/`.

1. Enable GitHub Pages: repo Settings → Pages → Deploy from branch `main`, folder `/ (root)`.
2. Set Chrome's Home button / startup page to that URL.

Data stays in this browser only.
