/* Nuance Media: shared interactions, CSS 3D components and the Three.js ROAS towers. */
(function () {
  'use strict';
  var FORM_ENDPOINT = ''; // Set to a form service or API route URL to send leads. Empty means copy-to-email fallback.
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function io(els, cb, opts) {
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { cb(e, true); }); return; }
    var o = new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.target, e.isIntersecting, o); }); }, opts || { threshold: 0.15 });
    els.forEach(function (e) { o.observe(e); });
  }

  /* ---------- nav ---------- */
  var nav = $('#nav'), burger = $('#burger');
  function onScrollNav() { nav.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScrollNav, { passive: true }); onScrollNav();
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  /* ---------- scroll progress bar ---------- */
  var bar = $('#sbar');
  function onProg() { var h = document.documentElement.scrollHeight - window.innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? clamp(window.scrollY / h, 0, 1) : 0).toFixed(4) + ')'; }
  window.addEventListener('scroll', onProg, { passive: true }); onProg();

  /* ---------- 3D reveal on scroll ---------- */
  io($$('.rv'), function (el, on) { if (on) el.classList.add('in'); }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  /* ---------- scroll depth: layers drift at different speeds ---------- */
  var depthEls = $$('[data-depth]');
  function onDepth() {
    if (reduce) return;
    var vh = window.innerHeight;
    depthEls.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh, d = parseFloat(el.getAttribute('data-depth')) || 0.2;
      el.style.setProperty('--dy', (-p * d * 160).toFixed(1) + 'px');
      el.style.setProperty('--dr', (p * d * 14).toFixed(2) + 'deg');
    });
  }
  if (depthEls.length) { window.addEventListener('scroll', onDepth, { passive: true }); onDepth(); }

  /* ---------- pointer tilt with glare ---------- */
  $$('[data-tilt]').forEach(function (el) {
    var max = parseFloat(el.getAttribute('data-tilt')) || 10;
    el.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch' || reduce) return;
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--ry', (x * max * 2).toFixed(2) + 'deg');
      el.style.setProperty('--rx', (-y * max * 2).toFixed(2) + 'deg');
      el.style.setProperty('--gx', ((x + 0.5) * 100).toFixed(0) + '%');
      el.style.setProperty('--gy', ((y + 0.5) * 100).toFixed(0) + '%');
    });
    el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });

  /* ---------- counters ---------- */
  function fmt(v, el) {
    var d = parseInt(el.getAttribute('data-dec') || '0', 10), pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '';
    return pre + v.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }) + suf;
  }
  io($$('[data-count]'), function (el, on, o) {
    if (!on || el.__done) return; el.__done = true; if (o) o.unobserve(el);
    var to = parseFloat(el.getAttribute('data-count')), t0 = performance.now(), dur = 1700;
    if (reduce) { el.textContent = fmt(to, el); return; }
    (function step(now) {
      var k = clamp((now - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(to * e, el);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }, { threshold: 0.4 });
  $$('[data-count]').forEach(function (el) { if (!el.__done) el.textContent = fmt(0, el); });

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

  /* ---------- service buttons preselect form chips (same page) ---------- */
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
  io(vids, function (v, on) {
    if (on) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause();
  }, { threshold: 0.25 });
  var reel = $('#reel'), snd = $('#snd');
  if (reel && snd) snd.addEventListener('click', function () {
    reel.muted = !reel.muted; snd.setAttribute('aria-pressed', String(!reel.muted));
    snd.textContent = reel.muted ? 'Sound off' : 'Sound on';
    if (!reel.muted) { reel.currentTime = 0; var p = reel.play(); if (p && p.catch) p.catch(function () {}); }
  });

  /* ---------- cursor ---------- */
  var cursor = $('#cursor'), mx = 0, my = 0, cx = 0, cy = 0;
  if (fine && !reduce && cursor) {
    window.addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; cursor.classList.add('on'); }, { passive: true });
    document.addEventListener('pointerover', function (e) { cursor.classList.toggle('big', !!(e.target.closest && e.target.closest('a,button,.chip,[data-tilt],[data-zoom]'))); });
    (function loop() { cx = lerp(cx, mx, 0.22); cy = lerp(cy, my, 0.22); cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)'; requestAnimationFrame(loop); })();
  }

  /* ---------- filters ---------- */
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

  /* ---------- lightbox ---------- */
  var lb = $('#lb'), lbimg = lb && $('img', lb), lbcap = lb && $('figcaption', lb);
  if (lb) {
    $$('[data-zoom]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        var im = el.tagName === 'IMG' ? el : $('img', el);
        lbimg.src = el.getAttribute('data-zoom') || im.src; lbimg.alt = im.alt || '';
        lbcap.textContent = el.getAttribute('data-cap') || im.alt || '';
        lb.hidden = false; document.body.style.overflow = 'hidden'; $('button', lb).focus();
      });
    });
    var closeLb = function () { lb.hidden = true; document.body.style.overflow = ''; };
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.closest('button')) closeLb(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); });
  }

  /* ---------- 3D carousels: ring (flat cards) and helix (video wall) ---------- */
  function carousel(stage, ring, opts) {
    var cards = $$(opts.item, ring), n = cards.length;
    if (!n) return;
    var ang = 0, vel = 0, base = reduce ? 0 : (opts.speed || 5), dragging = false, lastX = 0, lastT = 0, visible = true, hover = false, scrollBoost = 0, lastY = window.scrollY;
    function setR() {
      var cw = parseFloat(getComputedStyle(cards[0]).width) || 220;
      var r = (cw / 2) / Math.tan(Math.PI / n) * (opts.k || 1.42);
      stage.style.setProperty('--n', n);
      ring.style.setProperty('--r', r.toFixed(1) + 'px');
    }
    setR(); window.addEventListener('resize', setR);
    stage.addEventListener('pointerdown', function (e) {
      dragging = true; lastX = e.clientX; lastT = performance.now(); stage.classList.add('drag');
      try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    });
    stage.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var now = performance.now(), dx = e.clientX - lastX, dt = Math.max(1, now - lastT);
      ang += dx * 0.32; vel = (dx * 0.32) / (dt / 1000); lastX = e.clientX; lastT = now;
    });
    function endDrag() { dragging = false; stage.classList.remove('drag'); }
    stage.addEventListener('pointerup', endDrag); stage.addEventListener('pointercancel', endDrag);
    stage.addEventListener('pointerenter', function () { hover = true; });
    stage.addEventListener('pointerleave', function () { hover = false; });
    var pv = $(opts.prev), nx = $(opts.next);
    if (pv) pv.addEventListener('click', function () { vel -= 160; });
    if (nx) nx.addEventListener('click', function () { vel += 160; });
    io([stage], function (_, on) { visible = on; }, { threshold: 0 });
    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (visible) {
        var dy = window.scrollY - lastY; lastY = window.scrollY;
        scrollBoost = lerp(scrollBoost, clamp(dy * 0.6, -40, 40), 0.2);
        if (!dragging) {
          var target = (hover ? base * 0.25 : base) + (opts.scroll ? scrollBoost * 6 : 0);
          vel = lerp(vel, target, 1 - Math.pow(0.04, dt));
          ang += vel * dt;
        }
        ring.style.setProperty('--a', ang.toFixed(2) + 'deg');
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var rs = $('#ringstage');
  if (rs) carousel(rs, $('#ring'), { item: '.card', prev: '#prev', next: '#next', k: 1.42, speed: 5 });
  var hs = $('#helixstage');
  if (hs && (window.innerWidth < 700 || !fine)) $$('.hx', hs).forEach(function (h, i) { if (i >= 7 && i % 2) h.remove(); });
  if (hs) carousel(hs, $('#helix'), { item: '.hx', prev: '#hprev', next: '#hnext', k: 1.18, speed: 7, scroll: true });


  /* ---------- fly-through tunnel ---------- */
  (function tunnel() {
    var tn = $('#tunnel');
    if (!tn) return;
    if (reduce) { tn.classList.add('static'); return; }
    var layers = $$('.tn-l', tn), n = layers.length, GAP = 1300, vh = window.innerHeight;
    function upd() {
      var r = tn.getBoundingClientRect(), total = tn.offsetHeight - window.innerHeight;
      var p = clamp(-r.top / Math.max(1, total), 0, 1), cam = p * (n - 1) * GAP;
      layers.forEach(function (el, i) {
        var z = cam - i * GAP, last = i === n - 1;
        if (last && z > 0) z = 0;
        var a = last ? clamp((z + 1800) / 1100, 0, 1) : clamp((z + 2200) / 900, 0, 1) * clamp((650 - z) / 450, 0, 1);
        el.style.opacity = a.toFixed(3);
        el.style.transform = 'translate(-50%,-50%) translateZ(' + z.toFixed(0) + 'px)';
        el.style.pointerEvents = last && a > 0.9 ? 'auto' : 'none';
      });
    }
    window.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
  })();

  /* ---------- lead form ---------- */
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

  /* ---------- Three.js ROAS towers ---------- */
  (function towers() {
    var host = $('#towers'), canvas = $('#towers-gl');
    if (!host || !window.THREE) return;
    var T = window.THREE, data;
    try { data = JSON.parse(host.getAttribute('data-bars')); } catch (e) { return; }
    var renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return; }
    host.classList.add('gl-on');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = T.sRGBEncoding;
    var scene = new T.Scene(), camera = new T.PerspectiveCamera(34, 1, 0.1, 80);
    scene.add(new T.AmbientLight(0xffffff, 0.55));
    var l1 = new T.PointLight(0xdc94ff, 2.2, 60); l1.position.set(-6, 8, 8); scene.add(l1);
    var l2 = new T.PointLight(0x6fe3ff, 1.4, 60); l2.position.set(8, 3, 6); scene.add(l2);
    var grid = new T.GridHelper(26, 26, 0x4a0b6b, 0x2a1840); grid.position.y = -0.01; scene.add(grid);
    var group = new T.Group(); scene.add(group);
    var maxV = Math.max.apply(null, data.map(function (d) { return d.v; })), bars = [];
    function label(text, sub) {
      var c = document.createElement('canvas'); c.width = 512; c.height = 256; var g = c.getContext('2d');
      g.textAlign = 'center'; g.fillStyle = '#f3effb'; g.font = '800 64px Syne, Arial Black, sans-serif'; g.fillText(text, 256, 100);
      g.fillStyle = '#a69fbb'; g.font = '500 34px Instrument Sans, Arial, sans-serif'; g.fillText(sub, 256, 150);
      var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding;
      var s = new T.Sprite(new T.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); s.scale.set(3.2, 1.6, 1); return s;
    }
    var gap = 2.7, x0 = -((data.length - 1) * gap) / 2;
    data.forEach(function (d, i) {
      var h = d.v / maxV * 5.4 + 0.2, col = new T.Color(d.c || '#b826f6');
      var mat = new T.MeshStandardMaterial({ color: col, metalness: 0.55, roughness: 0.22, emissive: col.clone().multiplyScalar(0.18) });
      var m = new T.Mesh(new T.BoxGeometry(1.5, 1, 1.5), mat);
      m.position.x = x0 + i * gap; m.scale.y = 0.001; m.userData = { h: h, i: i };
      var edge = new T.LineSegments(new T.EdgesGeometry(m.geometry), new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 }));
      m.add(edge); group.add(m);
      var lab = label(d.t, d.s); lab.position.set(m.position.x, 0, 1.5); lab.position.y = -0.7; lab.scale.set(2.6, 1.3, 1); group.add(lab);
      var top = label(d.l, ''); top.scale.set(2.6, 1.3, 1); top.userData.top = true; group.add(top);
      bars.push({ m: m, top: top });
    });
    var W = 1, H = 1;
    function resize() {
      var r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
      var d = Math.max(15, data.length * 3.4 / Math.min(1, camera.aspect * 0.8)); camera.position.set(0, 5.2, d); camera.lookAt(0, 2.5, 0);
    }
    new ResizeObserver(resize).observe(host); resize();
    var tx = 0, sx = 0, ty = 0, sy = 0, t0 = 0, started = false, running = false, drag = false, lastX = 0, rot = -0.35;
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5; });
    host.addEventListener('pointerdown', function (e) { drag = true; lastX = e.clientX; try { host.setPointerCapture(e.pointerId); } catch (x) {} });
    host.addEventListener('pointerup', function () { drag = false; });
    host.addEventListener('pointermove', function (e) { if (drag) { rot += (e.clientX - lastX) * 0.006; lastX = e.clientX; } });
    function draw(now) {
      var t = (now - t0) / 1000;
      sx = lerp(sx, tx, 0.06); sy = lerp(sy, ty, 0.06);
      group.rotation.y = rot + sx * 0.5 + (reduce ? 0 : Math.sin(t * 0.4) * 0.12);
      group.rotation.x = sy * 0.12;
      bars.forEach(function (b, i) {
        var k = clamp((t - 0.15 - i * 0.18) / 1.3, 0, 1), e = 1 - Math.pow(1 - k, 4), h = b.m.userData.h * (reduce ? 1 : e);
        if (reduce) h = b.m.userData.h;
        b.m.scale.y = Math.max(0.001, h); b.m.position.y = h / 2;
        b.top.position.set(b.m.position.x, h + 0.9, 0); b.top.material.opacity = reduce ? 1 : e;
      });
      renderer.render(scene, camera);
    }
    io([host], function (_, on) { running = on; if (on && !started) { started = true; t0 = performance.now(); } }, { threshold: 0.25 });
    (function loop(now) { if (running && !document.hidden) draw(now); requestAnimationFrame(loop); })(performance.now());
    if (reduce) { t0 = performance.now() - 5000; setTimeout(function () { draw(performance.now()); }, 600); }
  })();
})();
