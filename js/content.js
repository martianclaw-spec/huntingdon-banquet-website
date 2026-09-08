// js/content.js — content overlay.
//
// Static-site stand-in for the handoff's lib/content.ts + components/Editable.tsx.
// Any element carrying data-content="<id>" is a slot; the markup inside it is
// the fallback. On load, getContentMap() is called once, and every slot whose
// id has a value in the map is overwritten:
//
//   <picture> / <img>            -> image: src replaced, <source> variants
//                                   dropped, alt replaced only if "<id>.alt" is set
//   element with data-content-html -> richtext: sanitized (em/strong/i/b/br only)
//   anything else                -> plain text
//
// The map comes from the control plane (see getContentMap). When it is
// empty, unreachable, or slow, this script writes nothing to the page. A
// content failure must never be a page failure, so every path swallows its
// errors.
//
// Edit mode: when the page is loaded inside the owner's admin (an iframe with
// ?cp-edit=1&cp-origin=<admin origin>), every slot gets a dotted outline and
// a click reports the slot to the admin instead of following links. The
// admin can send back a fresh map to apply live. Outside the admin nothing
// about edit mode runs.
//
// The allowlist of ids lives in content.config.js at the project root; this
// file does not load it. scripts/check-content.js keeps the two in sync.
(function () {
  'use strict';

  // Phase 2 caches the fetch under this tag so the control plane can
  // invalidate it (the static-site equivalent of revalidateTag('content')).
  var CACHE_TAG = 'content';

  var pending = null;

  // Called once per page load; every caller shares the same promise.
  //
  // The control plane's read endpoint comes from window.VENUE.contentUrl in
  // config.js. It answers with only the overrides, as { "slot.id": value }.
  // No URL, a slow answer, a bad status, or malformed JSON all resolve to {},
  // and the site keeps its built-in copy.
  var FETCH_TIMEOUT_MS = 4000;

  function getContentMap() {
    if (pending) return pending;
    var url = window.VENUE && window.VENUE.contentUrl;
    pending = Promise.resolve()
      .then(function () {
        if (!url || typeof fetch !== 'function') return {};
        var controller = typeof AbortController === 'function' ? new AbortController() : null;
        var timer = controller ? setTimeout(function () { controller.abort(); }, FETCH_TIMEOUT_MS) : null;
        return fetch(url, { method: 'GET', mode: 'cors', credentials: 'omit', cache: 'no-store', signal: controller ? controller.signal : undefined })
          .then(function (res) {
            if (!res.ok) return {};
            return res.json();
          })
          .finally(function () { if (timer) clearTimeout(timer); });
      })
      .then(function (map) {
        return map && typeof map === 'object' && !Array.isArray(map) ? map : {};
      })
      .catch(function () {
        return {};
      });
    return pending;
  }

  var ALLOWED = { EM: 1, STRONG: 1, I: 1, B: 1, BR: 1 };

  // Allowlist sanitizer for richtext values. Returns a DocumentFragment built
  // from scratch: allowed tags are recreated with no attributes, unknown tags
  // are unwrapped to their text, script/style/template are dropped entirely.
  // Nothing from the input is ever inserted as HTML.
  function sanitize(html) {
    var out = document.createDocumentFragment();
    var doc;
    try {
      doc = new DOMParser().parseFromString('<body>' + String(html), 'text/html');
    } catch (e) {
      return out;
    }
    (function walk(from, to) {
      for (var node = from.firstChild; node; node = node.nextSibling) {
        if (node.nodeType === 3) {
          to.appendChild(document.createTextNode(node.nodeValue));
        } else if (node.nodeType === 1) {
          var tag = node.tagName.toUpperCase();
          if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'TEMPLATE') continue;
          if (ALLOWED[tag]) {
            var el = document.createElement(tag.toLowerCase());
            walk(node, el);
            to.appendChild(el);
          } else {
            walk(node, to);
          }
        }
      }
    })(doc.body, out);
    return out;
  }

  function safeUrl(value) {
    return !/^\s*(javascript|data|vbscript):/i.test(value);
  }

  function applyImage(el, src, alt) {
    if (!safeUrl(src)) return;
    var img = el.tagName === 'IMG' ? el : el.querySelector('img');
    if (!img) return;
    if (el.tagName === 'PICTURE') {
      var sources = el.querySelectorAll('source');
      for (var i = 0; i < sources.length; i++) sources[i].parentNode.removeChild(sources[i]);
    }
    img.removeAttribute('srcset');
    img.setAttribute('src', src);
    if (typeof alt === 'string') img.setAttribute('alt', alt);
  }

  function applyRichText(el, value) {
    var frag = sanitize(value);
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(frag);
  }

  // Remember each slot's built-in markup once, so a later map that drops a
  // key (an undo) can put the original back without a reload.
  var originals = {};

  function rememberOriginals() {
    var nodes = document.querySelectorAll('[data-content]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var id = el.getAttribute('data-content');
      if (!id || originals[id]) continue;
      var img = el.tagName === 'IMG' ? el : el.tagName === 'PICTURE' ? el.querySelector('img') : null;
      originals[id] = img
        ? { kind: 'image', src: img.getAttribute('src'), alt: img.getAttribute('alt'), sources: el.tagName === 'PICTURE' ? el.innerHTML : null }
        : { kind: el.hasAttribute('data-content-html') ? 'html' : 'text', html: el.innerHTML };
    }
  }

  function restore(el, id) {
    var o = originals[id];
    if (!o) return;
    if (o.kind === 'image') {
      if (el.tagName === 'PICTURE' && o.sources != null) el.innerHTML = o.sources;
      var img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (img) { img.setAttribute('src', o.src); if (o.alt != null) img.setAttribute('alt', o.alt); }
    } else {
      el.innerHTML = o.html;
    }
  }

  function apply(map) {
    if (!map || typeof map !== 'object') return;
    var nodes = document.querySelectorAll('[data-content]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var id = el.getAttribute('data-content');
      if (!id) continue;
      if (!Object.prototype.hasOwnProperty.call(map, id)) {
        if (editMode) restore(el, id);
        continue;
      }
      var value = map[id];
      if (typeof value !== 'string') continue;
      try {
        if (el.tagName === 'PICTURE' || el.tagName === 'IMG') {
          applyImage(el, value, map[id + '.alt']);
        } else if (el.hasAttribute('data-content-html')) {
          applyRichText(el, value);
        } else {
          el.textContent = value;
        }
      } catch (e) {
        // leave the fallback in place
      }
    }
  }

  // ---- edit mode (only inside the owner's admin) ------------------------------

  var params = new URLSearchParams(location.search);
  var editMode = window.parent !== window && params.get('cp-edit') === '1';
  var adminOrigin = params.get('cp-origin') || '';

  function post(msg) {
    if (!editMode || !adminOrigin) return;
    try { window.parent.postMessage(msg, adminOrigin); } catch (e) { /* ignore */ }
  }

  function currentValueOf(el) {
    var img = el.tagName === 'IMG' ? el : el.tagName === 'PICTURE' ? el.querySelector('img') : null;
    if (img) return { kind: 'image', value: img.currentSrc || img.getAttribute('src') || '', alt: img.getAttribute('alt') || '' };
    if (el.hasAttribute('data-content-html')) return { kind: 'html', value: el.innerHTML.trim(), text: el.textContent.trim() };
    return { kind: 'text', value: el.textContent.trim() };
  }

  function withEditParams(href) {
    try {
      var u = new URL(href, location.href);
      if (u.origin !== location.origin) return null;
      u.searchParams.set('cp-edit', '1');
      u.searchParams.set('cp-origin', adminOrigin);
      return u.href;
    } catch (e) {
      return null;
    }
  }

  function setupEditMode() {
    var style = document.createElement('style');
    style.textContent =
      '[data-content]{outline:2px dashed rgba(160,91,69,.55);outline-offset:3px;cursor:pointer;transition:outline-color .12s,background-color .12s}' +
      '[data-content]:hover{outline:3px solid #A05B45;background-color:rgba(160,91,69,.08)}' +
      '[data-content].cp-flash{outline:3px solid #3f7d47;background-color:rgba(63,125,71,.12)}' +
      'html.cp-edit .tarch-fade{opacity:1;animation:none}';
    document.head.appendChild(style);
    document.documentElement.classList.add('cp-edit');

    document.addEventListener('click', function (e) {
      var slot = e.target.closest && e.target.closest('[data-content]');
      if (slot) {
        e.preventDefault();
        e.stopPropagation();
        var cur = currentValueOf(slot);
        var rect = slot.getBoundingClientRect();
        post({ type: 'cp:pick', id: slot.getAttribute('data-content'), kind: cur.kind, value: cur.value, text: cur.text || cur.value, alt: cur.alt || '', page: location.pathname, top: rect.top + window.scrollY });
        return;
      }
      var link = e.target.closest && e.target.closest('a[href]');
      if (link) {
        var next = withEditParams(link.getAttribute('href'));
        if (next) { e.preventDefault(); location.href = next; }
      }
    }, true);

    window.addEventListener('message', function (e) {
      if (adminOrigin && e.origin !== adminOrigin) return;
      var msg = e.data || {};
      if (msg.type === 'cp:apply' && msg.map && typeof msg.map === 'object') {
        apply(msg.map);
      } else if (msg.type === 'cp:flash' && typeof msg.id === 'string') {
        var nodes = document.querySelectorAll('[data-content="' + msg.id.replace(/"/g, '') + '"]');
        for (var i = 0; i < nodes.length; i++) {
          (function (el) {
            el.classList.add('cp-flash');
            if (i === 0) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(function () { el.classList.remove('cp-flash'); }, 2500);
          })(nodes[i]);
        }
      }
    });

    post({ type: 'cp:ready', page: location.pathname, ids: Array.prototype.map.call(document.querySelectorAll('[data-content]'), function (n) { return n.getAttribute('data-content'); }) });
  }

  window.SiteContent = {
    CACHE_TAG: CACHE_TAG,
    getContentMap: getContentMap,
    apply: apply,
    sanitize: sanitize,
  };

  // The script is loaded with defer, so the DOM is parsed by now.
  if (editMode) rememberOriginals();
  getContentMap().then(function (map) {
    apply(map);
    if (editMode) setupEditMode();
  }).catch(function () {});
})();
