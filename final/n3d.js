/* Nuance Media: the chrome N, rendered in real 3D with Three.js.
   Any element with [data-n3d="light"|"dark"] gets a canvas with a slowly turning N.
   Falls back to the flat logo image when WebGL or Three.js is unavailable. */
(function () {
  'use strict';
  var hosts = Array.prototype.slice.call(document.querySelectorAll('[data-n3d]'));
  if (!hosts.length || !window.THREE) return;
  var T = window.THREE;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LOGO = {"aspect": 1.148105625717566, "shapes": [{"outer": [[-0.174, 0.453], [-0.202, 0.453], [-0.274, 0.399], [-0.37, 0.319], [-0.476, 0.215], [-0.618, 0.049], [-0.728, -0.107], [-0.824, -0.277], [-0.876, -0.391], [-0.914, -0.489], [-0.952, -0.607], [-0.98, -0.721], [-0.998, -0.841], [-0.998, -0.859], [-0.99, -0.867], [-0.976, -0.867], [-0.824, -0.733], [-0.076, -0.035], [0.11, -0.241], [0.132, -0.245], [0.146, -0.235], [0.148, -0.217], [-0.056, 0.205], [-0.166, 0.445]], "holes": [[[-0.192, 0.401], [-0.1, 0.213], [-0.908, -0.731], [-0.936, -0.757], [-0.938, -0.749], [-0.906, -0.617], [-0.852, -0.457], [-0.812, -0.361], [-0.762, -0.259], [-0.688, -0.131], [-0.564, 0.043], [-0.454, 0.171], [-0.304, 0.317], [-0.2, 0.401]]]}, {"outer": [[0.992, 0.867], [0.978, 0.867], [0.734, 0.653], [0.178, 0.141], [0.006, 0.305], [-0.016, 0.307], [-0.03, 0.297], [-0.032, 0.281], [0.286, -0.375], [0.314, -0.375], [0.37, -0.335], [0.47, -0.249], [0.54, -0.179], [0.604, -0.107], [0.682, -0.007], [0.784, 0.153], [0.872, 0.335], [0.938, 0.523], [0.984, 0.729], [0.996, 0.823], [0.996, 0.863]], "holes": [[[0.938, 0.759], [0.938, 0.733], [0.914, 0.611], [0.866, 0.449], [0.804, 0.295], [0.74, 0.169], [0.652, 0.031], [0.548, -0.101], [0.432, -0.223], [0.36, -0.287], [0.306, -0.327], [0.184, -0.075], [0.722, 0.529], [0.896, 0.719]]]}]};

  function makeEnv(renderer, dark) {
    var c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    var g = c.getContext('2d');
    var bg = g.createLinearGradient(0, 0, 0, 512);
    if (dark) { bg.addColorStop(0, '#2a1650'); bg.addColorStop(0.5, '#0c0a11'); bg.addColorStop(1, '#1b0d33'); }
    else { bg.addColorStop(0, '#ffffff'); bg.addColorStop(0.45, '#efe6fb'); bg.addColorStop(1, '#c9b2e6'); }
    g.fillStyle = bg; g.fillRect(0, 0, 1024, 512);
    var boxes = dark
      ? [[40, 40, 380, 100, '#ffffff'], [470, 30, 320, 44, '#e2b8ff'], [820, 90, 190, 110, '#ffffff'], [0, 400, 1024, 18, '#b04cf0'], [110, 270, 90, 170, '#ffffff'], [880, 240, 80, 200, '#d05bff']]
      : [[40, 30, 400, 110, '#ffffff'], [500, 40, 300, 60, '#ffffff'], [820, 120, 180, 120, '#f7efff'], [0, 330, 1024, 40, '#9a1fe0'], [140, 250, 120, 150, '#6b1aa3'], [700, 260, 220, 60, '#b826f6'], [420, 430, 300, 30, '#3a1260']];
    boxes.forEach(function (b) { g.shadowColor = b[4]; g.shadowBlur = 40; g.fillStyle = b[4]; g.fillRect(b[0], b[1], b[2], b[3]); });
    var tex = new T.CanvasTexture(c);
    tex.mapping = T.EquirectangularReflectionMapping; tex.encoding = T.sRGBEncoding;
    var pm = new T.PMREMGenerator(renderer); pm.compileEquirectangularShader();
    var env = pm.fromEquirectangular(tex).texture; tex.dispose(); pm.dispose();
    return env;
  }

  function init(host) {
    var dark = host.getAttribute('data-n3d') === 'dark';
    var canvas = document.createElement('canvas');
    var renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); } catch (e) { return; }
    host.appendChild(canvas); host.classList.add('gl-on');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = dark ? 1.1 : 1.0;

    var scene = new T.Scene(), camera = new T.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0, 6.2);
    scene.environment = makeEnv(renderer, dark);

    var mat = new T.MeshStandardMaterial({
      color: dark ? 0xf1dfff : 0xb45cf0, metalness: 1, roughness: dark ? 0.12 : 0.16,
      envMapIntensity: dark ? 2.2 : 1.6, emissive: dark ? 0x1a0729 : 0x2a0640
    });
    var logo = new T.Group();
    LOGO.shapes.forEach(function (sh) {
      var shape = new T.Shape(sh.outer.map(function (p) { return new T.Vector2(p[0], p[1]); }));
      sh.holes.forEach(function (hh) { shape.holes.push(new T.Path(hh.map(function (p) { return new T.Vector2(p[0], p[1]); }))); });
      var geo = new T.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.012, bevelSegments: 6, curveSegments: 2 });
      logo.add(new T.Mesh(geo, mat));
    });
    logo.position.z = -0.1;
    var pivot = new T.Group(); pivot.add(logo); scene.add(pivot);
    var key = new T.PointLight(0xb826f6, dark ? 2 : 1.4, 20); key.position.set(-3, 2.5, 4); scene.add(key);
    var rim = new T.PointLight(0xffffff, dark ? 1.2 : 1.6, 20); rim.position.set(3, -2, 4); scene.add(rim);
    scene.add(new T.AmbientLight(0xffffff, dark ? 0.15 : 0.35));

    var scale = parseFloat(host.getAttribute('data-n3d-scale') || '1');
    function resize() {
      var r = host.getBoundingClientRect(), W = Math.max(1, r.width), H = Math.max(1, r.height);
      renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
      var visH = 2 * Math.tan(T.MathUtils.degToRad(camera.fov / 2)) * camera.position.z, visW = visH * camera.aspect;
      pivot.scale.setScalar(Math.min(visW / 2.3, visH / 2.0) * scale);
      draw(performance.now());
    }

    var tx = 0, ty = 0, sx = 0, sy = 0, t0 = performance.now(), running = false;
    window.addEventListener('pointermove', function (e) {
      tx = (e.clientX / window.innerWidth) * 2 - 1; ty = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    function draw(now) {
      var t = (now - t0) / 1000;
      sx += (tx - sx) * 0.05; sy += (ty - sy) * 0.05;
      logo.rotation.y = (reduce ? -0.35 : Math.sin(t * 0.35) * 0.5) + sx * 0.25;
      logo.rotation.x = (reduce ? 0.08 : Math.sin(t * 0.27) * 0.08) - sy * 0.12;
      pivot.position.y = reduce ? 0 : Math.sin(t * 0.6) * 0.05;
      renderer.render(scene, camera);
    }
    new ResizeObserver(resize).observe(host); resize();
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { running = es[0].isIntersecting; }).observe(host);
    else running = true;
    (function loop(now) { if (running && !document.hidden && !reduce) draw(now); requestAnimationFrame(loop); })(performance.now());
  }

  hosts.forEach(init);
})();
