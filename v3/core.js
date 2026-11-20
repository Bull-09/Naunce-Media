/* Nuance Media: shared site interactions. */
(function () {
  'use strict';
  var FORM_ENDPOINT = '/api/contact';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function io(els, cb, opts) {
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { cb(e, true); }); return; }
    var o = new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.target, e.isIntersecting, o); }); }, opts || { threshold: 0.15 });
    els.forEach(function (e) { o.observe(e); });
  }

  /* ---------- nav ---------- */
  var nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  function onScrollNav() { nav.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScrollNav, { passive: true }); onScrollNav();
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); } });

  /* ---------- scroll progress bar ---------- */
  var bar = $('#sbar');
  if (bar) {
    var onProg = function () { var h = document.documentElement.scrollHeight - window.innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? clamp(window.scrollY / h, 0, 1) : 0).toFixed(4) + ')'; };
    window.addEventListener('scroll', onProg, { passive: true }); onProg();
  }

  /* ---------- reveal on scroll ---------- */
  io($$('.rv'), function (el, on, o) { if (on) { el.classList.add('in'); if (o) o.unobserve(el); } }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  /* ---------- counters ---------- */
  function fmt(v, el) {
    var d = parseInt(el.getAttribute('data-dec') || '0', 10), pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '';
    return pre + v.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }) + suf;
  }
  $$('[data-count]').forEach(function (el) { el.textContent = fmt(reduce ? parseFloat(el.getAttribute('data-count')) : 0, el); });
  io($$('[data-count]'), function (el, on, o) {
    if (!on || el.__done) return; el.__done = true; if (o) o.unobserve(el);
    var to = parseFloat(el.getAttribute('data-count')), t0 = performance.now(), dur = 1400;
    if (reduce) { el.textContent = fmt(to, el); return; }
    (function step(now) {
      var k = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(to * e, el);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }, { threshold: 0.4 });

  /* ---------- ROAS bars ---------- */
  io($$('.bars'), function (el, on, o) { if (on) { el.classList.add('in'); if (o) o.unobserve(el); } }, { threshold: 0.3 });

  /* ---------- services accordion ---------- */
  var svcs = $$('.svc');
  function setSvc(target) {
    svcs.forEach(function (s) {
      var open = s === target ? s.getAttribute('data-open') !== 'true' : false;
      s.setAttribute('data-open', String(open));
      $('.svc-head', s).setAttribute('aria-expanded', String(open));
    });
  }
  svcs.forEach(function (s) { $('.svc-head', s).addEventListener('click', function () { setSvc(s); }); });
  /* open the matching accordion item when arriving via services.html#web etc. */
  if (svcs.length && location.hash) {
    var tgt = document.getElementById(location.hash.slice(1));
    var svc = tgt && tgt.closest('.svc');
    if (svc && svc.getAttribute('data-open') !== 'true') setSvc(svc);
  }

  /* ---------- service buttons preselect form chips ---------- */
  $$('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () {
      var v = a.getAttribute('data-service');
      try { sessionStorage.setItem('nm-svc', v); } catch (e) {}
      $$('input[name="svc"]').forEach(function (c) { c.checked = c.value === v; });
    });
  });
  try { var pre = sessionStorage.getItem('nm-svc'); if (pre) $$('input[name="svc"]').forEach(function (c) { c.checked = c.value === pre; }); } catch (e) {}

  /* ---------- timeline ---------- */
  var tl = $('#timeline');
  if (tl) {
    var steps = $$('.step', tl);
    var onTl = function () {
      var r = tl.getBoundingClientRect(), vh = window.innerHeight;
      tl.style.setProperty('--p', clamp((vh * 0.62 - r.top) / r.height, 0, 1).toFixed(3));
      steps.forEach(function (s) { s.classList.toggle('on', s.getBoundingClientRect().top < vh * 0.62); });
    };
    window.addEventListener('scroll', onTl, { passive: true }); window.addEventListener('resize', onTl); onTl();
  }

  /* ---------- videos: play only while visible ---------- */
  var vids = $$('video[data-auto]');
  if (!reduce) io(vids, function (v, on) {
    if (on) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
  }, { threshold: 0.35 });
  var reel = $('#reel'), snd = $('#snd');
  if (reel && snd) snd.addEventListener('click', function () {
    reel.muted = !reel.muted; snd.setAttribute('aria-pressed', String(!reel.muted));
    snd.textContent = reel.muted ? 'Sound off' : 'Sound on';
    if (!reel.muted) { reel.currentTime = 0; var p = reel.play(); if (p && p.catch) p.catch(function () {}); }
  });

  /* ---------- filters ---------- */
  $$('[data-filters]').forEach(function (fb) {
    var tgt = $(fb.getAttribute('data-filters'));
    $$('button', fb).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', fb).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var f = b.getAttribute('data-f');
        $$('[data-cat]', tgt).forEach(function (it) { it.hidden = !(f === 'all' || it.getAttribute('data-cat').split(' ').indexOf(f) > -1); });
      });
    });
  });

  /* ---------- lightbox ---------- */
  var lb = $('#lb'), lbimg = lb && $('img', lb), lbcap = lb && $('figcaption', lb), lastFocus = null;
  if (lb) {
    $$('[data-zoom]').forEach(function (el) {
      el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', 'Enlarge creative');
      var open = function (e) {
        e.preventDefault(); lastFocus = el;
        var im = el.tagName === 'IMG' ? el : $('img', el);
        lbimg.src = el.getAttribute('data-zoom') || im.src; lbimg.alt = im.alt || '';
        lbcap.textContent = el.getAttribute('data-cap') || '';
        lb.hidden = false; document.body.style.overflow = 'hidden'; $('button', lb).focus();
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') open(e); });
    });
    var closeLb = function () { lb.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('button')) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
  }

  /* ---------- lead form ---------- */
  var f = $('#lead');
  if (f) {
    var res = $('#result'), title = $('#result-title'), msg = $('#result-msg'), sum = $('#summary'), copy = $('#copy'), mail = $('#mail'), send = $('#send'), err = $('#form-err');
    var collect = function () {
      var d = new FormData(f), svc = d.getAll('svc');
      return ['Name: ' + (d.get('name') || ''), 'Business: ' + (d.get('business') || ''), 'Email: ' + (d.get('email') || ''), 'Phone: ' + (d.get('phone') || ''),
        'Type of business: ' + (d.get('type') || ''), 'Monthly ad budget: ' + (d.get('budget') || ''), 'Needs: ' + (svc.length ? svc.join(', ') : ''), 'Notes: ' + (d.get('message') || '')].join('\n');
    };
    var showResult = function (ok, text) {
      f.hidden = true;
      if (ok) {
        title.textContent = 'Thank you. Your request is in.';
        msg.textContent = 'We will reply by email or WhatsApp within one working day. If it is urgent, call +91 90547 79097.';
        sum.hidden = true; $('.actions', res).hidden = true;
      } else {
        title.textContent = 'Almost there.';
        msg.textContent = 'We could not send your request from this page just now. Your details are below: email them to hi@thenuancemedia.com or call +91 90547 79097.';
        sum.hidden = false; sum.value = text; $('.actions', res).hidden = false;
        mail.href = 'mailto:hi@thenuancemedia.com?subject=' + encodeURIComponent('Growth plan request') + '&body=' + encodeURIComponent(text);
      }
      res.hidden = false; res.focus();
    };
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      err.hidden = true;
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var text = collect(), d = new FormData(f), payload = { page: location.pathname };
      d.forEach(function (v, k) { if (k === 'svc') { (payload.svc = payload.svc || []).push(v); } else payload[k] = v; });
      send.disabled = true; send.textContent = 'Sending...';
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) {
          if (r.status === 400) return r.json().then(function (j) { throw { field: true, message: j.error }; });
          if (!r.ok) throw new Error('server');
          showResult(true); f.reset();
          try { sessionStorage.removeItem('nm-svc'); } catch (x) {}
        })
        .catch(function (x) {
          if (x && x.field) { err.textContent = x.message || 'Please check the form and try again.'; err.hidden = false; return; }
          showResult(false, text);
        })
        .then(function () { send.disabled = false; send.textContent = 'Send my request'; });
    });
    copy.addEventListener('click', function () {
      var fb = function () { sum.focus(); sum.select(); copy.textContent = 'Press copy on your keyboard'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(sum.value).then(function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy details'; }, 2000); }).catch(fb); else fb();
    });
  }

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
