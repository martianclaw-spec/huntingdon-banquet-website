// Site-wide behaviour: venue identity from config.js, the header, the phone
// menu, scroll reveals, the photo lightbox, and links that only appear once
// config.js has a value for them (Facebook, email, phone).
(function () {
  'use strict';

  var V = window.VENUE || {};
  var root = document.documentElement;
  root.classList.add('js');

  // ---- venue identity ----

  if (V.name) {
    document.querySelectorAll('[data-venue-name]').forEach(function (el) { el.textContent = V.name; });
    if (document.title.indexOf(V.name) === -1) {
      document.title = document.title.replace('The Loft at 708', V.name);
    }
  }

  // ---- links that depend on config ----

  var cleanPhone = (V.phone || '').replace(/[^\d+]/g, '');
  var hrefs = {
    facebook: V.facebookUrl || '',
    email: V.email ? 'mailto:' + V.email : '',
    phone: cleanPhone ? 'tel:' + cleanPhone : '',
    maps: 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent((V.address || '708 Washington Street') + ', ' + (V.city || 'Huntingdon, PA')),
  };
  var texts = { email: V.email || '', phone: V.phone || '' };

  document.querySelectorAll('[data-config-link]').forEach(function (el) {
    var href = hrefs[el.getAttribute('data-config-link')];
    if (href) el.setAttribute('href', href);
  });
  document.querySelectorAll('[data-config-text]').forEach(function (el) {
    var t = texts[el.getAttribute('data-config-text')];
    if (t) el.textContent = t;
  });
  document.querySelectorAll('[data-requires]').forEach(function (el) {
    var needs = el.getAttribute('data-requires').split(/\s+/);
    var ok = needs.some(function (k) { return !!hrefs[k]; });
    el.hidden = !ok;
  });

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // "Copy link" on the guests page, so a couple can paste it into an invite.
  document.querySelectorAll('[data-copy-link]').forEach(function (btn) {
    if (!navigator.clipboard) { btn.hidden = true; return; }
    var note = btn.parentNode.querySelector('.copy-link__done');
    btn.addEventListener('click', function () {
      var url = location.href.split('?')[0].split('#')[0];
      navigator.clipboard.writeText(url).then(function () {
        if (note) { note.textContent = 'Link copied'; setTimeout(function () { note.textContent = ''; }, 2600); }
      });
    });
  });

  // ---- header: transparent over the photo, solid once you scroll ----

  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-solid', window.scrollY > 40 || document.body.classList.contains('menu-open'));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- phone menu ----

  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    if (!toggle || !menu) return;
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if ('inert' in menu) menu.inert = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    onScroll();
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    }
  }
  if (toggle && menu) {
    setMenu(false);
    toggle.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('menu-open'));
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
        setMenu(false);
        toggle.focus();
      }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1080 && document.body.classList.contains('menu-open')) setMenu(false);
    });
  }

  // ---- scroll reveal ----

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // ---- in-page menu: underline the section being read ----

  var subLinks = Array.prototype.slice.call(document.querySelectorAll('.subnav a[href^="#"]'));
  if (subLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    subLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        subLinks.forEach(function (a) { a.classList.remove('is-active'); });
        var link = byId[entry.target.id];
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  // ---- photo lightbox ----
  //
  // Gallery items are buttons wrapping a <picture>. The lightbox shows the
  // image the browser actually loaded (currentSrc), so a photo the owner has
  // replaced through the admin shows as the replacement here too.

  var items = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));
  if (items.length && typeof HTMLDialogElement === 'function') {
    var box = document.createElement('dialog');
    box.className = 'lightbox';
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML =
      '<img class="lightbox__img" alt="">' +
      '<button type="button" class="lightbox__btn lightbox__close" aria-label="Close">&#x2715;</button>' +
      '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Previous photo">&#x2039;</button>' +
      '<button type="button" class="lightbox__btn lightbox__next" aria-label="Next photo">&#x203A;</button>' +
      '<p class="lightbox__count" aria-live="polite"></p>';
    document.body.appendChild(box);

    var big = box.querySelector('.lightbox__img');
    var count = box.querySelector('.lightbox__count');
    var index = 0;

    function show(i) {
      index = (i + items.length) % items.length;
      var img = items[index].querySelector('img');
      big.src = img ? (img.currentSrc || img.src) : '';
      big.alt = img ? img.alt : '';
      count.textContent = (index + 1) + ' / ' + items.length;
    }

    items.forEach(function (item, i) {
      item.addEventListener('click', function () {
        show(i);
        box.showModal();
      });
    });
    box.querySelector('.lightbox__close').addEventListener('click', function () { box.close(); });
    box.querySelector('.lightbox__prev').addEventListener('click', function () { show(index - 1); });
    box.querySelector('.lightbox__next').addEventListener('click', function () { show(index + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    box.addEventListener('close', function () {
      if (items[index]) items[index].focus();
    });
  }
})();
