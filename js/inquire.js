// The "Plan your event" inquiry form.
//
// Where an inquiry goes is set in config.js, in this order:
//   1. inquiryUrl: the form POSTs JSON there and shows the thank-you.
//   2. email:      the visitor's email app opens with the inquiry written out.
//   3. neither:    the form says plainly that online inquiries are not
//                  connected yet, so nobody thinks a message was sent when it
//                  was not.
// A filled-in hidden field (company_website) marks a bot; it is dropped quietly.
(function () {
  'use strict';

  var V = window.VENUE || {};
  var form = document.getElementById('inquiry');
  if (!form) return;

  var status = document.getElementById('form-status');
  var done = document.getElementById('form-done');
  var submitBtn = form.querySelector('button[type="submit"]');

  // ?type=Wedding (from the Weddings page) preselects the event type.
  var wanted = new URLSearchParams(location.search).get('type');
  if (wanted) {
    var select = form.elements.eventType;
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].text.toLowerCase() === wanted.toLowerCase()) select.selectedIndex = i;
    }
  }

  // No picking a date in the past.
  var dateInput = form.elements.date;
  if (dateInput) {
    var t = new Date();
    dateInput.min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  }

  function setError(input, message) {
    var err = document.getElementById(input.id + '-err');
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) {
      err.textContent = message || '';
      err.hidden = !message;
      if (message) input.setAttribute('aria-describedby', err.id);
      else input.removeAttribute('aria-describedby');
    }
  }

  function validate() {
    var ok = true;
    var name = form.elements.name;
    var email = form.elements.email;
    if (!name.value.trim()) { setError(name, 'Please tell us your name.'); ok = false; } else setError(name, '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError(email, 'Please enter an email address we can reply to.'); ok = false; } else setError(email, '');
    if (!ok) {
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
    }
    return ok;
  }

  function collect() {
    return {
      name: form.elements.name.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      eventType: form.elements.eventType.value,
      date: form.elements.date.value,
      guests: form.elements.guests.value,
      flexible: form.elements.flexible.value,
      contactBy: form.elements.contactBy.value,
      tour: form.elements.tour.checked,
      message: form.elements.message.value.trim(),
      company_website: form.elements.company_website.value,
      venue: V.name || '',
      page: location.href,
    };
  }

  function prettyDate(iso) {
    if (!iso) return '';
    var p = iso.split('-').map(Number);
    return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  function showStatus(html) {
    status.innerHTML = html;
    status.hidden = false;
  }

  function showDone(data) {
    var nameEl = document.getElementById('done-name');
    if (nameEl) nameEl.textContent = data.name.split(' ')[0] || 'friend';
    form.hidden = true;
    done.hidden = false;
    done.focus();
  }

  function asEmail(data) {
    var facts = [
      'Name: ' + data.name,
      'Email: ' + data.email,
      data.phone ? 'Phone: ' + data.phone : '',
      data.eventType ? 'Event: ' + data.eventType : '',
      data.date ? 'Date: ' + prettyDate(data.date) : '',
      data.guests ? 'Guests: about ' + data.guests : '',
      data.flexible ? 'Dates flexible: ' + data.flexible : '',
      data.contactBy ? 'Best way to reach me: ' + data.contactBy : '',
      data.tour ? 'Would like to see the room in person.' : '',
    ].filter(Boolean);
    var body = facts.join('\n') + (data.message ? '\n\n' + data.message : '');
    var subject = 'Event inquiry' + (data.eventType ? ': ' + data.eventType : '') + (data.date ? ', ' + prettyDate(data.date) : '');
    return 'mailto:' + V.email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.hidden = true;
    if (!validate()) return;
    var data = collect();
    if (data.company_website) { showDone(data); return; }

    if (V.inquiryUrl) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      fetch(V.inquiryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
        .then(function (res) {
          if (!res.ok) throw new Error('status ' + res.status);
          showDone(data);
        })
        .catch(function () {
          // The guest's details are already written into the email link, so
          // nothing they typed is lost.
          showStatus('Something went wrong sending your note.' +
            (V.email ? ' <a href="' + asEmail(data) + '">Send it by email instead</a>, with everything you wrote already filled in.' : ' Please try again in a moment.'));
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send inquiry';
        });
      return;
    }

    if (V.email) {
      window.location.href = asEmail(data);
      showStatus('Your email app should open with your note ready to send. If it does not, write to us at <a href="mailto:' + V.email + '">' + V.email + '</a>.');
      return;
    }

    showStatus('Online inquiries are not connected yet, so this form cannot send your note.' +
      (V.facebookUrl ? ' Please <a href="' + V.facebookUrl + '" target="_blank" rel="noopener">message us on Facebook</a> in the meantime.' : ' Please check back soon.'));
  });
})();
