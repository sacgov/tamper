# scripts

Userscripts for [Tampermonkey](https://www.tampermonkey.net/). Push this folder to GitHub and Tampermonkey keeps them updated.

## Setup (one time)

1. Create a GitHub repo and push this folder (`git init && git add . && git commit -m init && git remote add origin ... && git push -u origin main`).
2. Replace `YOUR_USER/YOUR_REPO` in `redirector/redirector.user.js` (header URLs and `CONFIG_URL`).
   The repo must be public so the raw URLs are reachable.
3. In Tampermonkey, install from the raw URL:
   `https://raw.githubusercontent.com/YOUR_USER/YOUR_REPO/main/redirector/redirector.user.js`

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
# tamper
