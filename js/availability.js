// The availability calendar on the "Plan your event" page.
//
// Booked dates come from Michele's "Booked dates" list in the admin, read
// from the same content feed js/content.js uses (under "@collections"). A row
// whose status mentions "hold" shows as on hold; anything else is booked.
// Tapping an open day writes it into the form's date field.
//
// If the feed cannot be reached, every future day shows as open and the
// calendar says so, since the inquiry is confirmed by a person anyway.
(function () {
  'use strict';

  var root = document.querySelector('[data-availability]');
  if (!root) return;

  var V = window.VENUE || {};
  var monthsEl = root.querySelector('[data-avail-months]');
  var statusEl = root.querySelector('[data-avail-status]');
  var prevBtn = root.querySelector('[data-avail-prev]');
  var nextBtn = root.querySelector('[data-avail-next]');
  var dateInput = document.getElementById('f-date');
  var SHOW = 2;
  var AHEAD = 24;

  var today = new Date();
  today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var first = { y: today.getFullYear(), m: today.getMonth() };
  // In the last week of a month, open on next month so the view is not mostly past days.
  var lastDay = new Date(first.y, first.m + 1, 0).getDate();
  var view = today.getDate() > lastDay - 7 ? { y: first.m === 11 ? first.y + 1 : first.y, m: (first.m + 1) % 12 } : { y: first.y, m: first.m };
  var taken = {};
  var selected = dateInput && dateInput.value ? dateInput.value : '';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function key(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }

  function parseDay(s) {
    s = String(s || '').trim();
    var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) return key(+m[1], +m[2] - 1, +m[3]);
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) return key(+m[3], +m[1] - 1, +m[2]);
    var t = Date.parse(s);
    if (!isNaN(t)) { var d = new Date(t); return key(d.getFullYear(), d.getMonth(), d.getDate()); }
    return null;
  }

  function monthIndex(v) { return v.y * 12 + v.m; }
  function shift(v, n) { var i = monthIndex(v) + n; return { y: Math.floor(i / 12), m: i % 12 }; }

  function label(y, m, d) {
    return new Date(y, m, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  function renderMonth(v) {
    var wrap = document.createElement('div');
    wrap.className = 'month';
    var title = document.createElement('h3');
    title.className = 'month__title';
    title.textContent = new Date(v.y, v.m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    wrap.appendChild(title);

    var dow = document.createElement('div');
    dow.className = 'month__dow';
    dow.setAttribute('aria-hidden', 'true');
    ['S', 'M', 'T', 'W', 'T', 'F', 'S'].forEach(function (c) {
      var s = document.createElement('span'); s.textContent = c; dow.appendChild(s);
    });
    wrap.appendChild(dow);

    var grid = document.createElement('div');
    grid.className = 'month__days';
    var lead = new Date(v.y, v.m, 1).getDay();
    for (var i = 0; i < lead; i++) grid.appendChild(document.createElement('span'));
    var days = new Date(v.y, v.m + 1, 0).getDate();
    for (var d = 1; d <= days; d++) {
      var k = key(v.y, v.m, d);
      var past = new Date(v.y, v.m, d) < today;
      var state = past ? 'past' : (taken[k] || 'open');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'day day--' + state + (k === selected ? ' is-selected' : '') + (new Date(v.y, v.m, d).getDay() === 6 ? ' day--sat' : '');
      b.textContent = d;
      b.setAttribute('data-day', k);
      var words = state === 'open' ? 'open' : state === 'hold' ? 'on hold' : state === 'booked' ? 'booked' : 'past';
      b.setAttribute('aria-label', label(v.y, v.m, d) + ', ' + words);
      if (state !== 'open') b.disabled = true;
      if (k === selected) b.setAttribute('aria-pressed', 'true');
      grid.appendChild(b);
    }
    wrap.appendChild(grid);
    return wrap;
  }

  function render() {
    monthsEl.innerHTML = '';
    for (var i = 0; i < SHOW; i++) monthsEl.appendChild(renderMonth(shift(view, i)));
    prevBtn.disabled = monthIndex(view) <= monthIndex(first);
    nextBtn.disabled = monthIndex(view) + SHOW - 1 >= monthIndex(first) + AHEAD;
  }

  function goTo(k) {
    var p = k.split('-').map(Number);
    var target = { y: p[0], m: p[1] - 1 };
    if (monthIndex(target) < monthIndex(view) || monthIndex(target) > monthIndex(view) + SHOW - 1) {
      var clamped = Math.max(monthIndex(first), Math.min(monthIndex(target), monthIndex(first) + AHEAD - SHOW + 1));
      view = { y: Math.floor(clamped / 12), m: clamped % 12 };
    }
  }

  prevBtn.addEventListener('click', function () { view = shift(view, -1); render(); });
  nextBtn.addEventListener('click', function () { view = shift(view, 1); render(); });

  monthsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.day--open');
    if (!b) return;
    selected = b.getAttribute('data-day');
    render();
    if (dateInput) {
      dateInput.value = selected;
      dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      var form = document.getElementById('inquiry');
      if (form && !form.hidden) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        dateInput.classList.add('is-filled');
        setTimeout(function () { dateInput.classList.remove('is-filled'); }, 1800);
      }
    }
  });

  if (dateInput) {
    dateInput.addEventListener('change', function () {
      selected = dateInput.value;
      if (selected) goTo(selected);
      render();
    });
  }

  render();
  statusEl.textContent = 'Checking booked dates…';

  if (!V.contentUrl || !window.fetch) {
    statusEl.textContent = 'Pick a date and we will confirm it with you.';
    return;
  }
  fetch(V.contentUrl, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var rows = ((data && data['@collections']) || {})['calendar.booked'] || [];
      rows.forEach(function (row) {
        var k = parseDay(row.date);
        if (!k) return;
        var hold = /hold/i.test(row.status || '');
        if (taken[k] === 'booked') return;
        taken[k] = hold ? 'hold' : 'booked';
      });
      if (selected && taken[selected]) selected = '';
      render();
      statusEl.textContent = 'Open dates can be tapped. Every date is confirmed with you before anything is final.';
    })
    .catch(function () {
      statusEl.textContent = 'Booked dates could not load right now. Pick any date and we will confirm it with you.';
    });
})();
