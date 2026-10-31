// The interactive pieces: the scroll story, the occasion photo swap, the
// guest planner, photo hotspots, the rate estimator, count-up numbers,
// parallax, and the "View" cursor over photos.
//
// Anything that shows a number the owner can edit (capacity, rates) reads
// it from the page when it runs, so edits made in the admin flow through
// without touching this file.
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function num(text) {
    var n = parseFloat(String(text || '').replace(/[^0-9.]/g, ''));
    return isNaN(n) ? null : n;
  }
  function slotValue(id) {
    var el = document.querySelector('[data-content="' + id + '"]');
    return el ? el.textContent : '';
  }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function capacity() { return num(slotValue('venue.capacity')) || 279; }

  // ---- count-up numbers ----

  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countIO.unobserve(entry.target);
        var el = entry.target;
        var target = num(el.textContent);
        if (!target || !/^\s*[\d,]+\s*$/.test(el.textContent)) return;
        var start = performance.now(), dur = 1600;
        (function tick(now) {
          var t = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased).toLocaleString('en-US');
          if (t < 1) requestAnimationFrame(tick);
        })(start);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countIO.observe(el); });
  }

  // ---- scroll story: the photo on the left follows the step being read ----

  var story = document.querySelector('.story');
  if (story && 'IntersectionObserver' in window) {
    var frames = story.querySelectorAll('.story__stage picture');
    var ticks = story.querySelectorAll('.story__progress span');
    var steps = Array.prototype.slice.call(story.querySelectorAll('.story__step'));
    var storyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var i = steps.indexOf(entry.target);
        steps.forEach(function (s, j) { s.classList.toggle('is-on', j === i); });
        Array.prototype.forEach.call(frames, function (f, j) { f.classList.toggle('is-on', j === i); });
        Array.prototype.forEach.call(ticks, function (t, j) { t.classList.toggle('is-on', j === i); });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { storyIO.observe(s); });
  }

  // ---- occasions: hover, focus, or tap a line to change the photo ----

  var swap = document.querySelector('[data-swap]');
  if (swap) {
    var layers = swap.querySelectorAll('.swap__layer');
    var lines = document.querySelectorAll('[data-occasion]');
    var activate = function (key) {
      Array.prototype.forEach.call(layers, function (l) { l.classList.toggle('is-on', l.getAttribute('data-layer') === key); });
      Array.prototype.forEach.call(lines, function (l) { l.classList.toggle('is-active', l.getAttribute('data-occasion') === key); });
    };
    Array.prototype.forEach.call(lines, function (line) {
      var key = line.getAttribute('data-occasion');
      line.addEventListener('mouseenter', function () { activate(key); });
      line.addEventListener('focus', function () { activate(key); });
      line.addEventListener('click', function () { activate(key); });
    });
    var list = document.querySelector('.occasions');
    if (list && finePointer) list.addEventListener('mouseleave', function () { activate(null); });
  }

  // ---- guest planner ----

  var planner = document.querySelector('[data-planner]');
  if (planner) {
    var range = planner.querySelector('.range');
    var out = planner.querySelector('[data-planner-count]');
    var read = planner.querySelector('.planner__read');
    var key = planner.querySelector('[data-planner-key]');
    var floor = planner.querySelector('.floor');
    var grid = planner.querySelector('.floor__tables');
    var modes = planner.querySelectorAll('[data-mode]');
    var scaleMax = planner.querySelector('.range-scale span:last-child');
    var mode = 'seated';
    var DOTS = 45;
    for (var d = 0; d < DOTS; d++) {
      var dot = document.createElement('span');
      dot.className = 'floor__t';
      grid.appendChild(dot);
    }
    var dots = grid.children;

    var render = function () {
      var max = capacity();
      if (+range.max !== max) {
        range.max = max;
        if (scaleMax) scaleMax.textContent = max;
      }
      var g = +range.value;
      out.textContent = g;
      range.style.setProperty('--fill', ((g - range.min) / (range.max - range.min) * 100) + '%');
      var lit, msg, share = g / max;
      if (mode === 'seated') {
        lit = Math.ceil(g / 8);
        key.textContent = lit + (lit === 1 ? ' table of eight' : ' tables of eight');
        msg = share < 0.4
          ? 'An intimate dinner, with plenty of open floor left for dancing, a buffet, or a lounge corner.'
          : share < 0.8
            ? 'A full, lively room, with space to move between the tables.'
            : 'A packed house, close to the room’s full capacity of ' + max + '.';
      } else {
        lit = Math.min(DOTS, Math.ceil(g / (max / DOTS)));
        key.textContent = 'Each dot, about ' + Math.round(max / DOTS) + ' guests';
        msg = share < 0.4
          ? 'A relaxed mingle, with room for high-tops, a photo corner, and a long buffet.'
          : share < 0.8
            ? 'A buzzing cocktail party, with the bar at the center of it all.'
            : 'Shoulder to shoulder and loud in the best way, near the room’s limit of ' + max + '.';
      }
      for (var i = 0; i < dots.length; i++) dots[i].classList.toggle('is-on', i < lit);
      floor.classList.toggle('floor--standing', mode !== 'seated');
      read.textContent = msg;
    };
    range.addEventListener('input', render);
    Array.prototype.forEach.call(modes, function (b) {
      b.addEventListener('click', function () {
        mode = b.getAttribute('data-mode');
        Array.prototype.forEach.call(modes, function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
        render();
      });
    });
    render();
    // Re-read the capacity once the owner's saved edits have loaded.
    setTimeout(render, 1500);
  }

  // ---- hotspots: tap a dot on the photo to read about that feature ----

  document.querySelectorAll('.hotspots').forEach(function (wrap) {
    var spots = wrap.querySelectorAll('.hotspot');
    var close = function () {
      spots.forEach(function (s) {
        s.setAttribute('aria-expanded', 'false');
        var c = document.getElementById(s.getAttribute('aria-controls'));
        if (c) c.classList.remove('is-open');
      });
    };
    spots.forEach(function (s) {
      var card = document.getElementById(s.getAttribute('aria-controls'));
      s.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = s.getAttribute('aria-expanded') === 'true';
        close();
        if (open || !card) return;
        s.setAttribute('aria-expanded', 'true');
        // place the card beside the dot, flipping when it would run off the photo
        var x = parseFloat(s.style.left), y = parseFloat(s.style.top);
        card.style.left = card.style.right = card.style.top = card.style.bottom = '';
        if (x > 55) card.style.right = (100 - x + 4) + '%'; else card.style.left = (x + 4) + '%';
        if (y > 55) card.style.bottom = (100 - y) + '%'; else card.style.top = y + '%';
        card.classList.add('is-open');
      });
    });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  });

  // ---- rate estimator (Rates page) ----

  var est = document.querySelector('[data-estimator]');
  if (est) {
    var valueEl = est.querySelector('[data-est-value]');
    var subEl = est.querySelector('[data-est-sub]');
    var hoursWrap = est.querySelector('[data-est-hours]');
    var hoursRange = est.querySelector('#est-hours');
    var hoursOut = est.querySelector('[data-est-hours-out]');
    var DAY = {
      saturday: { slot: 'pricing.saturday', label: 'a peak-season Saturday' },
      frisun: { slot: 'pricing.frisun', label: 'a Friday or Sunday' },
      weekday: { slot: 'pricing.weekday', label: 'a full weekday' },
      halfday: { slot: 'pricing.halfday', label: 'a half day, up to five hours' },
      hourly: { slot: 'pricing.hourly', label: 'hourly' },
    };
    var calc = function () {
      var day = (est.querySelector('input[name="est-day"]:checked') || {}).value || 'saturday';
      var off = ((est.querySelector('input[name="est-season"]:checked') || {}).value === 'off');
      var base = num(slotValue(DAY[day].slot));
      var hours = +hoursRange.value;
      hoursWrap.hidden = day !== 'hourly';
      hoursOut.textContent = hours + ' hours';
      if (base === null) {
        valueEl.textContent = 'Ask us';
        subEl.textContent = 'We will send you a real number for your date.';
        return;
      }
      var total = day === 'hourly' ? base * hours : base;
      var pct = off ? (num(slotValue('pricing.offseason_discount')) || 0) : 0;
      if (pct) total = total * (1 - pct / 100);
      valueEl.textContent = money(total);
      subEl.textContent = 'Starting rate for ' + (day === 'hourly' ? hours + ' hours' : DAY[day].label) +
        (pct ? ', with the ' + pct + '% January to April discount' : '') +
        '. Bar, catering, and insurance are separate.';
    };
    est.addEventListener('input', calc);
    est.addEventListener('change', calc);
    calc();
    setTimeout(calc, 1500);
  }

  // ---- inquiry form: a live summary of the event as it is described ----

  var summary = document.querySelector('[data-summary]');
  var form = document.getElementById('inquiry');
  if (summary && form) {
    var mainEl = summary.querySelector('[data-sum-main]');
    var factsEl = summary.querySelector('[data-sum-facts]');
    var hintEl = summary.querySelector('[data-sum-hint]');
    var last = '';
    var fieldVal = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
    var describe = function () {
      var type = fieldVal('f-type');
      var guests = parseInt(fieldVal('f-guests'), 10);
      var dateStr = fieldVal('f-date');
      var name = fieldVal('f-name').split(' ')[0];
      var date = dateStr ? new Date(dateStr + 'T12:00:00') : null;
      if (date && isNaN(date)) date = null;

      var main;
      if (!type && !guests && !date) {
        main = 'Start filling in the form and your event takes shape here.';
      } else {
        main = (name ? name + '’s ' : '') + (type ? type.toLowerCase() : 'event');
        if (main.charAt(0) !== main.charAt(0).toUpperCase()) main = main.charAt(0).toUpperCase() + main.slice(1);
        if (guests > 0) main += ' for ' + guests + (guests === 1 ? ' guest' : ' guests');
        if (date) main += ', ' + date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      }

      var facts = [];
      if (date) facts.push(['Date', date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })]);
      if (guests > 0) facts.push(['Tables of 8', 'About ' + Math.ceil(guests / 8)]);
      if (fieldVal('f-flex')) facts.push(['Flexible', fieldVal('f-flex')]);
      if (document.getElementById('f-tour') && document.getElementById('f-tour').checked) facts.push(['Visit', 'Yes, walk the room']);
      factsEl.innerHTML = '';
      facts.forEach(function (f) {
        var li = document.createElement('li');
        var a = document.createElement('span'); a.textContent = f[0];
        var b = document.createElement('span'); b.textContent = f[1];
        li.appendChild(a); li.appendChild(b); factsEl.appendChild(li);
      });
      factsEl.hidden = !facts.length;

      var hint = '';
      var max = capacity();
      if (guests > max) hint = 'That is more than the room holds (up to ' + max + '). Tell us anyway and we will talk it through.';
      else if (date && date.getDay() === 6) hint = 'Saturdays are the first dates to go, so a backup date or two helps.';
      hintEl.textContent = hint;
      hintEl.hidden = !hint;

      if (main !== last) {
        mainEl.textContent = main;
        mainEl.classList.remove('is-updated');
        void mainEl.offsetWidth;
        mainEl.classList.add('is-updated');
        last = main;
      }
    };
    form.addEventListener('input', describe);
    form.addEventListener('change', describe);
    setTimeout(describe, 50);
  }

  // ---- parallax: big photos drift a little slower than the page ----

  var drifting = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (drifting.length && !reduceMotion) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight;
      drifting.forEach(function (el) {
        var box = el.parentNode.getBoundingClientRect();
        if (box.bottom < -100 || box.top > vh + 100) return;
        var progress = (box.top + box.height / 2 - vh / 2) / (vh + box.height);
        el.style.transform = 'translate3d(0,' + (progress * -18).toFixed(2) + '%,0)';
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // ---- a soft "View" cursor over gallery photos ----

  var photos = document.querySelectorAll('.gallery__item');
  if (photos.length && finePointer && !reduceMotion) {
    var cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = 'View';
    document.body.appendChild(cursor);
    document.documentElement.classList.add('has-cursor');
    var tx = -200, ty = -200, cx = -200, cy = -200, running = false;
    var loop = function () {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.translate = cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px';
      if (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) requestAnimationFrame(loop);
      else running = false;
    };
    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!running) { running = true; requestAnimationFrame(loop); }
    });
    photos.forEach(function (p) {
      p.addEventListener('mouseenter', function () { cursor.classList.add('is-on'); });
      p.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); });
    });
    // scrolling moves photos out from under a still pointer without a mouseleave
    window.addEventListener('scroll', function () {
      var under = document.elementFromPoint(tx, ty);
      cursor.classList.toggle('is-on', !!(under && under.closest && under.closest('.gallery__item')));
    }, { passive: true });
  }
})();
