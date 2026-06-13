/* scene.js — ONE WebGL context, ONE scene, ALL Three.js visuals */
'use strict';

(function () {

  /* ── Mobile detection ───────────────────────────────────────── */
  const isMobile = window.matchMedia('(max-width: 1023px)').matches
                || window.matchMedia('(pointer: coarse)').matches;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Expose state so other modules can read it */
  window.SceneState = { isMobile, prefersReduced, ready: false };

  if (isMobile) return; /* Hard stop — no WebGL on mobile */

  /* ── Canvas & renderer ──────────────────────────────────────── */
  const canvas = document.getElementById('webgl-canvas');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;
  renderer.setClearColor(0x000000, 0);

  /* ── Scene & camera ─────────────────────────────────────────── */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 30);

  /* ── Groups (all hidden by default) ────────────────────────── */
  const groups = {
    heroTerrain:  new THREE.Group(),
    heroParticles: new THREE.Group(),
    constellation: new THREE.Group(),
    serviceMinis:  new THREE.Group(),
    techGraph:     new THREE.Group(),
    sparkTrail:    new THREE.Group(),
  };

  Object.values(groups).forEach(g => {
    g.visible = false;
    scene.add(g);
  });

  /* ── Lights ─────────────────────────────────────────────────── */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambientLight);

  const heroLight = new THREE.PointLight(0xe8820c, 0.35, 80);
  heroLight.position.set(0, -10, 5);
  scene.add(heroLight);

  const fillLight = new THREE.PointLight(0x2e5bff, 0.1, 60);
  fillLight.position.set(-20, 10, 10);
  scene.add(fillLight);

  /* ═══════════════════════════════════════════════════════════════
     HERO TERRAIN
     ═══════════════════════════════════════════════════════════════ */
  function buildHeroTerrain() {
    const geo = new THREE.PlaneGeometry(80, 40, 120, 60);
    const positions = geo.attributes.position;

    /* Vertex noise displacement */
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = Math.sin(x * 0.15) * Math.cos(y * 0.2) * 1.8
              + Math.sin(x * 0.08 + y * 0.12) * 2.4
              + Math.cos(x * 0.22) * Math.sin(y * 0.18) * 1.2;
      /* Only displace in the bottom third roughly */
      const fade = Math.max(0, (y + 20) / 40);
      positions.setZ(i, z * fade * 0.6);
    }

    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: 0x0a0e1a,
      flatShading: true,
      roughness: 0.9,
      metalness: 0.1,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = -Math.PI / 2.2;
    mesh.position.y = -14;
    mesh.position.z = -5;
    groups.heroTerrain.add(mesh);
  }

  /* ═══════════════════════════════════════════════════════════════
     HERO PARTICLES  (~60 amber orbit points)
     ═══════════════════════════════════════════════════════════════ */
  const PARTICLE_COUNT = 60;
  let particlePositions, particleAngles, particleRadii, particleSpeeds, particleHeights;
  let particleMesh;

  function buildHeroParticles() {
    const geo = new THREE.BufferGeometry();
    particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    particleAngles  = new Float32Array(PARTICLE_COUNT);
    particleRadii   = new Float32Array(PARTICLE_COUNT);
    particleSpeeds  = new Float32Array(PARTICLE_COUNT);
    particleHeights = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particleAngles[i]  = Math.random() * Math.PI * 2;
      particleRadii[i]   = 3 + Math.random() * 7;
      particleSpeeds[i]  = 0.002 + Math.random() * 0.006;
      particleHeights[i] = (Math.random() - 0.5) * 8;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xe8820c,
      size: 0.15,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });

    particleMesh = new THREE.Points(geo, mat);
    groups.heroParticles.add(particleMesh);
  }

  /* Center the particle orbit around the device DOM element */
  let particleCenter = { x: 0, y: 0, z: 0 };

  function updateParticleCenter() {
    const devicesEl = document.getElementById('hero-devices');
    if (!devicesEl) return;

    const rect = devicesEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;

    /* Unproject screen coords to world */
    const ndcX = (cx / window.innerWidth)  * 2 - 1;
    const ndcY = -(cy / window.innerHeight) * 2 + 1;

    const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
    vec.unproject(camera);
    vec.sub(camera.position).normalize();
    const dist = -camera.position.z / vec.z;
    const worldPos = camera.position.clone().addScaledVector(vec, dist);

    particleCenter.x = worldPos.x;
    particleCenter.y = worldPos.y;
    particleCenter.z = 0;
  }

  function animateParticles(t) {
    if (!particleMesh) return;
    const pos = particleMesh.geometry.attributes.position;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particleAngles[i] += particleSpeeds[i];
      const a = particleAngles[i];
      pos.setXYZ(
        i,
        particleCenter.x + Math.cos(a) * particleRadii[i],
        particleCenter.y + particleHeights[i] + Math.sin(a * 0.7) * 1.5,
        particleCenter.z + Math.sin(a) * particleRadii[i] * 0.3
      );
    }
    pos.needsUpdate = true;
  }

  /* ═══════════════════════════════════════════════════════════════
     DEVICE CONSTELLATION
     ═══════════════════════════════════════════════════════════════ */

  /* Shared canvas texture for all device screens */
  let sharedTexture, sharedCtx, sharedCanvas;
  let dashPhase = 0;

  function buildSharedScreenTexture() {
    sharedCanvas = document.createElement('canvas');
    sharedCanvas.width  = 256;
    sharedCanvas.height = 160;
    sharedCtx = sharedCanvas.getContext('2d');
    sharedTexture = new THREE.CanvasTexture(sharedCanvas);
    return sharedTexture;
  }

  function updateSharedTexture(t) {
    const ctx = sharedCtx;
    const W = sharedCanvas.width;
    const H = sharedCanvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0d101c';
    ctx.fillRect(0, 0, W, H);

    /* Dashboard header */
    ctx.fillStyle = '#1a1e2a';
    ctx.fillRect(0, 0, W, 28);
    ctx.fillStyle = '#8a8fa3';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillText('Dashboard', 10, 18);

    /* Sidebar */
    ctx.fillStyle = '#0c0f18';
    ctx.fillRect(0, 28, 56, H - 28);
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i === 0 ? '#e8820c' : '#1a1e2a';
      ctx.fillRect(8, 40 + i * 22, 40, 12);
    }

    /* Bar chart */
    dashPhase = (t * 0.0004) % 1;
    const bars = [0.55, 0.8, 0.45, 0.7, 0.6];
    bars.forEach((h, i) => {
      const barH = (H - 48) * h * (0.7 + 0.3 * Math.sin(t * 0.001 + i));
      ctx.fillStyle = `rgba(232,130,12,${0.5 + 0.3 * Math.sin(t * 0.0012 + i)})`;
      ctx.fillRect(64 + i * 36, H - 20 - barH, 24, barH);
    });

    /* Notification dot */
    const notifOpacity = 0.5 + 0.5 * Math.sin(t * 0.003);
    ctx.beginPath();
    ctx.arc(W - 12, 14, 5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(74,222,128,${notifOpacity})`;
    ctx.fill();

    sharedTexture.needsUpdate = true;
  }

  function buildConstellation() {
    const tex = buildSharedScreenTexture();

    /* Device blueprints: [name, w, h, d, screenW, screenH, opacity, position] */
    const devices = [
      { name: 'macbook',  w: 5,   h: 0.2, d: 3,   sw: 4.6, sh: 2.9, posX: -5,  posY: 0.5,  posZ: -1, op: 1,    lidAngle: -1.2 },
      { name: 'iphone',   w: 1.2, h: 2.4, d: 0.1, sw: 0.9, sh: 1.8, posX:  4,  posY: -0.5, posZ:  1, op: 1,    lidAngle: null },
      { name: 'android',  w: 1.3, h: 2.6, d: 0.1, sw: 1.0, sh: 2.0, posX: -3,  posY: -1.5, posZ:  0.5, op: 0.9, lidAngle: null },
      { name: 'ipad',     w: 3,   h: 2.2, d: 0.1, sw: 2.6, sh: 1.8, posX:  3.5,posY: 1.5,  posZ: -1, op: 0.55, lidAngle: null },
      { name: 'winlap',   w: 4.5, h: 0.2, d: 2.8, sw: 4.2, sh: 2.6, posX: -0.5,posY: -1,   posZ: -2, op: 0.55, lidAngle: -1.2 },
    ];

    devices.forEach(dev => {
      const group = new THREE.Group();

      /* Body */
      const bodyGeo = new THREE.BoxGeometry(dev.w, dev.h, dev.d);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x1a1d2e,
        roughness: 0.6,
        metalness: 0.4,
        transparent: true,
        opacity: dev.op,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      /* Screen plane */
      const screenGeo = new THREE.PlaneGeometry(dev.sw, dev.sh);
      const screenMat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        opacity: dev.op,
      });
      const screen = new THREE.Mesh(screenGeo, screenMat);

      if (dev.lidAngle !== null) {
        /* Laptop — screen is a lid */
        const lid = new THREE.Group();
        const lidPanel = new THREE.Mesh(
          new THREE.BoxGeometry(dev.w, 0.1, dev.d),
          bodyMat.clone()
        );
        screen.position.z = dev.d / 2 + 0.05;
        screen.position.y = dev.sh / 2 - 0.05;
        lid.add(lidPanel);
        lid.add(screen);
        lid.rotation.x = dev.lidAngle;
        lid.position.y = dev.h / 2;
        group.add(lid);
      } else {
        /* Phone / tablet — screen is front face */
        screen.position.z = dev.d / 2 + 0.01;
        group.add(screen);
      }

      group.position.set(dev.posX, dev.posY, dev.posZ);
      group.userData.orbitSpeed = 0.0017 + Math.random() * 0.0008;
      group.userData.orbitPhase = Math.random() * Math.PI * 2;
      groups.constellation.add(group);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     SERVICE TILE MINI-OBJECTS  (scissor-rendered)
     ═══════════════════════════════════════════════════════════════ */
  const tileObjects = [];

  function buildServiceMinis() {
    const mats = {
      wire: new THREE.MeshBasicMaterial({ color: 0xe8820c, wireframe: true }),
      emissive: new THREE.MeshStandardMaterial({ color: 0x1a1e2a, emissive: 0xe8820c, emissiveIntensity: 0.3 }),
      dim: new THREE.MeshStandardMaterial({ color: 0x1a1e2a, emissive: 0x2e5bff, emissiveIntensity: 0.2 }),
    };

    /* 0 — Wireframe browser window */
    const browser = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2, 1.4, 0.05), mats.wire);
    const bar   = new THREE.Mesh(new THREE.BoxGeometry(2, 0.22, 0.06), mats.emissive);
    bar.position.y = 0.59;
    browser.add(frame);
    browser.add(bar);
    tileObjects.push(browser);

    /* 1 — Extruded phone */
    const phone = new THREE.Group();
    const phoneBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.6, 0.1), mats.emissive);
    const phoneScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.2), mats.dim);
    phoneScreen.position.z = 0.06;
    phone.add(phoneBody);
    phone.add(phoneScreen);
    tileObjects.push(phone);

    /* 2 — Laptop lid at 110° */
    const laptop = new THREE.Group();
    const lbase = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 1.3), mats.emissive);
    const llid  = new THREE.Group();
    const lpanel = new THREE.Mesh(new THREE.BoxGeometry(2, 0.08, 1.3), mats.emissive);
    const lscreen = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), mats.dim);
    lscreen.position.z = -0.65;
    lscreen.rotation.x = Math.PI;
    llid.add(lpanel);
    llid.add(lscreen);
    llid.rotation.x = -1.9;
    llid.position.y = 0.09;
    laptop.add(lbase);
    laptop.add(llid);
    tileObjects.push(laptop);

    /* 3 — 7-node network */
    const network = new THREE.Group();
    const nodePos = [
      [0,0,0],[1.2,0.8,0],[-1.2,0.8,0],[0,1.6,0],[1.5,-0.8,0],[-1.5,-0.8,0],[0,-1.6,0]
    ];
    const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,3],[2,3]];
    const sphereGeo = new THREE.SphereGeometry(0.12, 6, 6);
    nodePos.forEach(([x,y,z]) => {
      const node = new THREE.Mesh(sphereGeo, new THREE.MeshStandardMaterial({
        emissive: 0xe8820c, emissiveIntensity: 0.6, color: 0x111
      }));
      node.position.set(x * 0.6, y * 0.6, z);
      network.add(node);
    });
    edges.forEach(([a, b]) => {
      const p1 = new THREE.Vector3(...nodePos[a].map((v,i) => i < 2 ? v * 0.6 : v));
      const p2 = new THREE.Vector3(...nodePos[b].map((v,i) => i < 2 ? v * 0.6 : v));
      const points = [p1, p2];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color: 0xe8820c, opacity: 0.4, transparent: true }));
      network.add(line);
    });
    tileObjects.push(network);

    /* 4 — Three stacked planes */
    const stack = new THREE.Group();
    [-0.55, 0, 0.55].forEach((y, i) => {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(1.8, 0.5),
        new THREE.MeshStandardMaterial({
          color: 0x0c0f18,
          emissive: 0xe8820c,
          emissiveIntensity: 0.15 + i * 0.1,
          side: THREE.DoubleSide,
        })
      );
      plane.position.y = y;
      plane.userData.baseY = y;
      stack.add(plane);
    });
    tileObjects.push(stack);

    /* 5 — Page-curl plane */
    const page = new THREE.Group();
    const pageBody = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 2, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x1a1e2a, emissive: 0x2e5bff, emissiveIntensity: 0.15, side: THREE.DoubleSide })
    );
    page.add(pageBody);
    tileObjects.push(page);

    tileObjects.forEach(obj => {
      obj.visible = false;
      groups.serviceMinis.add(obj);
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     TECH GRAPH  (force-directed)
     ═══════════════════════════════════════════════════════════════ */
  const techNodes = [
    { id: 0,  label: 'Supabase',        size: 0.7,  projects: ['CATalyst','GharKhata','PitchReady'] },
    { id: 1,  label: 'React',           size: 0.55, projects: ['GharKhata','PitchReady'] },
    { id: 2,  label: 'TypeScript',      size: 0.45, projects: ['GharKhata','PitchReady'] },
    { id: 3,  label: 'Next.js',         size: 0.5,  projects: ['PitchReady'] },
    { id: 4,  label: 'Vite',            size: 0.35, projects: ['GharKhata'] },
    { id: 5,  label: 'Tailwind',        size: 0.4,  projects: ['PitchReady'] },
    { id: 6,  label: 'Vanilla JS',      size: 0.55, projects: ['CATalyst','Postroom'] },
    { id: 7,  label: 'Serverless',      size: 0.45, projects: ['CATalyst'] },
    { id: 8,  label: 'PWA',             size: 0.4,  projects: ['CATalyst','GharKhata','PitchReady'] },
    { id: 9,  label: 'Web Push',        size: 0.35, projects: ['CATalyst'] },
    { id: 10, label: 'IndexedDB',       size: 0.35, projects: ['GharKhata'] },
    { id: 11, label: 'GSAP',            size: 0.45, projects: ['CATalyst','Postroom'] },
    { id: 12, label: 'Three.js',        size: 0.5,  projects: ['Portfolio'] },
    { id: 13, label: 'Vercel',          size: 0.6,  projects: ['CATalyst','GharKhata','PitchReady','Postroom'] },
    { id: 14, label: 'Recharts',        size: 0.3,  projects: ['GharKhata'] },
    { id: 15, label: 'KaTeX',           size: 0.3,  projects: ['CATalyst'] },
    { id: 16, label: 'Playwright',      size: 0.3,  projects: ['GharKhata'] },
    { id: 17, label: 'Expo',            size: 0.35, projects: [] },
  ];

  const techEdges = [
    [0,1],[0,2],[0,3],[0,6],[0,7],[0,13],
    [1,2],[1,3],[1,4],[1,5],[1,14],[1,16],
    [3,5],[3,2],[6,11],[6,7],[7,13],[8,0],
    [8,1],[8,3],[9,7],[10,4],[11,12],[12,3],[13,12],
  ];

  const nodeData   = techNodes.map(() => ({ vx: 0, vy: 0, x: 0, y: 0 }));
  let techMeshes   = [];
  let techLineMeshes = [];
  let graphRotation = 0;
  let hoveredNode   = null;
  const tooltip     = document.getElementById('tech-tooltip');
  let graphArea;

  function buildTechGraph() {
    graphArea = document.getElementById('tech-graph-area');
    if (!graphArea) return;

    /* Random initial positions */
    techNodes.forEach((node, i) => {
      nodeData[i].x = (Math.random() - 0.5) * 14;
      nodeData[i].y = (Math.random() - 0.5) * 8;
    });

    /* Sphere meshes */
    techNodes.forEach((node, i) => {
      const geo = new THREE.SphereGeometry(node.size * 0.4, 10, 10);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x1a1e2a,
        emissive: 0xe8820c,
        emissiveIntensity: 0.4,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData = { nodeIndex: i, baseEmissive: 0.4 };
      groups.techGraph.add(mesh);
      techMeshes.push(mesh);
    });

    /* Line meshes */
    techEdges.forEach(([a, b]) => {
      const points = [new THREE.Vector3(), new THREE.Vector3()];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({ color: 0x1a1e2a, opacity: 0.4, transparent: true });
      const line = new THREE.Line(geo, mat);
      line.userData = { a, b };
      groups.techGraph.add(line);
      techLineMeshes.push(line);
    });
  }

  function stepPhysics() {
    const SPRING = 0.02, REPULSE = 12, DAMP = 0.88, CENTER = 0.005;

    techEdges.forEach(([a, b]) => {
      const dx = nodeData[b].x - nodeData[a].x;
      const dy = nodeData[b].y - nodeData[a].y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 0.001;
      const ideal = 3.5;
      const force = (dist - ideal) * SPRING;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      nodeData[a].vx += fx; nodeData[a].vy += fy;
      nodeData[b].vx -= fx; nodeData[b].vy -= fy;
    });

    for (let i = 0; i < techNodes.length; i++) {
      for (let j = i + 1; j < techNodes.length; j++) {
        const dx = nodeData[j].x - nodeData[i].x;
        const dy = nodeData[j].y - nodeData[i].y;
        const dist2 = dx*dx + dy*dy || 0.001;
        const force = REPULSE / dist2;
        const dist = Math.sqrt(dist2);
        nodeData[i].vx -= (dx/dist) * force;
        nodeData[i].vy -= (dy/dist) * force;
        nodeData[j].vx += (dx/dist) * force;
        nodeData[j].vy += (dy/dist) * force;
      }
    }

    techNodes.forEach((_, i) => {
      nodeData[i].vx += -nodeData[i].x * CENTER;
      nodeData[i].vy += -nodeData[i].y * CENTER;
      nodeData[i].vx *= DAMP;
      nodeData[i].vy *= DAMP;
      nodeData[i].x  += nodeData[i].vx;
      nodeData[i].y  += nodeData[i].vy;
    });
  }

  function updateTechGraph(t) {
    if (!techMeshes.length) return;
    stepPhysics();
    graphRotation += 0.0002;

    techMeshes.forEach((mesh, i) => {
      const cos = Math.cos(graphRotation);
      const sin = Math.sin(graphRotation);
      const rx = nodeData[i].x * cos - nodeData[i].y * sin * 0.3;
      const ry = nodeData[i].y;
      mesh.position.set(rx, ry, nodeData[i].x * sin * 0.3);

      const isHovered = hoveredNode === i;
      mesh.scale.setScalar(isHovered ? 1.3 : 1);
      mesh.material.emissiveIntensity = isHovered ? 0.9 : mesh.userData.baseEmissive;
    });

    techLineMeshes.forEach(line => {
      const positions = line.geometry.attributes.position;
      const a = line.userData.a, b = line.userData.b;
      positions.setXYZ(0, techMeshes[a].position.x, techMeshes[a].position.y, techMeshes[a].position.z);
      positions.setXYZ(1, techMeshes[b].position.x, techMeshes[b].position.y, techMeshes[b].position.z);
      positions.needsUpdate = true;

      const isHighlit = hoveredNode === a || hoveredNode === b;
      line.material.color.set(isHighlit ? 0xe8820c : 0x1a1e2a);
      line.material.opacity = isHighlit ? 0.9 : 0.35;
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     SPARK TRAIL  (timeline)
     ═══════════════════════════════════════════════════════════════ */
  const SPARK_COUNT = 12;
  let sparkPositions, sparkLifetimes;
  let sparkMesh;

  function buildSparkTrail() {
    const geo = new THREE.BufferGeometry();
    sparkPositions = new Float32Array(SPARK_COUNT * 3);
    sparkLifetimes = new Float32Array(SPARK_COUNT).fill(0);

    geo.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xe8820c,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });

    sparkMesh = new THREE.Points(geo, mat);
    groups.sparkTrail.add(sparkMesh);
  }

  let sparkHeadX = -20, sparkHeadY = 0;

  function emitSparks(worldX, worldY) {
    sparkHeadX = worldX;
    sparkHeadY = worldY;
    for (let i = 0; i < SPARK_COUNT; i++) {
      if (sparkLifetimes[i] <= 0) {
        sparkPositions[i * 3]     = worldX + (Math.random() - 0.5) * 0.4;
        sparkPositions[i * 3 + 1] = worldY + (Math.random() - 0.5) * 0.4;
        sparkPositions[i * 3 + 2] = 0;
        sparkLifetimes[i] = 0.3 + Math.random() * 0.3;
        break;
      }
    }
  }

  function updateSparks(dt) {
    if (!sparkMesh) return;
    const pos = sparkMesh.geometry.attributes.position;
    for (let i = 0; i < SPARK_COUNT; i++) {
      if (sparkLifetimes[i] > 0) {
        sparkLifetimes[i] -= dt;
        sparkPositions[i * 3]     += (Math.random() - 0.5) * 0.06;
        sparkPositions[i * 3 + 1] += Math.random() * 0.04 - 0.01;
      } else {
        sparkPositions[i * 3] = -999;
      }
    }
    pos.array.set(sparkPositions);
    pos.needsUpdate = true;
  }

  /* ═══════════════════════════════════════════════════════════════
     MOUSE PARALLAX
     ═══════════════════════════════════════════════════════════════ */
  let mouseX = 0, mouseY = 0;
  let camTargetX = 0, camTargetY = 0;

  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  /* ═══════════════════════════════════════════════════════════════
     SCISSOR RENDERING — service tiles
     ═══════════════════════════════════════════════════════════════ */
  function renderServiceTiles() {
    const tileEls = document.querySelectorAll('[data-tile]');
    if (!tileEls.length) return;

    renderer.setScissorTest(true);

    tileEls.forEach((el, i) => {
      if (i >= tileObjects.length) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const miniEl = el.querySelector('.tile-mini-3d');
      if (!miniEl) return;
      const mr = miniEl.getBoundingClientRect();

      const dpr = renderer.getPixelRatio();
      const x = mr.left * dpr;
      const y = (window.innerHeight - mr.bottom) * dpr;
      const w = mr.width  * dpr;
      const h = mr.height * dpr;

      if (w <= 0 || h <= 0) return;

      renderer.setScissor(x, y, w, h);
      renderer.setViewport(x, y, w, h);

      const tileCam = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
      tileCam.position.z = 4;

      tileObjects[i].visible = true;
      tileObjects[i].rotation.y += 0.004;

      /* Render only the serviceMinis group */
      const allVis = Object.values(groups).map(g => g.visible);
      Object.values(groups).forEach(g => g.visible = false);
      groups.serviceMinis.visible = true;

      renderer.render(scene, tileCam);

      Object.values(groups).forEach((g, gi) => g.visible = allVis[gi]);
    });

    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
    renderer.setScissor( 0, 0, window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
  }

  /* ═══════════════════════════════════════════════════════════════
     CONSTELLATION — SCISSORED TO SECTION
     ═══════════════════════════════════════════════════════════════ */
  function renderConstellation(t) {
    const area = document.getElementById('constellation-area');
    if (!area || !groups.constellation.visible) return;

    const rect = area.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dpr = renderer.getPixelRatio();
    const x = rect.left   * dpr;
    const y = (window.innerHeight - rect.bottom) * dpr;
    const w = rect.width  * dpr;
    const h = rect.height * dpr;

    renderer.setScissorTest(true);
    renderer.setScissor(x, y, w, h);
    renderer.setViewport(x, y, w, h);

    const conCam = new THREE.PerspectiveCamera(55, rect.width / rect.height, 0.1, 200);
    conCam.position.set(
      mouseX * 1.5,
      mouseY * 1.0,
      20
    );
    conCam.lookAt(0, 0, 0);

    /* Orbit */
    groups.constellation.children.forEach((child, i) => {
      const speed = child.userData.orbitSpeed || 0.002;
      const phase = child.userData.orbitPhase || 0;
      child.rotation.y += speed;
    });

    updateSharedTexture(t);

    const allVis = Object.values(groups).map(g => g.visible);
    Object.values(groups).forEach(g => g.visible = false);
    groups.constellation.visible = true;

    renderer.render(scene, conCam);

    Object.values(groups).forEach((g, gi) => g.visible = allVis[gi]);

    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, window.innerWidth * dpr, window.innerHeight * dpr);
    renderer.setScissor( 0, 0, window.innerWidth * dpr, window.innerHeight * dpr);
  }

  /* Tech graph — scissored */
  function renderTechGraph(t) {
    const area = document.getElementById('tech-graph-area');
    if (!area || !groups.techGraph.visible) return;

    const rect = area.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dpr = renderer.getPixelRatio();
    const x = rect.left   * dpr;
    const y = (window.innerHeight - rect.bottom) * dpr;
    const w = rect.width  * dpr;
    const h = rect.height * dpr;

    renderer.setScissorTest(true);
    renderer.setScissor(x, y, w, h);
    renderer.setViewport(x, y, w, h);

    const graphCam = new THREE.PerspectiveCamera(55, rect.width / rect.height, 0.1, 200);
    graphCam.position.set(0, 0, 22);
    graphCam.lookAt(0, 0, 0);

    updateTechGraph(t);

    const allVis = Object.values(groups).map(g => g.visible);
    Object.values(groups).forEach(g => g.visible = false);
    groups.techGraph.visible = true;

    renderer.render(scene, graphCam);

    Object.values(groups).forEach((g, gi) => g.visible = allVis[gi]);

    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, window.innerWidth * dpr, window.innerHeight * dpr);
    renderer.setScissor( 0, 0, window.innerWidth * dpr, window.innerHeight * dpr);
  }

  /* ═══════════════════════════════════════════════════════════════
     MAIN HERO RENDER
     ═══════════════════════════════════════════════════════════════ */
  function renderHero(t) {
    /* Camera parallax */
    camTargetX += (mouseX * 10 - camTargetX) * 0.08;
    camTargetY += (mouseY * 10 - camTargetY) * 0.08;
    camera.position.x = camTargetX;
    camera.position.y = camTargetY;
    camera.lookAt(0, 0, 0);

    /* Terrain gentle rotation */
    if (groups.heroTerrain.children.length) {
      groups.heroTerrain.children[0].rotation.z += 0.0004;
    }

    animateParticles(t);

    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
  }

  /* ═══════════════════════════════════════════════════════════════
     RAF LOOP
     ═══════════════════════════════════════════════════════════════ */
  let isTabVisible = true;
  let lastT = 0;
  let rafId = null;

  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (isTabVisible && !prefersReduced) startLoop();
  });

  function tick(t) {
    if (!isTabVisible) { rafId = null; return; }
    const dt = (t - lastT) / 1000;
    lastT = t;

    renderHero(t);
    renderConstellation(t);
    renderTechGraph(t);
    renderServiceTiles();
    updateSparks(Math.min(dt, 0.05));

    rafId = requestAnimationFrame(tick);
  }

  function startLoop() {
    if (rafId) return;
    rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  /* ═══════════════════════════════════════════════════════════════
     RESIZE
     ═══════════════════════════════════════════════════════════════ */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateParticleCenter();
  });

  /* ═══════════════════════════════════════════════════════════════
     INTERSECTION OBSERVERS  (group visibility toggling)
     ═══════════════════════════════════════════════════════════════ */
  function watchSection(selector, groupName, onEnter, onLeave) {
    const el = document.querySelector(selector);
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      const grp = groups[groupName];
      grp.visible = entry.isIntersecting;
      if (entry.isIntersecting && onEnter) onEnter();
      if (!entry.isIntersecting && onLeave) onLeave();
    }, { threshold: 0.1 });
    obs.observe(el);
  }

  /* ═══════════════════════════════════════════════════════════════
     TECH GRAPH — HOVER RAYCASTING
     ═══════════════════════════════════════════════════════════════ */
  function initTechGraphHover() {
    const area = document.getElementById('tech-graph-area');
    if (!area) return;

    const raycaster = new THREE.Raycaster();
    const mouse2D   = new THREE.Vector2();

    area.addEventListener('mousemove', e => {
      const rect = area.getBoundingClientRect();
      mouse2D.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse2D.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;

      const graphCam = new THREE.PerspectiveCamera(55, rect.width / rect.height, 0.1, 200);
      graphCam.position.set(0, 0, 22);
      graphCam.lookAt(0, 0, 0);

      raycaster.setFromCamera(mouse2D, graphCam);
      const hits = raycaster.intersectObjects(techMeshes);

      if (hits.length) {
        const idx = hits[0].object.userData.nodeIndex;
        hoveredNode = idx;
        const node = techNodes[idx];
        tooltip.textContent = `${node.label} — ${node.projects.join(', ') || 'Portfolio'}`;
        tooltip.classList.add('visible');
        tooltip.style.left = (e.clientX + 12) + 'px';
        tooltip.style.top  = (e.clientY - 8)  + 'px';
      } else {
        hoveredNode = null;
        tooltip.classList.remove('visible');
      }
    });

    area.addEventListener('mouseleave', () => {
      hoveredNode = null;
      tooltip.classList.remove('visible');
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     PUBLIC API — exposed for animations.js / main.js
     ═══════════════════════════════════════════════════════════════ */
  window.Scene = {
    groups,
    emitSparks,
    renderer,
    scene,
    camera,
    techMeshes,
    techLineMeshes,
  };

  /* ═══════════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════════ */
  function init() {
    buildHeroTerrain();
    buildHeroParticles();
    buildConstellation();
    buildServiceMinis();
    buildTechGraph();
    buildSparkTrail();

    updateParticleCenter();

    /* Section observers */
    watchSection('#hero',          'heroTerrain');
    watchSection('#hero',          'heroParticles', updateParticleCenter);
    watchSection('#final-cta',     'heroTerrain');
    watchSection('#services',      'constellation');
    watchSection('#services',      'serviceMinis');
    watchSection('#tech',          'techGraph', initTechGraphHover);
    watchSection('#process',       'sparkTrail');

    /* Reduced motion: render one frame only */
    if (prefersReduced) {
      groups.heroTerrain.visible = true;
      groups.heroParticles.visible = true;
      renderer.render(scene, camera);
      return;
    }

    startLoop();
    window.SceneState.ready = true;
  }

  /* Wait for DOM */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
