// Example script loaded by loader/loader.user.js. Plain .js, not .user.js.
// GM_* functions are available as parameters (see GM_API in the loader).
const bar = document.createElement('div');
bar.textContent = 'Loaded via the scripts loader';
bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;padding:6px;background:#16a34a;color:#fff;text-align:center;font:14px system-ui';
document.body.appendChild(bar);
