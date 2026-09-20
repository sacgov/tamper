// ==UserScript==
// @name         Scripts Loader
// @namespace    https://github.com/sacgov/tamper
// @version      1.1.0
// @description  Loads the scripts listed in scripts.json from GitHub. Install once; add scripts by editing the registry.
// @match        *://*/*
// @run-at       document-start
// @noframes
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// @require      https://raw.githubusercontent.com/sacgov/tamper/main/redirector/redirector.js
// @updateURL    https://raw.githubusercontent.com/sacgov/tamper/main/loader/loader.user.js
// @downloadURL  https://raw.githubusercontent.com/sacgov/tamper/main/loader/loader.user.js
// ==/UserScript==

(function () {
  'use strict';

  const BASE = 'https://raw.githubusercontent.com/sacgov/tamper/main/';
  const CACHE_KEY = 'loader.cache';
  const MAX_AGE_MS = 10 * 60 * 1000;

  // Every GM API a loaded script may use must be granted in the header above and listed here.
  const GM_API = {
    GM_xmlhttpRequest, GM_getValue, GM_setValue, GM_deleteValue,
    GM_addStyle, GM_registerMenuCommand, unsafeWindow,
  };

  const globToRegex = (glob) =>
    new RegExp('^' + glob.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');

  const matches = (entry, url) =>
    entry.enabled !== false &&
    (entry.match || []).some((g) => globToRegex(g).test(url)) &&
    !(entry.exclude || []).some((g) => globToRegex(g).test(url));

  function get(path) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: BASE + path + '?t=' + Date.now(),
        onload: (res) => (res.status === 200 ? resolve(res.responseText) : reject(new Error(path + ' ' + res.status))),
        onerror: () => reject(new Error('Could not fetch ' + path)),
      });
    });
  }

  function readCache() {
    try {
      return JSON.parse(GM_getValue(CACHE_KEY, 'null'));
    } catch (e) {
      return null;
    }
  }

  async function refresh() {
    const registry = JSON.parse(await get('scripts.json'));
    const sources = {};
    await Promise.all(
      (registry.scripts || []).filter((s) => s.enabled !== false).map(async (s) => {
        try {
          sources[s.path] = await get(s.path);
        } catch (e) {
          console.warn('[Loader]', e.message);
        }
      })
    );
    const cache = { fetchedAt: Date.now(), registry, sources };
    GM_setValue(CACHE_KEY, JSON.stringify(cache));
    return cache;
  }

  function run(entry, code) {
    try {
      const names = Object.keys(GM_API);
      new Function(...names, code)(...names.map((n) => GM_API[n]));
    } catch (e) {
      console.warn('[Loader] ' + entry.name + ' failed:', e);
    }
  }

  function runAll(cache) {
    const url = location.href;
    (cache.registry.scripts || []).forEach((entry) => {
      const code = cache.sources[entry.path];
      if (!code || !matches(entry, url)) return;
      if (entry.runAt === 'document-start') return run(entry, code);
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => run(entry, code));
      else run(entry, code);
    });
  }

  GM_registerMenuCommand('Loader: refresh scripts now', () => refresh().then(() => location.reload()));

  const cache = readCache();
  if (cache) {
    runAll(cache);
    if (Date.now() - cache.fetchedAt > MAX_AGE_MS) refresh().catch((e) => console.warn('[Loader]', e.message));
  } else {
    // First run: nothing cached yet, so fetch and then run for this page.
    refresh().then(runAll).catch((e) => console.warn('[Loader]', e.message));
  }
})();
