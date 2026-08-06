// Wires the venue identity from config.js into the page (client constraint:
// swapping the name is a config change, not a design project).
(function () {
  'use strict';
  var V = window.VENUE || {};
  if (V.name) {
    document.querySelectorAll('[data-venue-name]').forEach(function (el) {
      el.textContent = V.name;
    });
    document.querySelectorAll('[data-venue-short]').forEach(function (el) {
      el.textContent = V.shortName || V.name;
    });
    if (document.title.indexOf(V.name) === -1) {
      document.title = document.title + ' — ' + V.name;
    }
  }
})();
