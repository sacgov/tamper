# AGENTS.md

Userscripts for Tampermonkey, served from GitHub (`sacgov/tamper`, branch `main`) via raw URLs and GitHub Pages. No build step, no dependencies.

## Layout

- `loader/loader.user.js` — the only script installed in Tampermonkey. Reads `scripts.json`, runs enabled scripts, and `@require`s the redirector.
- `redirector/redirector.js` — blocks/redirects sites and logs attempts. Rules live in `redirector/config.json`.
- `scripts.json` — registry of extra scripts (`name`, `path`, `match`, optional `exclude`, `runAt`, `enabled`).
- `home/index.html` — dashboard of logged attempts, published at `https://sacgov.github.io/tamper/home/`.
- `example/` — sample script.

## Conventions

- Extra scripts are plain `.js` files (not `.user.js`) registered in `scripts.json`.
- Changing `loader/loader.user.js` or `redirector/redirector.js` requires bumping `@version` in the loader header; config/rules changes do not.
- The redirector must not be installed standalone (attempts would be logged twice).
- Strict-CSP sites block eval; the redirector is loaded via `@require` and renders its block page with DOM APIs for that reason. Keep it eval-free.
- Loaded scripts only get the GM APIs listed in the loader's `GM_API`; adding one needs a `@grant` plus a `GM_API` entry.
- Rule format: `{ "match": "*://*.site.com/*", "action": "block"|"redirect", "message"|"target", "enabled": false }`.
- Commit small, imperative messages (e.g. "Block lichess.org"). Only push when asked.

## Commands

```bash
git add . && git commit -m "..." && git push  # deploy; Tampermonkey picks it up within ~10 min
```

A pre-commit hook (`.githooks/pre-commit`) validates `redirector/config.json` and `scripts.json`. Enable it once per clone: `git config core.hooksPath .githooks`.

Manual refresh: Tampermonkey menu → "Loader: refresh scripts now" (there is also a rules refresh command).
There is no automated test suite; verify by loading a matching page with the loader installed.
