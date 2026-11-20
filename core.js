/* Nuance Media v5: shared interactions. */
(function () {
  'use strict';
  var FORM_ENDPOINT = '/api/contact';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* nav */
  var nav = $('#nav'), burger = $('#burger'), menu = $('#menu');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); } });

  /* videos play only while visible */
  var vids = $$('video[data-auto]');
  if (!reduce && 'IntersectionObserver' in window) {
    var vo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { var p = e.target.play(); if (p && p.catch) p.catch(function () {}); } else e.target.pause();
      });
    }, { threshold: 0.3 });
    vids.forEach(function (v) { vo.observe(v); });
  }

  /* filters */
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

  /* lightbox */
  var lb = $('#lb');
  if (lb) {
    var lbimg = $('img', lb), last = null;
    $$('[data-zoom]').forEach(function (el) {
      el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
      if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.classList.contains('shot') ? 'Enlarge screenshot' : 'Enlarge creative');
      var open = function (e) {
        e.preventDefault(); last = el;
        var im = $('img', el);
        lbimg.src = el.getAttribute('data-zoom'); lbimg.alt = im ? im.alt : '';
        lb.hidden = false; document.body.style.overflow = 'hidden'; $('button', lb).focus();
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') open(e); });
    });
    var close = function () { lb.hidden = true; document.body.style.overflow = ''; if (last) last.focus(); };
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('button')) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) close(); });
  }

  /* service links preselect form chips */
  try {
    var q = new URLSearchParams(location.search).get('need');
    if (q) $$('input[name="svc"]').forEach(function (c) { if (c.value === q) c.checked = true; });
  } catch (e) {}

  /* forms: lead, creator, careers all post JSON to FORM_ENDPOINT */
  $$('form[data-form]').forEach(function (f) {
    var box = f.parentNode, res = $('.result', box), title = $('.r-title', box), msg = $('.r-msg', box),
        sum = $('textarea.r-sum', box), acts = $('.r-actions', box), copy = $('.r-copy', box),
        err = $('.form-err', f), send = $('button[type="submit"]', f), label = send.textContent;
    var collect = function () {
      var d = new FormData(f), out = ['Form: ' + f.getAttribute('data-form')];
      var seen = {};
      d.forEach(function (v, k) { if (seen[k]) return; seen[k] = 1; var all = d.getAll(k); out.push(k + ': ' + all.join(', ')); });
      return out.join('\n');
    };
    var show = function (ok, text) {
      f.hidden = true; res.hidden = false;
      if (ok) {
        title.textContent = 'Got it. A human will reply soon.';
        msg.textContent = 'We reply by email or WhatsApp within one working day. Urgent? Call +91 90547 79097.';
        sum.hidden = true; acts.hidden = true;
      } else {
        title.textContent = 'Almost there.';
        msg.textContent = 'This page could not send your message just now. Copy the details below and email them to hi@thenuancemedia.com, or WhatsApp +91 90547 79097.';
        sum.hidden = false; sum.value = text; acts.hidden = false;
      }
      res.focus();
    };
    f.addEventListener('submit', function (e) {
      e.preventDefault(); err.hidden = true;
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var text = collect(), d = new FormData(f), payload = { form: f.getAttribute('data-form'), page: location.pathname };
      d.forEach(function (v, k) { if (k === 'svc') { (payload.svc = payload.svc || []).push(v); } else payload[k] = v; });
      send.disabled = true; send.textContent = 'Sending...';
      fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) {
          if (r.status === 400) return r.json().then(function (j) { throw { field: true, message: j.error }; });
          if (!r.ok) throw new Error('server');
          show(true); f.reset();
        })
        .catch(function (x) {
          if (x && x.field) { err.textContent = x.message || 'Please check the form and try again.'; err.hidden = false; return; }
          show(false, text);
        })
        .then(function () { send.disabled = false; send.textContent = label; });
    });
    if (copy) copy.addEventListener('click', function () {
      var fb = function () { sum.focus(); sum.select(); copy.textContent = 'Selected. Press copy.'; };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(sum.value).then(function () { copy.textContent = 'Copied'; setTimeout(function () { copy.textContent = 'Copy details'; }, 2000); }).catch(fb); else fb();
    });
  });

  /* ---------- final: motion layer ---------- */
  document.documentElement.classList.add('js');
  var hasIO = 'IntersectionObserver' in window;

  /* scroll progress bar */
  var bar = document.createElement('div'); bar.className = 'sbar'; bar.setAttribute('aria-hidden', 'true'); document.body.appendChild(bar);
  var onProg = function () { var h = document.documentElement.scrollHeight - window.innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0).toFixed(4) + ')'; };
  window.addEventListener('scroll', onProg, { passive: true }); onProg();

  /* reveal: only things that start below the fold, so nothing visible ever blinks */
  if (hasIO && !reduce) {
    var groups = ['.sec-head', '.stat', '.card', '.case-card', '.reel', '.wall figure', '.tile4', '.dd', '.nope li', '.sites li', '.steps li', '.faq', '.statement > *', '.cta > *', '.kpis', '.person', '.principles li', '.answer'];
    var rvEls = [];
    groups.forEach(function (sel) {
      $$(sel).forEach(function (el) {
        if (el.classList.contains('rv') || el.getBoundingClientRect().top < window.innerHeight * 0.95) return;
        var sib = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
        el.classList.add('rv'); el.style.setProperty('--i', String(Math.min(sib, 5))); rvEls.push(el);
      });
    });
    var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }); }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    rvEls.forEach(function (el) { ro.observe(el); });
  }

  /* ROAS bars */
  $$('.roas, .proof').forEach(function (el) {
    if (!hasIO || reduce) { el.classList.add('in'); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { el.classList.add('in'); o.disconnect(); } }, { threshold: 0.3 });
    o.observe(el);
  });

  /* count-up for stat numbers like 6x, 7.11x, ₹92.9L, ₹58, 500+ */
  $$('.stat b, .chip b, .kpis b').forEach(function (el) {
    var raw = el.textContent, m = raw.match(/^(\D*?)([\d,]+(?:\.\d+)?)(.*)$/);
    if (!m || reduce || !hasIO) return;
    var pre = m[1], num = parseFloat(m[2].replace(/,/g, '')), suf = m[3], dec = (m[2].split('.')[1] || '').length, comma = m[2].indexOf(',') > -1;
    var fmt = function (v) { var s = v.toFixed(dec); if (comma) s = Number(s).toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec }); return pre + s + suf; };
    var o = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; o.disconnect();
      var t0 = performance.now(), dur = 1300;
      (function step(now) { var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(num * e); if (k < 1) requestAnimationFrame(step); else el.textContent = raw; })(t0);
    }, { threshold: 0.5 });
    o.observe(el);
  });

  /* hero phone: gentle tilt and parallax chips */
  var hv = $('.hero-visual');
  if (hv && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var ph = $('.phone', hv);
    window.addEventListener('pointermove', function (e) {
      var x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      ph.style.setProperty('--ry', (-6 + x * 10).toFixed(2) + 'deg');
      ph.style.setProperty('--rx', (2 - y * 6).toFixed(2) + 'deg');
      hv.style.setProperty('--px', (x * 14).toFixed(1) + 'px');
      hv.style.setProperty('--py', (y * 10).toFixed(1) + 'px');
    }, { passive: true });
  }

  /* spam trap on every form */
  $$('form[data-form]').forEach(function (f) {
    if (f.querySelector('[name="company"]')) return;
    var d = document.createElement('div'); d.className = 'hp'; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<label>Company<input name="company" tabindex="-1" autocomplete="off"></label>';
    f.insertBefore(d, f.firstChild);
  });

  /* tabs (receipts: Meta Ads / Shopify) */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    var select = function (t, focus) {
      tabs.forEach(function (x) {
        var on = x === t;
        x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
        var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on;
      });
      if (focus) t.focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (k) { e.preventDefault(); select(tabs[(i + k + tabs.length) % tabs.length], true); }
      });
    });
  });

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
