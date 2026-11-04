/* Nuance Media: reusable 3D stage (chrome N + floating art). */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var LOGO = {"aspect": 1.148105625717566, "shapes": [{"outer": [[-0.174, 0.453], [-0.202, 0.453], [-0.274, 0.399], [-0.37, 0.319], [-0.476, 0.215], [-0.618, 0.049], [-0.728, -0.107], [-0.824, -0.277], [-0.876, -0.391], [-0.914, -0.489], [-0.952, -0.607], [-0.98, -0.721], [-0.998, -0.841], [-0.998, -0.859], [-0.99, -0.867], [-0.976, -0.867], [-0.824, -0.733], [-0.076, -0.035], [0.11, -0.241], [0.132, -0.245], [0.146, -0.235], [0.148, -0.217], [-0.056, 0.205], [-0.166, 0.445]], "holes": [[[-0.192, 0.401], [-0.1, 0.213], [-0.908, -0.731], [-0.936, -0.757], [-0.938, -0.749], [-0.906, -0.617], [-0.852, -0.457], [-0.812, -0.361], [-0.762, -0.259], [-0.688, -0.131], [-0.564, 0.043], [-0.454, 0.171], [-0.304, 0.317], [-0.2, 0.401]]]}, {"outer": [[0.992, 0.867], [0.978, 0.867], [0.734, 0.653], [0.178, 0.141], [0.006, 0.305], [-0.016, 0.307], [-0.03, 0.297], [-0.032, 0.281], [0.286, -0.375], [0.314, -0.375], [0.37, -0.335], [0.47, -0.249], [0.54, -0.179], [0.604, -0.107], [0.682, -0.007], [0.784, 0.153], [0.872, 0.335], [0.938, 0.523], [0.984, 0.729], [0.996, 0.823], [0.996, 0.863]], "holes": [[[0.938, 0.759], [0.938, 0.733], [0.914, 0.611], [0.866, 0.449], [0.804, 0.295], [0.74, 0.169], [0.652, 0.031], [0.548, -0.101], [0.432, -0.223], [0.36, -0.287], [0.306, -0.327], [0.184, -0.075], [0.722, 0.529], [0.896, 0.719]]]}]};
  var S = {
    home: { art: [
      { src: 'assets/chrome-hand.png', h: 1.35, w: [-0.85, 1.9, 0.8], n: null, rot: -0.18, sp: 0.8, ph: 0.2 },
      { src: 'assets/dice.png', h: 1.3, w: [3.75, -1.6, 1.2], n: [0.95, 0.35, 1.1], rot: 0.22, sp: 1.0, ph: 1.7 },
      { src: 'assets/bee.png', h: 1.0, w: [-2.55, 1.5, 1.4], n: [-0.95, 0.75, 1.3], rot: -0.3, sp: 1.3, ph: 3.1 },
      { src: 'assets/can-paint.png', h: 1.5, w: [4.5, 0.55, -0.5], n: null, rot: 0.35, sp: 0.7, ph: 4.4 },
      { src: 'assets/can-pencil.png', h: 1.15, w: [-4.1, 1.7, 0.2], n: null, rot: -0.4, sp: 0.9, ph: 5.2 }] },
    services: { nx: 0.27, ny: 0.0, ns: 2.3, art: [
      { src: 'assets/dice.png', h: 1.2, w: [-1.1, 1.45, 0.6], n: [0.95, 0.35, 1.1], rot: 0.22, sp: 1.0, ph: 1.7 },
      { src: 'assets/bee.png', h: 0.95, w: [-2.8, 1.45, 1.2], n: [-0.95, 0.75, 1.3], rot: -0.3, sp: 1.3, ph: 3.1 },
      { src: 'assets/can-paint.png', h: 1.3, w: [4.9, -1.4, 0.0], n: null, rot: 0.35, sp: 0.7, ph: 4.4 }] },
    work: { nx: 0.28, ny: 0.0, ns: 2.3, art: [
      { src: 'assets/chrome-hand.png', h: 1.3, w: [-1.3, 1.45, 0.8], n: null, rot: -0.18, sp: 0.8, ph: 0.2 },
      { src: 'assets/bee.png', h: 0.95, w: [4.8, 1.45, 0.9], n: [-0.95, 0.75, 1.3], rot: 0.3, sp: 1.3, ph: 3.1 },
      { src: 'assets/dice.png', h: 1.1, w: [4.9, -1.9, 0.3], n: [0.95, 0.35, 1.1], rot: 0.22, sp: 1.0, ph: 1.7 }] },
    ugc: { nx: 0.27, ny: 0.0, ns: 2.3, art: [
      { src: 'assets/chrome-hand.png', h: 1.6, w: [-1.3, 1.45, 0.8], n: null, rot: -0.2, sp: 0.8, ph: 0.2 },
      { src: 'assets/can-pencil.png', h: 1.2, w: [4.9, 1.45, 0.2], n: null, rot: -0.4, sp: 0.9, ph: 5.2 },
      { src: 'assets/bee.png', h: 0.95, w: [4.9, -1.8, 1.2], n: [-0.95, 0.75, 1.3], rot: -0.3, sp: 1.3, ph: 3.1 }] },
    creatives: { nx: 0.27, ny: 0.0, ns: 2.3, art: [
      { src: 'assets/can-paint.png', h: 1.5, w: [-1.0, 1.45, 0.2], n: null, rot: 0.35, sp: 0.7, ph: 4.4 },
      { src: 'assets/can-pencil.png', h: 1.2, w: [4.9, -1.7, 0.5], n: [0.95, 0.35, 1.1], rot: -0.4, sp: 0.9, ph: 5.2 },
      { src: 'assets/dice.png', h: 1.1, w: [-3.2, 1.45, 1.1], n: null, rot: 0.22, sp: 1.0, ph: 1.7 }] },
    contact: { nx: 0.27, ny: 0.0, ns: 2.2, art: [
      { src: 'assets/chrome-hand.png', h: 1.5, w: [-1.2, 1.45, 0.8], n: null, rot: -0.18, sp: 0.8, ph: 0.2 },
      { src: 'assets/bee.png', h: 0.95, w: [-3.2, 1.45, 1.4], n: [-0.95, 0.75, 1.3], rot: -0.3, sp: 1.3, ph: 3.1 }] }
  };
  /* ---------- hero 3D stage ---------- */
  function initStage(host, canvas, hero, cfg) {
    if (!window.THREE || !LOGO || !host) return;
    var T = window.THREE, renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch (err) { return; }
    host.classList.add('gl-on');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;

    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(32, 1, 0.1, 60);
    camera.position.set(0, 0, 10);

    /* environment: a studio of coloured softboxes, so chrome has something to reflect */
    function makeEnv() {
      var c = document.createElement('canvas'); c.width = 1024; c.height = 512;
      var g = c.getContext('2d');
      var bg = g.createLinearGradient(0, 0, 0, 512);
      bg.addColorStop(0, '#2a1650'); bg.addColorStop(0.5, '#0a0812'); bg.addColorStop(1, '#1b0d33');
      g.fillStyle = bg; g.fillRect(0, 0, 1024, 512);
      var boxes = [
        [40, 40, 380, 100, '#ffffff'], [470, 30, 320, 44, '#e2b8ff', ], [820, 90, 190, 110, '#7fe8ff'], [280, 190, 190, 34, '#ffffff'],
        [610, 300, 300, 40, '#ffe2a0'], [0, 400, 1024, 18, '#b04cf0'], [110, 270, 90, 170, '#ffffff'], [880, 240, 80, 200, '#d05bff'], [680, 140, 130, 44, '#ffffff']
      ];
      boxes.forEach(function (b) {
        g.shadowColor = b[4]; g.shadowBlur = 46; g.fillStyle = b[4]; g.fillRect(b[0], b[1], b[2], b[3]);
      });
      var tex = new T.CanvasTexture(c);
      tex.mapping = T.EquirectangularReflectionMapping; tex.encoding = T.sRGBEncoding;
      var pm = new T.PMREMGenerator(renderer); pm.compileEquirectangularShader();
      var env = pm.fromEquirectangular(tex).texture; tex.dispose(); pm.dispose();
      return env;
    }
    scene.environment = makeEnv();

    /* liquid ripple normal map for the chrome */
    function makeNormal() {
      var S = 256, c = document.createElement('canvas'); c.width = c.height = S;
      var g = c.getContext('2d'), img = g.createImageData(S, S), h = new Float32Array(S * S), i, x, y;
      for (y = 0; y < S; y++) for (x = 0; x < S; x++) {
        var u = x / S * Math.PI * 2, v = y / S * Math.PI * 2;
        h[y * S + x] = Math.sin(u * 2 + Math.sin(v * 3) * 1.4) * 0.5 + Math.sin(v * 2 + Math.cos(u * 2) * 1.2) * 0.5 + Math.sin((u + v) * 3) * 0.25;
      }
      for (y = 0; y < S; y++) for (x = 0; x < S; x++) {
        var l = h[y * S + (x + S - 1) % S], r = h[y * S + (x + 1) % S], u2 = h[((y + S - 1) % S) * S + x], d = h[((y + 1) % S) * S + x];
        var nx = (l - r) * 1.2, ny = (u2 - d) * 1.2, nz = 1, len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        i = (y * S + x) * 4;
        img.data[i] = (nx / len * 0.5 + 0.5) * 255; img.data[i + 1] = (ny / len * 0.5 + 0.5) * 255; img.data[i + 2] = (nz / len * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      var t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(0.8, 0.8);
      return t;
    }

    /* the N, extruded from the traced logo */
    var logo = new T.Group();
    var chrome = new T.MeshStandardMaterial({ color: 0xf1dfff, metalness: 1, roughness: 0.1, envMapIntensity: 2.8, emissive: 0x240a3a, normalMap: makeNormal(), normalScale: new T.Vector2(0.9, 0.9) });
    LOGO.shapes.forEach(function (sh) {
      var shape = new T.Shape(sh.outer.map(function (p) { return new T.Vector2(p[0], p[1]); }));
      sh.holes.forEach(function (hh) { shape.holes.push(new T.Path(hh.map(function (p) { return new T.Vector2(p[0], p[1]); }))); });
      var geo = new T.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.008, bevelSegments: 6, curveSegments: 1 });
      logo.add(new T.Mesh(geo, chrome));
    });
    var logoPivot = new T.Group(); logoPivot.add(logo); scene.add(logoPivot);
    logo.position.z = -0.09;
    var key = new T.PointLight(0xb826f6, 3.2, 30); key.position.set(-4, 3, 5); scene.add(key);
    var rim = new T.PointLight(0x6fe3ff, 2.4, 30); rim.position.set(5, -2, 4); scene.add(rim);
    scene.add(new T.AmbientLight(0xffffff, 0.15));

    /* floating art */
    var loader = new T.TextureLoader();
    var art = cfg.art;
    var items = [];
    art.forEach(function (a) {
      loader.load(a.src, function (tex) {
        tex.encoding = T.sRGBEncoding; tex.anisotropy = 4;
        var aspect = tex.image.width / tex.image.height;
        var mat = new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, side: T.DoubleSide });
        var mesh = new T.Mesh(new T.PlaneGeometry(a.h * aspect, a.h), mat);
        scene.add(mesh); items.push({ mesh: mesh, a: a, born: performance.now() });
        if (reduce) draw();
      });
    });

    /* dust */
    var N = 260, pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 18; pos[i * 3 + 1] = (Math.random() - 0.5) * 9; pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1; }
    var pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3));
    var dust = new T.Points(pg, new T.PointsMaterial({ color: 0xdc94ff, size: 0.035, transparent: true, opacity: 0.65, depthWrite: false, blending: T.AdditiveBlending }));
    scene.add(dust);

    /* layout + sizing */
    var W = 1, H = 1, wide = true, nScale = 2.2, nPos = [2.3, 0.55];
    function resize() {
      var r = host.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
      wide = camera.aspect > 1.1;
      var visH = 2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * camera.position.z, visW = visH * camera.aspect;
      if (wide) { nScale = Math.min(cfg.ns || 2.7, visW * (cfg.nk || 0.24)); nPos = [visW * (cfg.nx == null ? 0.235 : cfg.nx), visH * (cfg.ny == null ? 0.07 : cfg.ny)]; }
      else { nScale = Math.min(1.35, visW * 0.45); nPos = [0, visH * (cfg.nyn == null ? 0.2 : cfg.nyn)]; }
      logoPivot.scale.setScalar(nScale);
      logoPivot.userData.base = nPos;
      draw();
    }
    new ResizeObserver(resize).observe(host);

    var tx = 0, ty = 0, sx = 0, sy = 0;
    window.addEventListener('pointermove', function (e) { tx = (e.clientX / window.innerWidth) * 2 - 1; ty = (e.clientY / window.innerHeight) * 2 - 1; }, { passive: true });

    var running = true, t0 = performance.now();
    function draw() {
      var t = (performance.now() - t0) / 1000, sc = Math.min(window.scrollY, 1400);
      sx = lerp(sx, tx, 0.06); sy = lerp(sy, ty, 0.06);
      var b = logoPivot.userData.base || nPos;
      logoPivot.position.set(b[0] + sx * 0.25, b[1] - sy * 0.12 + sc * 0.0016, 0);
      logo.rotation.y = Math.sin(t * 0.5) * 0.55 + sx * 0.5;
      logo.rotation.x = -sy * 0.28 + Math.sin(t * 0.37) * 0.06;
      logo.rotation.z = Math.sin(t * 0.3) * 0.04;
      key.position.x = -4 + sx * 3; rim.position.y = -2 - sy * 3;
      items.forEach(function (it) {
        var a = it.a, p = wide ? a.w : a.n;
        it.mesh.visible = !!p; if (!p) return;
        var k = clamp((performance.now() - it.born) / 900, 0, 1), e = 1 - Math.pow(1 - k, 3);
        var depth = 1 + p[2] * 0.35;
        it.mesh.position.set(
          p[0] + sx * 0.55 * depth + (wide ? 0 : 0),
          p[1] + Math.sin(t * a.sp + a.ph) * 0.14 - sy * 0.3 * depth + sc * 0.0012 * depth,
          p[2]);
        it.mesh.rotation.z = a.rot + Math.sin(t * a.sp * 0.8 + a.ph) * 0.07;
        it.mesh.rotation.y = Math.sin(t * 0.45 + a.ph) * 0.35 + sx * 0.3;
        it.mesh.scale.setScalar((wide ? 1 : 0.7) * (0.6 + 0.4 * e));
        it.mesh.material.opacity = e;
      });
      dust.rotation.y = t * 0.02 + sx * 0.05; dust.position.y = sc * 0.0008;
      renderer.render(scene, camera);
    }

    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { running = es[0].isIntersecting; }).observe(hero);
    function loop() { if (running && !document.hidden && !reduce) draw(); requestAnimationFrame(loop); }
    resize();
    if (reduce) { window.addEventListener('scroll', draw, { passive: true }); setTimeout(draw, 400); setTimeout(draw, 1200); }
    else requestAnimationFrame(loop);
  }

  window.NM = window.NM || {};
  var host = document.getElementById('stage');
  if (host) {
    var key = host.getAttribute('data-scene') || 'home';
    initStage(host, document.getElementById('gl'), document.getElementById('hero'), S[key] || S.home);
  }
})();
