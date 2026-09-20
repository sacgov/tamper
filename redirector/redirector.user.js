// ==UserScript==
// @name         Redirector
// @namespace    https://github.com/sacgov/tamper
// @version      1.0.0
// @description  Redirect sites, or show a "you committed to not use this site" page. Rules live in config.json.
// @match        *://*/*
// @run-at       document-start
// @noframes
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/sacgov/tamper/main/redirector/redirector.user.js
// @downloadURL  https://raw.githubusercontent.com/sacgov/tamper/main/redirector/redirector.user.js
// ==/UserScript==

(function () {
  'use strict';

  const CONFIG_URL = 'https://raw.githubusercontent.com/sacgov/tamper/main/redirector/config.json';
  const CACHE_KEY = 'redirector.config';
  const CACHE_TIME_KEY = 'redirector.fetchedAt';
  const MAX_AGE_MS = 10 * 60 * 1000;

  const globToRegex = (glob) =>
    new RegExp('^' + glob.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');

  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function findRule(config) {
    const url = location.href;
    return (config.rules || []).find((r) => r.enabled !== false && globToRegex(r.match).test(url));
  }

  function showBlockPage(rule) {
    const message = rule.message || 'I committed to not use this site.';
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Blocked</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       font:18px/1.5 system-ui,sans-serif;background:#111;color:#eee;text-align:center}
  main{max-width:32rem;padding:2rem}
  h1{font-size:2rem;margin:0 0 1rem}
  p{opacity:.8}
  code{background:#222;padding:.1em .4em;border-radius:4px}
</style></head><body><main>
  <h1>${escapeHtml(message)}</h1>
  <p><code>${escapeHtml(location.hostname)}</code> is blocked by your Redirector rules.</p>
</main></body></html>`;
    window.stop();
    document.open();
    document.write(html);
    document.close();
  }

  function apply(config) {
    const rule = config && findRule(config);
    if (!rule) return;
    if (rule.action === 'redirect' && rule.target) location.replace(rule.target);
    else showBlockPage(rule);
  }

  function refresh() {
    GM_xmlhttpRequest({
      method: 'GET',
      url: CONFIG_URL + '?t=' + Date.now(),
      onload: (res) => {
        try {
          JSON.parse(res.responseText);
          GM_setValue(CACHE_KEY, res.responseText);
          GM_setValue(CACHE_TIME_KEY, Date.now());
        } catch (e) {
          console.warn('[Redirector] Invalid config.json', e);
        }
      },
      onerror: () => console.warn('[Redirector] Could not fetch config'),
    });
  }

  let cached = null;
  try {
    cached = JSON.parse(GM_getValue(CACHE_KEY, 'null'));
  } catch (e) {}

  // Apply cached config synchronously so blocking happens as early as possible.
  apply(cached);

  if (Date.now() - GM_getValue(CACHE_TIME_KEY, 0) > MAX_AGE_MS) refresh();
})();
