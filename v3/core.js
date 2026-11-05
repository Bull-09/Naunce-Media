/* Nuance Media: lean interactions. Nav, reveal, video autoplay, filters, lightbox, lead form. */
(function () {
  'use strict';
  var FORM_ENDPOINT = ''; // Set to a form service or API route URL to send leads. Empty means copy-to-email fallback.
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function io(els, cb, opts) {
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { cb(e, true); }); return; }
    var o = new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.target, e.isIntersecting); }); }, opts || { threshold: 0.15 });
    els.forEach(function (e) { o.observe(e); });
  }

  /* nav */
  var nav = $('#nav'), burger = $('#burger');
  function onScrollNav() { nav.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScrollNav, { passive: true }); onScrollNav();
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  /* reveal */
  io($$('.rv'), function (el, on) { if (on) el.classList.add('in'); }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });

  /* service buttons preselect the form chip */
  $$('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () { try { sessionStorage.setItem('nm-svc', a.getAttribute('data-service')); } catch (e) {} });
  });
  try { var pre = sessionStorage.getItem('nm-svc'); if (pre) $$('input[name="svc"]').forEach(function (c) { c.checked = c.value === pre; }); } catch (e) {}

  /* videos play only while visible */
  io($$('video[data-auto]'), function (v, on) {
    if (on) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
  }, { threshold: 0.25 });

  /* filters */
  $$('[data-filters]').forEach(function (bar) {
    var tgt = $(bar.getAttribute('data-filters'));
    $$('button', bar).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', bar).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var f = b.getAttribute('data-f');
        $$('[data-cat]', tgt).forEach(function (it) { it.hidden = !(f === 'all' || it.getAttribute('data-cat').split(' ').indexOf(f) > -1); });
      });
    });
  });

  /* lightbox */
  var lb = $('#lb'), lbimg = lb && $('img', lb), lbcap = lb && $('figcaption', lb);
  if (lb) {
    $$('[data-zoom]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var im = el.tagName === 'IMG' ? el : $('img', el);
        lbimg.src = el.getAttribute('data-zoom') || im.src; lbimg.alt = im.alt || '';
        lbcap.textContent = im.alt || '';
        lb.hidden = false; document.body.style.overflow = 'hidden'; $('button', lb).focus();
      });
    });
    var closeLb = function () { lb.hidden = true; document.body.style.overflow = ''; };
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('button')) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
  }

  /* lead form */
  var f = $('#lead');
  if (f) {
    var res = $('#result'), msg = $('#result-msg'), sum = $('#summary'), copy = $('#copy'), mail = $('#mail');
    var collect = function () {
      var d = new FormData(f), svc = d.getAll('svc');
      return ['Name: ' + (d.get('name') || ''), 'Business: ' + (d.get('business') || ''), 'Email: ' + (d.get('email') || ''), 'Phone: ' + (d.get('phone') || ''),
        'Type of business: ' + (d.get('type') || ''), 'Monthly ad budget: ' + (d.get('budget') || ''), 'Needs: ' + (svc.length ? svc.join(', ') : ''), 'Notes: ' + (d.get('message') || '')].join('\n');
    };
    var showFallback = function (text) {
      msg.textContent = 'This page cannot send messages by itself yet. Copy your details and email them to hi@thenuancemedia.com, or call +91 90547 79097.';
      sum.value = text;
      mail.href = 'mailto:hi@thenuancemedia.com?subject=' + encodeURIComponent('Growth plan request') + '&body=' + encodeURIComponent(text);
      res.hidden = false; res.focus();
    };
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var text = collect();
      if (!FORM_ENDPOINT) { showFallback(text); return; }
      var d = new FormData(f), payload = {};
      d.forEach(function (v, k) { if (k === 'svc') { (payload.svc = payload.svc || []).push(v); } else payload[k] = v; });
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error('bad'); msg.textContent = 'Thanks. We have your details and will reply by email.'; sum.hidden = true; $('.actions', res).hidden = true; res.hidden = false; f.reset(); res.focus(); })
        .catch(function () { showFallback(text); });
    });
    copy.addEventListener('click', function () {
      var fb = function () { sum.focus(); sum.select(); copy.textContent = 'Press copy on your keyboard'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(sum.value).then(function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy details'; }, 2000); }).catch(fb); else fb();
    });
  }
})();
