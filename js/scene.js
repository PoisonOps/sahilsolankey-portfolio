/* scene.js — Ambient hero particle field (ONE WebGL context) */
'use strict';

(function () {

  const isMobile = window.matchMedia('(max-width: 1023px)').matches
                || window.matchMedia('(pointer: coarse)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.SceneState = { isMobile, prefersReduced, ready: false };

  /* Expose emitSparks as no-op if mobile */
  window.Scene = {
    emitSparks: function () {},
    camera: null,
  };

  if (isMobile) return;

  /* ── Renderer ───────────────────────────────────────────────── */
  const canvas = document.getElementById('webgl-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;
  renderer.setClearColor(0x000000, 0);

  /* ── Scene / Camera ─────────────────────────────────────────── */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.z = 30;

  window.Scene.camera = camera;

  /* ── Ambient particle field ──────────────────────────────────── */
  const PARTICLE_COUNT = 120;
  const particleGeo = new THREE.BufferGeometry();
  const positions    = new Float32Array(PARTICLE_COUNT * 3);
  const angles       = new Float32Array(PARTICLE_COUNT);
  const radii        = new Float32Array(PARTICLE_COUNT);
  const speeds       = new Float32Array(PARTICLE_COUNT);
  const yOffsets     = new Float32Array(PARTICLE_COUNT);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    angles[i]  = Math.random() * Math.PI * 2;
    radii[i]   = 4 + Math.random() * 14;
    speeds[i]  = 0.0008 + Math.random() * 0.002;
    yOffsets[i] = (Math.random() - 0.5) * 20;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: 0xe8820c,
    size: 0.12,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ── Spark trail particles (for timeline) ───────────────────── */
  const SPARK_COUNT = 16;
  const sparkGeo  = new THREE.BufferGeometry();
  const sparkPos  = new Float32Array(SPARK_COUNT * 3).fill(999);
  const sparkLife = new Float32Array(SPARK_COUNT);
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));

  const sparkMat = new THREE.PointsMaterial({
    color: 0xe8820c,
    size: 0.18,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
  });

  const sparks = new THREE.Points(sparkGeo, sparkMat);
  scene.add(sparks);

  /* Expose spark emitter */
  window.Scene.emitSparks = function (worldX, worldY) {
    for (let i = 0; i < SPARK_COUNT; i++) {
      if (sparkLife[i] <= 0) {
        sparkPos[i * 3]     = worldX + (Math.random() - 0.5) * 0.6;
        sparkPos[i * 3 + 1] = worldY + (Math.random() - 0.5) * 0.5;
        sparkPos[i * 3 + 2] = 0.5;
        sparkLife[i] = 0.4 + Math.random() * 0.3;
        break;
      }
    }
  };

  /* ── Mouse parallax ─────────────────────────────────────────── */
  let mouseX = 0, mouseY = 0;
  let camX = 0, camY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5);
    mouseY = -(e.clientY / window.innerHeight - 0.5);
  });

  /* ── Resize ─────────────────────────────────────────────────── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ── Visibility ─────────────────────────────────────────────── */
  let rafId = null;
  let isVisible = true;
  document.addEventListener('visibilitychange', () => {
    isVisible = !document.hidden;
    if (isVisible && !prefersReduced) startLoop();
  });

  /* ── Render loop ────────────────────────────────────────────── */
  let lastTime = 0;

  function tick(t) {
    if (!isVisible) { rafId = null; return; }
    const dt = Math.min((t - lastTime) / 1000, 0.05);
    lastTime = t;

    /* Animate particles */
    const pos = particleGeo.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      angles[i] += speeds[i];
      const a = angles[i];
      pos.setXYZ(
        i,
        Math.cos(a) * radii[i] + Math.sin(a * 0.4) * 2,
        yOffsets[i] + Math.sin(a * 0.7 + i) * 3,
        Math.sin(a) * radii[i] * 0.25
      );
    }
    pos.needsUpdate = true;

    /* Animate sparks */
    const sp = sparkGeo.attributes.position;
    for (let i = 0; i < SPARK_COUNT; i++) {
      if (sparkLife[i] > 0) {
        sparkLife[i] -= dt;
        sparkPos[i * 3]     += (Math.random() - 0.5) * 0.08;
        sparkPos[i * 3 + 1] += 0.04 + Math.random() * 0.04;
        sparkPos[i * 3 + 2] += (Math.random() - 0.5) * 0.04;
      } else {
        sparkPos[i * 3] = 999;
      }
    }
    sp.array.set(sparkPos);
    sp.needsUpdate = true;

    /* Camera parallax */
    camX += (mouseX * 6 - camX) * 0.06;
    camY += (mouseY * 4 - camY) * 0.06;
    camera.position.x = camX;
    camera.position.y = camY;
    camera.lookAt(0, 0, 0);

    /* Sound-reactive particle breathing */
    if (window.Sound && window.Sound.active) {
      const breathAmt = 0.5 + 0.5 * Math.sin(Date.now() * 0.000408); /* 0.065Hz — matches audio LFO */
      particleMat.size = 0.12 + breathAmt * 0.06;
      particleMat.opacity = 0.28 + breathAmt * 0.12;
    }

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (rafId) return;
    rafId = requestAnimationFrame(tick);
  }

  /* ── Init ───────────────────────────────────────────────────── */
  function init() {
    if (prefersReduced) {
      /* Single frame */
      renderer.render(scene, camera);
      return;
    }
    startLoop();
    window.SceneState.ready = true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
