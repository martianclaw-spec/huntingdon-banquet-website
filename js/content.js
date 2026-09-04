// js/content.js — content overlay (phase 1).
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
// Phase 1 has no data source: the map is always empty, so this script never
// writes to the page. A content failure must never be a page failure, so
// every path swallows its errors.
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
  function getContentMap() {
    if (pending) return pending;
    pending = Promise.resolve()
      .then(function () {
        // Phase 1: no data source yet.
        return {};
      })
      .then(function (map) {
        return map && typeof map === 'object' ? map : {};
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

  function apply(map) {
    if (!map || typeof map !== 'object') return;
    var nodes = document.querySelectorAll('[data-content]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      var id = el.getAttribute('data-content');
      if (!id || !Object.prototype.hasOwnProperty.call(map, id)) continue;
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

  window.SiteContent = {
    CACHE_TAG: CACHE_TAG,
    getContentMap: getContentMap,
    apply: apply,
    sanitize: sanitize,
  };

  // The script is loaded with defer, so the DOM is parsed by now.
  getContentMap().then(apply).catch(function () {});
})();
