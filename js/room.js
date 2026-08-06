// Interactive floor plan — inline SVG, no library (client constraint).
// The base plan and the three configurations are built ONCE at load; each
// configuration lives in its own <g class="plan-layer"> and the segmented
// control cross-fades them by opacity. Geometry ported from the design mock.
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var INK = '#2B2B27', PINE = '#C9A97E', SLATE = '#56564F', BRICK = '#A05B45';
  var RX = 150, RY = 110, RW = 800, RH = 500;

  var postX = [326, 550, 774], postY = [270, 450];
  var posts = [];
  postX.forEach(function (x) { postY.forEach(function (y) { posts.push([x, y]); }); });
  function near(x, y, d) {
    return posts.some(function (p) { return Math.hypot(p[0] - x, p[1] - y) < d; });
  }

  function el(name, attrs, text) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function line(g, x1, y1, x2, y2, st, w, dash) {
    g.appendChild(el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: st, 'stroke-width': w, 'stroke-dasharray': dash || null }));
  }
  function rect(g, x, y, w, h, st, sw, dash, fill) {
    g.appendChild(el('rect', { x: x, y: y, width: w, height: h, fill: fill || 'none', stroke: st, 'stroke-width': sw || null, 'stroke-dasharray': dash || null }));
  }
  function circ(g, x, y, r, st, sw) {
    g.appendChild(el('circle', { cx: x, cy: y, r: r, fill: 'none', stroke: st, 'stroke-width': sw }));
  }
  function path(g, d, st, sw, dash) {
    g.appendChild(el('path', { d: d, fill: 'none', stroke: st, 'stroke-width': sw, 'stroke-dasharray': dash || null }));
  }
  function txt(g, x, y, s, o) {
    o = o || {};
    g.appendChild(el('text', {
      x: x, y: y,
      fill: o.fill || SLATE,
      'font-family': 'Switzer, sans-serif',
      'font-size': o.size || 12,
      'letter-spacing': '1.3',
      'font-weight': o.weight || 500,
      'text-anchor': o.anchor || 'start',
      transform: o.transform || null,
    }, String(s).toUpperCase()));
  }

  function buildBase() {
    var g = el('g', {});
    // room walls
    rect(g, RX, RY, RW, RH, INK, 2);
    // arched window wall (south / top)
    line(g, RX + 8, RY + 12, RX + RW - 8, RY + 12, INK, 1.3);
    for (var x = RX + 60; x < RX + RW - 40; x += 92) line(g, x, RY, x, RY + 12, INK, 1);
    txt(g, RX + RW / 2, RY + 34, 'Arched window wall · south', { anchor: 'middle' });
    // elevator + entry (west wall)
    rect(g, RX + 10, RY + RH - 74, 56, 56, INK, 1.4);
    line(g, RX + 10, RY + RH - 74, RX + 66, RY + RH - 18, INK, 1);
    line(g, RX + 66, RY + RH - 74, RX + 10, RY + RH - 18, INK, 1);
    txt(g, RX + 74, RY + RH - 40, 'Elevator');
    path(g, 'M ' + RX + ' ' + (RY + 150) + ' A 46 46 0 0 1 ' + (RX + 46) + ' ' + (RY + 196), INK, 1);
    line(g, RX, RY + 150, RX, RY + 196, INK, 3);
    txt(g, RX + 12, RY + 176, 'Entry');
    // reclaimed-brick bar + suspended canopy (east end of south wall)
    rect(g, 556, RY + RH - 44, 338, 40, PINE, 1, '5 6');
    rect(g, 566, RY + RH - 36, 318, 26, INK, 1.6);
    for (var bx = 578; bx < 878; bx += 22) line(g, bx, RY + RH - 36, bx, RY + RH - 10, INK, 0.8);
    txt(g, 566, RY + RH - 52, 'Reclaimed-brick bar · canopy above');
    // the six timber posts — solid charcoal squares
    posts.forEach(function (p) { rect(g, p[0] - 9, p[1] - 9, 18, 18, INK, 0, null, INK); });
    // pine dimension lines
    line(g, RX, 66, RX + RW, 66, PINE, 1);
    line(g, RX, 60, RX, 72, PINE, 1); line(g, RX + RW, 60, RX + RW, 72, PINE, 1);
    txt(g, RX + RW / 2, 56, "80'-0\"", { anchor: 'middle' });
    line(g, 96, RY, 96, RY + RH, PINE, 1);
    line(g, 90, RY, 102, RY, PINE, 1); line(g, 90, RY + RH, 102, RY + RH, PINE, 1);
    txt(g, 80, RY + RH / 2, "50'-0\"", { anchor: 'middle', transform: 'rotate(-90 80 ' + (RY + RH / 2) + ')' });
    // legend
    rect(g, RX, RY + RH + 46, 16, 16, INK, 0, null, INK);
    txt(g, RX + 26, RY + RH + 58, 'Timber post — original, 1890s frame');
    return g;
  }

  function buildDinner() {
    var g = el('g', { 'class': 'plan-layer' });
    rect(g, 470, 360, 170, 180, INK, 1.2, '4 7');
    txt(g, 555, 454, 'Dance floor', { anchor: 'middle' });
    rect(g, 440, 148, 220, 30, INK, 1.4);
    txt(g, 550, 168, 'Head table', { anchor: 'middle' });
    var rounds = 0;
    var xs = [220, 316, 412, 508, 604, 700, 796], ys = [200, 292, 384, 476, 552];
    xs.forEach(function (x) {
      ys.forEach(function (y) {
        if (x > 440 && x < 660 && y > 340 && y < 560) return;
        if (y < 196 && x > 420 && x < 680) return;
        if (x > 556 && y > 540) return;
        if (near(x, y, 54)) return;
        circ(g, x, y, 30, INK, 1.4);
        rounds++;
      });
    });
    var seats = Math.min(rounds * 10, 250);
    return {
      g: g,
      modeLabel: 'Seated dinner',
      seatsLine: 'Seats ~' + seats,
      configLine: rounds + ' rounds of 10 · dance floor · head table',
    };
  }

  function buildCocktail() {
    var g = el('g', { 'class': 'plan-layer' });
    var tops = 0;
    var xs = [214, 322, 430, 538, 646, 754, 862], ys = [190, 300, 410, 508];
    xs.forEach(function (x) {
      ys.forEach(function (y) {
        if (x > 556 && y > 500) return;
        if (near(x, y, 40)) return;
        circ(g, x, y, 15, INK, 1.3);
        tops++;
      });
    });
    // the bar, highlighted open in brick
    rect(g, 566, RY + RH - 36, 318, 26, BRICK, 2);
    txt(g, 725, RY + RH - 52, 'Bar open', { anchor: 'middle', fill: BRICK, weight: 600 });
    return {
      g: g,
      modeLabel: 'Cocktail',
      seatsLine: '250 standing',
      configLine: tops + ' high-tops · full bar open · open floor',
    };
  }

  function buildCeremony() {
    var g = el('g', { 'class': 'plan-layer' });
    path(g, 'M 478 176 A 72 72 0 0 1 622 176', PINE, 2.4);
    txt(g, 550, 150, 'Arbor', { anchor: 'middle' });
    line(g, 550, 208, 550, 578, INK, 1, '3 7');
    var rows = 0;
    for (var y = 222; y <= 566; y += 34) {
      if (postY.some(function (py) { return Math.abs(py - y) < 22; })) continue;
      line(g, 232, y, 470, y, INK, 5);
      line(g, 630, y, 868, y, INK, 5);
      rows++;
    }
    var seats = Math.min(rows * 24, 200);
    return {
      g: g,
      modeLabel: 'Ceremony',
      seatsLine: 'Seats ~' + seats,
      configLine: (rows * 2) + ' bench rows · center aisle · arbor',
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    var mount = document.getElementById('plan');
    if (!mount) return;

    var svg = el('svg', { viewBox: '0 0 1000 700', width: '100%', role: 'img', 'aria-label': 'Floor plan' });
    svg.style.display = 'block';
    svg.style.height = 'auto';
    svg.appendChild(buildBase());

    var modes = {
      dinner: buildDinner(),
      cocktail: buildCocktail(),
      ceremony: buildCeremony(),
    };
    Object.keys(modes).forEach(function (k) { svg.appendChild(modes[k].g); });
    mount.appendChild(svg);

    var buttons = document.querySelectorAll('.seg button[data-mode]');

    function setMode(mode) {
      Object.keys(modes).forEach(function (k) {
        modes[k].g.style.opacity = k === mode ? '1' : '0';
      });
      var m = modes[mode];
      svg.setAttribute('aria-label', m.modeLabel + ' floor plan');
      document.getElementById('mode-label').textContent = m.modeLabel;
      document.getElementById('seats-line').textContent = m.seatsLine;
      document.getElementById('config-line').textContent = m.configLine;
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.mode === mode ? 'true' : 'false');
      });
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.dataset.mode); });
    });

    setMode('dinner');
  });
})();
