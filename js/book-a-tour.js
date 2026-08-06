// Book-a-tour + check-your-date widgets.
// Availability is SIMULATED (deterministic by weekday/date, matching the design
// mock) — replace tourAvail() / eventStatus() with the real booking platform's
// availability API before launch.
(function () {
  'use strict';

  var TIMES = ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM'];

  var state = {
    month: 0,        // book calendar offset from current month (0..6)
    lookMonth: 0,    // lookup calendar offset (0..11)
    selectedDate: null,
    slot: null,
    submitted: false,
    lookupDate: null,
  };

  var $ = function (id) { return document.getElementById(id); };

  // ---- date helpers ----

  function today() {
    var n = new Date();
    n.setHours(0, 0, 0, 0);
    return n;
  }
  function baseFirst(offset) {
    var n = today();
    return new Date(n.getFullYear(), n.getMonth() + offset, 1);
  }
  function keyOf(y, m, d) { return y + '-' + m + '-' + d; }
  function fromKey(key) {
    var p = key.split('-').map(Number);
    return new Date(p[0], p[1], p[2]);
  }
  function pretty(key) {
    if (!key) return '';
    return fromKey(key).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }
  function monthLabel(offset) {
    return baseFirst(offset).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // ---- simulated availability (see note at top) ----

  function tourAvail(dt) {
    if (dt < today()) return 'past';
    var day = dt.getDay(), date = dt.getDate(), m = dt.getMonth();
    var peak = m >= 4 && m <= 9;
    if (day === 0) return 'closed';
    if (day === 6 && peak && date % 3 !== 0) return 'closed';
    return 'open';
  }

  function eventStatus(dt) {
    if (dt < today()) return 'past';
    var day = dt.getDay(), date = dt.getDate(), m = dt.getMonth();
    var peak = m >= 4 && m <= 9;
    if (day === 6) return peak ? (date % 3 === 0 ? 'hold' : 'booked') : (date % 4 === 0 ? 'open' : 'booked');
    if (day === 5 || day === 0) return date % 3 === 0 ? 'booked' : (date % 5 === 0 ? 'hold' : 'open');
    return 'open';
  }

  // ---- calendars ----

  function buildCalendar(mode) {
    var first = baseFirst(mode === 'book' ? state.month : state.lookMonth);
    var y = first.getFullYear(), m = first.getMonth();
    var lead = first.getDay();
    var days = new Date(y, m + 1, 0).getDate();

    var grid = document.createElement('div');
    grid.className = 'cal';

    ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(function (w) {
      var el = document.createElement('div');
      el.className = 'wd';
      el.textContent = w;
      grid.appendChild(el);
    });
    for (var i = 0; i < lead; i++) grid.appendChild(document.createElement('div'));

    for (var d = 1; d <= days; d++) {
      var dt = new Date(y, m, d);
      var key = keyOf(y, m, d);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day';
      btn.textContent = d;
      btn.setAttribute('aria-label', dt.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
      }));

      if (mode === 'book') {
        var a = tourAvail(dt);
        if (a === 'open') {
          btn.classList.add('open');
          btn.addEventListener('click', pickTourDate.bind(null, key));
        } else {
          btn.classList.add('muted');
          btn.disabled = true;
        }
        if (state.selectedDate === key) {
          btn.classList.remove('open');
          btn.classList.add('selected');
          btn.setAttribute('aria-pressed', 'true');
        }
      } else {
        var s = eventStatus(dt);
        if (s === 'past') {
          btn.classList.add('lk-past');
          btn.disabled = true;
        } else {
          btn.classList.add('lk-' + s);
          btn.addEventListener('click', pickLookupDate.bind(null, key));
        }
        if (state.lookupDate === key) {
          btn.classList.add('lk-selected');
          btn.setAttribute('aria-pressed', 'true');
        }
      }
      grid.appendChild(btn);
    }
    return grid;
  }

  function renderBookCalendar() {
    $('book-month').textContent = monthLabel(state.month);
    var mount = $('book-calendar');
    mount.replaceChildren(buildCalendar('book'));
  }

  function renderLookCalendar() {
    $('look-month').textContent = monthLabel(state.lookMonth);
    var mount = $('look-calendar');
    mount.replaceChildren(buildCalendar('lookup'));
  }

  // ---- time slots ----

  function renderSlots() {
    var mount = $('slots');
    if (!state.selectedDate) {
      var p = document.createElement('div');
      p.className = 'slots-empty';
      p.textContent = 'Pick a day on the calendar to see tour times.';
      mount.replaceChildren(p);
      return;
    }
    var d = Number(state.selectedDate.split('-')[2]);
    var wrap = document.createElement('div');
    wrap.className = 'slots';
    TIMES.forEach(function (t, i) {
      var taken = (d + i) % 4 === 0;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot';
      btn.textContent = t;
      if (taken) {
        btn.disabled = true;
      } else {
        btn.addEventListener('click', function () {
          state.slot = t;
          renderSlots();
          updateConfirm();
        });
      }
      if (state.slot === t) {
        btn.classList.add('selected');
        btn.setAttribute('aria-pressed', 'true');
      }
      wrap.appendChild(btn);
    });
    mount.replaceChildren(wrap);
  }

  // ---- booking flow ----

  function pickTourDate(key) {
    state.selectedDate = key;
    state.slot = null;
    $('selected-label').textContent = pretty(key);
    renderBookCalendar();
    renderSlots();
    updateConfirm();
  }

  function canConfirm() {
    return !!(state.selectedDate && state.slot &&
      $('f-name').value.trim() && $('f-email').value.trim());
  }

  function updateConfirm() {
    var can = canConfirm();
    $('confirm').disabled = !can;
    $('confirm-hint').textContent = can ? '' : 'Choose a date, a time, and your name to book';
  }

  function submit() {
    if (!canConfirm()) return;
    state.submitted = true;
    $('conf-date').textContent = pretty(state.selectedDate);
    $('conf-slot').textContent = state.slot;
    $('conf-email').textContent = $('f-email').value.trim() || 'your inbox';
    $('widget').hidden = true;
    $('confirmation').hidden = false;
  }

  function reset() {
    state.submitted = false;
    state.selectedDate = null;
    state.slot = null;
    $('selected-label').textContent = 'Select a date';
    $('confirmation').hidden = true;
    $('widget').hidden = false;
    renderBookCalendar();
    renderSlots();
    updateConfirm();
  }

  // ---- check your date ----

  var LOOK_MAP = {
    open: {
      c: '#A05B45', h: 'Open',
      d: 'This date is available. Start an inquiry and we’ll place a courtesy hold while you decide.',
    },
    hold: {
      c: '#56564F', h: 'On hold',
      d: 'Someone has a soft hold on this date. It’s not booked yet — ask us and we’ll tell you where it stands.',
    },
    booked: {
      c: '#2B2B27', h: 'Booked',
      d: 'This date is taken. Tell us your next choice and we’ll check the days around it.',
    },
  };

  function pickLookupDate(key) {
    state.lookupDate = key;
    renderLookCalendar();
    updateLookStatus();
  }

  function updateLookStatus() {
    var lk = state.lookupDate ? LOOK_MAP[eventStatus(fromKey(state.lookupDate))] : null;
    if (!lk) {
      lk = { c: '#56564F', h: 'Pick a date', d: 'Tap any day to see whether it’s open, on hold, or booked.' };
    }
    $('look-headline').textContent = lk.h;
    $('look-headline').style.color = lk.c;
    $('look-detail').textContent = lk.d;
  }

  // ---- wiring ----

  function clampNav(offsetKey, delta, min, max, render) {
    state[offsetKey] = Math.min(max, Math.max(min, state[offsetKey] + delta));
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('book-prev').addEventListener('click', function () { clampNav('month', -1, 0, 6, renderBookCalendar); });
    $('book-next').addEventListener('click', function () { clampNav('month', 1, 0, 6, renderBookCalendar); });
    $('look-prev').addEventListener('click', function () { clampNav('lookMonth', -1, 0, 11, renderLookCalendar); });
    $('look-next').addEventListener('click', function () { clampNav('lookMonth', 1, 0, 11, renderLookCalendar); });

    $('f-name').addEventListener('input', updateConfirm);
    $('f-email').addEventListener('input', updateConfirm);
    $('confirm').addEventListener('click', submit);
    $('reset').addEventListener('click', reset);

    renderBookCalendar();
    renderSlots();
    updateConfirm();
    renderLookCalendar();
    updateLookStatus();
  });
})();
