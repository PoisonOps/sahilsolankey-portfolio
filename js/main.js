/* main.js — boot, marquee, cursor, hero gradient, constellation, tile canvases, tech logos, sound, FAB */
'use strict';

/* ── Constants ───────────────────────────────────────────────────── */
const POSTROOM_URL = 'FILL_ME_IN'; /* Sahil: replace with your Postroom Vercel URL */

const WA_URL = 'https://wa.me/917080442040?text=Hi%20Sahil%2C%20I%20saw%20your%20portfolio%20and%20want%20to%20discuss%20a%20project.';

const MARQUEE_ITEMS = [
  '● CATalyst — live with paying users',
  '● GharKhata shipped in 2 days',
  '● PitchReady shipped in 1 day',
  '● Postroom Studio — designed & shipped',
  '<span class="marquee-live">● NEXT SLOT: AVAILABLE NOW</span>',
  '● 7-DAY DELIVERY · FROM ₹15,000',
];

/* ═══════════════════════════════════════════════════════════════════
   MARQUEE
   ═══════════════════════════════════════════════════════════════════ */
function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const itemsHTML = MARQUEE_ITEMS
    .map(item => `<span class="marquee-item">${item}</span>`)
    .join('');

  const block = `<span class="marquee-content">${itemsHTML}</span>`;

  if (prefersReduced) {
    track.style.animation = 'none';
    track.innerHTML = block;
    return;
  }

  track.innerHTML = block + block;
}

/* ═══════════════════════════════════════════════════════════════════
   HERO MESH GRADIENT CANVAS  (canvas 2D, no Three.js)
   Flowing gradient like Stripe — far more premium than low-poly terrain
   ═══════════════════════════════════════════════════════════════════ */
function initHeroGradient() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, points, rafId;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    buildPoints();
  }

  function buildPoints() {
    points = [
      { x: 0.15, y: 0.3,  r: 0.55, h: 220, s: 0.7, l: 0.08, vx: 0.0002, vy: 0.00015 },
      { x: 0.8,  y: 0.6,  r: 0.5,  h: 24,  s: 0.9, l: 0.06, vx: -0.00018, vy: 0.0002 },
      { x: 0.5,  y: 0.85, r: 0.45, h: 270, s: 0.6, l: 0.05, vx: 0.00022, vy: -0.00012 },
      { x: 0.9,  y: 0.1,  r: 0.4,  h: 45,  s: 0.8, l: 0.04, vx: -0.0002, vy: 0.00025 },
      { x: 0.1,  y: 0.9,  r: 0.35, h: 190, s: 0.7, l: 0.035,vx: 0.00015, vy: -0.0002 },
    ];
  }

  let t = 0;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    /* Base dark background */
    ctx.fillStyle = '#050810';
    ctx.fillRect(0, 0, W, H);

    /* Flowing gradient blobs */
    points.forEach(p => {
      if (!prefersReduced) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -0.1 || p.x > 1.1) p.vx *= -1;
        if (p.y < -0.1 || p.y > 1.1) p.vy *= -1;
      }

      const grd = ctx.createRadialGradient(
        p.x * W, p.y * H, 0,
        p.x * W, p.y * H, p.r * Math.max(W, H)
      );
      grd.addColorStop(0, `hsla(${p.h}, ${p.s * 100}%, ${p.l * 100}%, 1)`);
      grd.addColorStop(1, 'transparent');

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
    });

    ctx.globalCompositeOperation = 'source-over';

    /* Subtle grid overlay */
    ctx.strokeStyle = 'rgba(26,30,42,0.4)';
    ctx.lineWidth = 0.5;
    const gridSize = 48;
    for (let x = 0; x < W; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    t++;
    if (!prefersReduced) {
      rafId = requestAnimationFrame(draw);
    }
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}

/* ═══════════════════════════════════════════════════════════════════
   CSS 3D CONSTELLATION
   Five device cards positioned in 3D space with transform-style: preserve-3d
   ═══════════════════════════════════════════════════════════════════ */
function initConstellation() {
  const wrap = document.getElementById('constellation-wrap');
  if (!wrap) return;

  const isMobile = window.SceneState?.isMobile;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Cards have NO individual rotateY. Stage rotates continuously; each card counter-rotates
     to always face the viewer. Full orbit with zero mirroring. */
  const devices = [
    {
      label: 'MacBook Pro', width: 285, height: 184,
      left: '50%', top: '50%', base: 'translate(-50%,-52%) translateZ(110px)',
      isLaptop: true, draw: drawDashboard,
    },
    {
      label: 'iPhone 15', width: 88, height: 192,
      left: '74%', top: '57%', base: 'translate(-50%,-50%) translateZ(22px)',
      draw: drawMobileApp,
    },
    {
      label: 'Android', width: 86, height: 190,
      left: '26%', top: '60%', base: 'translate(-50%,-50%) translateZ(22px)',
      draw: drawChatApp,
    },
    {
      label: 'iPad Pro', width: 208, height: 158,
      left: '72%', top: '22%', base: 'translate(-50%,-50%) translateZ(-18px)',
      opacity: 0.7, draw: drawAnalytics,
    },
    {
      label: 'Windows', width: 220, height: 146,
      left: '28%', top: '24%', base: 'translate(-50%,-50%) translateZ(-18px)',
      opacity: 0.65, draw: drawDashboard,
    },
  ];

  /* Build desktop constellation */
  const stage = wrap.querySelector('.constellation-stage');
  if (!stage) return;

  const deviceEls = [];

  devices.forEach(dev => {
    const el = document.createElement('div');
    el.className = 'cs-device';
    el.style.left = dev.left;
    el.style.top  = dev.top;
    el.style.transform = dev.base;
    el.dataset.base = dev.base;
    if (dev.opacity) el.style.opacity = dev.opacity;

    const inner = document.createElement('div');
    inner.className = 'cs-device-inner';

    const screen = document.createElement('div');
    screen.className = 'cs-screen';

    /* Canvas for the screen content */
    const canvas = document.createElement('canvas');
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width  = dev.width  * dpr;
    canvas.height = dev.height * dpr;
    canvas.style.width  = dev.width  + 'px';
    canvas.style.height = dev.height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    screen.appendChild(canvas);

    /* Laptop gets bezel treatment */
    if (dev.isLaptop) {
      screen.style.borderRadius = '6px 6px 0 0';
      inner.style.borderRadius = '10px 10px 4px 4px';
      inner.style.overflow = 'visible';

      const baseEl = document.createElement('div');
      baseEl.style.cssText = `
        height:12px;
        background:linear-gradient(to bottom,#23263a,#1c1e2d);
        border-radius:0 0 8px 8px;
        border:1px solid rgba(255,255,255,0.05);
        border-top:none;
      `;
      inner.appendChild(screen);
      inner.appendChild(baseEl);
    } else {
      inner.appendChild(screen);
    }

    const label = document.createElement('div');
    label.className = 'cs-label';
    label.textContent = dev.label;

    el.appendChild(inner);
    el.appendChild(label);
    stage.appendChild(el);
    deviceEls.push(el);

    /* Animate the canvas content */
    let animFrame;
    let localT = Math.random() * 1000;

    function animate() {
      ctx.clearRect(0, 0, dev.width, dev.height);
      dev.draw(ctx, dev.width, dev.height, localT);
      localT += 0.3;
      animFrame = requestAnimationFrame(animate);
    }

    animate();
  });

  /* Stage rotates continuously. Each card counter-rotates to always face the viewer. */
  {
    let stageAngle = 0, tMouse = 0, cMouse = 0;
    const SPEED = 0.18; /* °/frame → full orbit ≈ 33s */
    const TILT  = 5;    /* constant X-tilt for depth feel */

    if (!prefersReduced) {
      wrap.addEventListener('mousemove', e => {
        const rect = wrap.getBoundingClientRect();
        tMouse = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      });
      wrap.addEventListener('mouseleave', () => { tMouse = 0; });

      (function animLoop() {
        stageAngle += SPEED;
        cMouse += (tMouse - cMouse) * 0.05;
        const angle = stageAngle + cMouse;

        stage.style.transform = `rotateX(${TILT}deg) rotateY(${angle.toFixed(2)}deg)`;

        /* Counter-rotate so canvas text is never mirrored regardless of orbit position */
        deviceEls.forEach(card => {
          card.style.transform = `${card.dataset.base} rotateY(${(-angle).toFixed(2)}deg)`;
        });

        requestAnimationFrame(animLoop);
      })();
    } else {
      stage.style.transform = `rotateX(${TILT}deg) rotateY(-5deg)`;
    }
  }

  /* Build mobile constellation */
  const mobileWrap = document.getElementById('constellation-mobile');
  if (mobileWrap) {
    const mobileDevices = [
      { label: 'Web / Desktop', w: 200, h: 130, draw: drawDashboard },
      { label: 'iOS / Android',  w: 200, h: 130, draw: drawMobileApp },
      { label: 'AI / SaaS',      w: 200, h: 130, draw: drawChatApp },
    ];

    mobileDevices.forEach(dev => {
      const card = document.createElement('div');
      card.className = 'cm-device';

      const screenDiv = document.createElement('div');
      screenDiv.className = 'cm-device-screen';

      const canvas = document.createElement('canvas');
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width  = dev.w * dpr;
      canvas.height = dev.h * dpr;
      canvas.style.width  = dev.w + 'px';
      canvas.style.height = dev.h + 'px';

      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      screenDiv.appendChild(canvas);

      const labelDiv = document.createElement('div');
      labelDiv.className = 'cm-device-label';
      labelDiv.textContent = dev.label;

      card.appendChild(screenDiv);
      card.appendChild(labelDiv);
      mobileWrap.appendChild(card);

      let t = Math.random() * 1000;
      function animate() {
        ctx.clearRect(0, 0, dev.w, dev.h);
        dev.draw(ctx, dev.w, dev.h, t);
        t += 0.3;
        requestAnimationFrame(animate);
      }
      animate();
    });
  }
}

/* ═══════════════════════════════════════════════════════════════════
   CANVAS DRAW FUNCTIONS  (shared between constellation + tiles)
   Each draws a realistic animated UI into a 2D canvas context
   ═══════════════════════════════════════════════════════════════════ */

function drawDashboard(ctx, W, H, t) {
  /* Background */
  ctx.fillStyle = '#090c18';
  ctx.fillRect(0, 0, W, H);

  const sw = W * 0.22; /* sidebar width */

  /* Sidebar */
  ctx.fillStyle = '#0d1020';
  ctx.fillRect(0, 0, sw, H);

  /* Sidebar nav items */
  const navItems = [
    { y: 0.12, active: true },
    { y: 0.24, active: false },
    { y: 0.36, active: false },
    { y: 0.48, active: false },
  ];

  navItems.forEach(item => {
    ctx.fillStyle = item.active ? 'rgba(232,130,12,0.2)' : 'rgba(255,255,255,0.04)';
    ctx.beginPath();
    ctx.roundRect(sw * 0.1, H * item.y, sw * 0.8, H * 0.08, 4);
    ctx.fill();

    if (item.active) {
      ctx.fillStyle = '#e8820c';
      ctx.beginPath();
      ctx.roundRect(sw * 0.1, H * item.y, sw * 0.18, H * 0.08, 4);
      ctx.fill();
    }
  });

  /* Logo area */
  ctx.fillStyle = 'rgba(232,130,12,0.9)';
  ctx.beginPath();
  ctx.roundRect(sw * 0.1, H * 0.04, sw * 0.35, sw * 0.28, 4);
  ctx.fill();

  /* Header */
  ctx.fillStyle = '#10131f';
  ctx.fillRect(sw, 0, W - sw, H * 0.14);

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.roundRect(W * 0.65, H * 0.035, W * 0.18, H * 0.07, 20);
  ctx.fill();

  /* Stats row */
  const stats = [0.32, 0.55, 0.72];
  const statColors = ['rgba(46,91,255,0.6)', 'rgba(74,222,128,0.6)', 'rgba(232,130,12,0.6)'];
  stats.forEach((x, i) => {
    ctx.fillStyle = statColors[i];
    ctx.beginPath();
    ctx.roundRect(sw + (W - sw) * x - (W * 0.09), H * 0.18, W * 0.18, H * 0.14, 6);
    ctx.fill();

    /* Metric line */
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath();
    ctx.roundRect(sw + (W - sw) * x - (W * 0.07), H * 0.2, W * 0.07, H * 0.03, 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.roundRect(sw + (W - sw) * x - (W * 0.07), H * 0.25, W * 0.05, H * 0.025, 2);
    ctx.fill();
  });

  /* Animated bar chart */
  const barCount = 7;
  const chartLeft = sw + (W - sw) * 0.05;
  const chartW    = (W - sw) * 0.55;
  const chartTop  = H * 0.38;
  const chartH    = H * 0.45;
  const barW      = chartW / barCount * 0.55;

  /* Chart background */
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.beginPath();
  ctx.roundRect(chartLeft - 4, chartTop - 4, chartW + 8, chartH + 8, 6);
  ctx.fill();

  const barHeights = [0.45, 0.7, 0.55, 0.85, 0.6, 0.75, 0.9];

  barHeights.forEach((bh, i) => {
    const animated = bh * (0.85 + 0.15 * Math.sin(t * 0.015 + i * 0.7));
    const x = chartLeft + (chartW / barCount) * i + (chartW / barCount - barW) / 2;
    const barH = chartH * animated;
    const y = chartTop + chartH - barH;

    /* Bar gradient */
    const grad = ctx.createLinearGradient(0, y, 0, chartTop + chartH);
    grad.addColorStop(0, `rgba(232,130,12,${0.7 + 0.2 * animated})`);
    grad.addColorStop(1, 'rgba(232,130,12,0.15)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
    ctx.fill();
  });

  /* Mini line chart (right side) */
  const lcLeft = chartLeft + chartW + (W - sw) * 0.06;
  const lcW    = (W - sw) * 0.28;
  const lcTop  = chartTop;
  const lcH    = chartH;

  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.beginPath();
  ctx.roundRect(lcLeft - 4, lcTop - 4, lcW + 8, lcH + 8, 6);
  ctx.fill();

  const linePoints = [0.6, 0.45, 0.7, 0.5, 0.8, 0.55, 0.75, 0.9, 0.65].map(
    (v, i) => ({
      x: lcLeft + lcW * (i / 8),
      y: lcTop + lcH * (1 - v * (0.85 + 0.15 * Math.sin(t * 0.01 + i)))
    })
  );

  ctx.strokeStyle = 'rgba(74,222,128,0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  linePoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  /* Fill under line */
  const fillGrad = ctx.createLinearGradient(0, lcTop, 0, lcTop + lcH);
  fillGrad.addColorStop(0, 'rgba(74,222,128,0.15)');
  fillGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = fillGrad;
  ctx.beginPath();
  linePoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.lineTo(linePoints[linePoints.length - 1].x, lcTop + lcH);
  ctx.lineTo(linePoints[0].x, lcTop + lcH);
  ctx.closePath();
  ctx.fill();

  /* Notification dot */
  const notifOpacity = 0.6 + 0.4 * Math.sin(t * 0.04);
  ctx.fillStyle = `rgba(74,222,128,${notifOpacity})`;
  ctx.beginPath();
  ctx.arc(W * 0.82, H * 0.07, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawMobileApp(ctx, W, H, t) {
  ctx.fillStyle = '#090c18';
  ctx.fillRect(0, 0, W, H);

  /* Status bar */
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, 0, W, H * 0.06);

  /* Time */
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.font = `${H * 0.038}px JetBrains Mono, monospace`;
  ctx.fillText('9:41', W * 0.08, H * 0.042);

  /* App header */
  ctx.fillStyle = 'rgba(0,200,83,0.15)';
  ctx.fillRect(0, H * 0.06, W, H * 0.1);

  ctx.fillStyle = 'rgba(0,200,83,0.9)';
  ctx.font = `bold ${H * 0.05}px Inter, sans-serif`;
  ctx.fillText('GharKhata', W * 0.08, H * 0.135);

  /* Balance card */
  const cardGrad = ctx.createLinearGradient(0, H * 0.19, 0, H * 0.38);
  cardGrad.addColorStop(0, 'rgba(0,200,83,0.25)');
  cardGrad.addColorStop(1, 'rgba(0,200,83,0.05)');
  ctx.fillStyle = cardGrad;
  ctx.beginPath();
  ctx.roundRect(W * 0.06, H * 0.19, W * 0.88, H * 0.19, 10);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = `${H * 0.034}px JetBrains Mono, monospace`;
  ctx.fillText('Balance', W * 0.12, H * 0.255);

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.font = `bold ${H * 0.065}px JetBrains Mono, monospace`;
  ctx.fillText('₹12,450', W * 0.12, H * 0.33);

  /* Expense items */
  const expenses = [
    { label: 'Groceries', amt: '₹840', color: 'rgba(232,130,12,0.8)' },
    { label: 'Dinner',    amt: '₹560', color: 'rgba(46,91,255,0.8)' },
    { label: 'Travel',    amt: '₹320', color: 'rgba(74,222,128,0.8)' },
    { label: 'Coffee',    amt: '₹180', color: 'rgba(255,100,100,0.8)' },
  ];

  expenses.forEach((exp, i) => {
    const y = H * (0.44 + i * 0.125);
    const animOffset = Math.sin(t * 0.02 + i) * 0;

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath();
    ctx.roundRect(W * 0.06, y, W * 0.88, H * 0.1, 6);
    ctx.fill();

    /* Color dot */
    ctx.fillStyle = exp.color;
    ctx.beginPath();
    ctx.arc(W * 0.14, y + H * 0.05, H * 0.022, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `${H * 0.034}px Inter, sans-serif`;
    ctx.fillText(exp.label, W * 0.2, y + H * 0.058);

    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = `${H * 0.032}px JetBrains Mono, monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(exp.amt, W * 0.88, y + H * 0.058);
    ctx.textAlign = 'left';
  });

  /* Bottom tab bar */
  ctx.fillStyle = '#0d1020';
  ctx.fillRect(0, H * 0.9, W, H * 0.1);

  const tabs = ['⊞', '↗', '⊕', '◷'];
  tabs.forEach((icon, i) => {
    ctx.fillStyle = i === 0 ? 'rgba(0,200,83,0.9)' : 'rgba(255,255,255,0.25)';
    ctx.font = `${H * 0.045}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(icon, W * (0.15 + i * 0.23), H * 0.955);
  });
  ctx.textAlign = 'left';
}

function drawChatApp(ctx, W, H, t) {
  ctx.fillStyle = '#090c18';
  ctx.fillRect(0, 0, W, H);

  /* Header */
  ctx.fillStyle = 'rgba(232,130,12,0.12)';
  ctx.fillRect(0, 0, W, H * 0.12);

  ctx.fillStyle = 'rgba(232,130,12,0.9)';
  ctx.beginPath();
  ctx.arc(W * 0.12, H * 0.06, H * 0.033, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = `${H * 0.042}px Inter, sans-serif`;
  ctx.fillText('AI Assistant', W * 0.2, H * 0.073);

  /* Status: online */
  ctx.fillStyle = 'rgba(74,222,128,0.9)';
  ctx.beginPath();
  ctx.arc(W * 0.2, H * 0.1, 3, 0, Math.PI * 2);
  ctx.fill();

  /* Chat bubbles — animate their appearance */
  const msgs = [
    { text: 'What\'s my weakest topic?', user: false, y: 0.16 },
    { text: 'Permutations. 3 errors\nin last 7 days.', user: true,  y: 0.28 },
    { text: 'Start a fix session?',   user: false, y: 0.44 },
    { text: 'Yes, fix it →',          user: true,  y: 0.54 },
  ];

  const phase = (t * 0.008) % 1;
  const visibleCount = Math.min(msgs.length, Math.floor(phase * (msgs.length + 1)) + 1);

  msgs.slice(0, visibleCount).forEach((msg, i) => {
    const maxW = W * 0.72;
    const lines = msg.text.split('\n');
    const lineH = H * 0.042;
    const padX = H * 0.025, padY = H * 0.02;
    const bubbleH = lines.length * lineH + padY * 2;
    const bubbleW = maxW;

    if (msg.user) {
      /* Right bubble — accent */
      const x = W - maxW - W * 0.06;
      const bgGrad = ctx.createLinearGradient(x, 0, x + bubbleW, 0);
      bgGrad.addColorStop(0, 'rgba(232,130,12,0.25)');
      bgGrad.addColorStop(1, 'rgba(232,130,12,0.15)');
      ctx.fillStyle = bgGrad;
      ctx.strokeStyle = 'rgba(232,130,12,0.3)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.roundRect(x, H * msg.y, bubbleW, bubbleH, [8, 2, 8, 8]);
      ctx.fill();
      ctx.stroke();

      lines.forEach((line, li) => {
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = `${H * 0.038}px Inter, sans-serif`;
        ctx.fillText(line, x + padX, H * msg.y + padY + lineH * (li + 0.75));
      });
    } else {
      /* Left bubble */
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.roundRect(W * 0.06, H * msg.y, bubbleW, bubbleH, [2, 8, 8, 8]);
      ctx.fill();

      lines.forEach((line, li) => {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = `${H * 0.038}px Inter, sans-serif`;
        ctx.fillText(line, W * 0.06 + padX, H * msg.y + padY + lineH * (li + 0.75));
      });
    }
  });

  /* Typing indicator */
  if (visibleCount <= msgs.length) {
    const dotT = t * 0.05;
    [0, 0.4, 0.8].forEach((offset, i) => {
      const opacity = 0.3 + 0.4 * Math.abs(Math.sin(dotT + offset));
      ctx.fillStyle = `rgba(255,255,255,${opacity})`;
      ctx.beginPath();
      ctx.arc(W * 0.1 + i * H * 0.03, H * 0.72, H * 0.013, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* Input bar */
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath();
  ctx.roundRect(W * 0.06, H * 0.88, W * 0.73, H * 0.07, 20);
  ctx.fill();

  ctx.fillStyle = 'rgba(232,130,12,0.9)';
  ctx.beginPath();
  ctx.arc(W * 0.9, H * 0.915, H * 0.027, 0, Math.PI * 2);
  ctx.fill();
}

function drawAnalytics(ctx, W, H, t) {
  ctx.fillStyle = '#090c18';
  ctx.fillRect(0, 0, W, H);

  /* Header */
  ctx.fillStyle = 'rgba(46,91,255,0.1)';
  ctx.fillRect(0, 0, W, H * 0.16);

  ctx.fillStyle = 'rgba(46,91,255,0.9)';
  ctx.font = `${H * 0.055}px DM Serif Display, Georgia, serif`;
  ctx.fillText('Analytics', W * 0.06, H * 0.11);

  /* Donut chart */
  const cx = W * 0.22, cy = H * 0.48, r = H * 0.17;
  const segments = [
    { pct: 0.42, color: 'rgba(46,91,255,0.9)' },
    { pct: 0.28, color: 'rgba(74,222,128,0.9)' },
    { pct: 0.18, color: 'rgba(232,130,12,0.9)' },
    { pct: 0.12, color: 'rgba(255,100,100,0.6)' },
  ];

  let startAngle = -Math.PI / 2 + t * 0.002;
  segments.forEach(seg => {
    const endAngle = startAngle + seg.pct * Math.PI * 2;
    ctx.fillStyle = seg.color;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    startAngle = endAngle;
  });

  /* Donut hole */
  ctx.fillStyle = '#090c18';
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
  ctx.fill();

  /* Center text */
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = `bold ${H * 0.055}px JetBrains Mono, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('42%', cx, cy + H * 0.022);
  ctx.font = `${H * 0.032}px Inter, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillText('main', cx, cy + H * 0.06);
  ctx.textAlign = 'left';

  /* Metric list */
  const metrics = [
    { label: 'Users', val: '1,247', trend: '+12%', c: 'rgba(74,222,128,0.8)' },
    { label: 'Revenue', val: '₹48.9k', trend: '+23%', c: 'rgba(46,91,255,0.8)' },
    { label: 'Churn', val: '2.1%', trend: '-0.4%', c: 'rgba(232,130,12,0.8)' },
  ];

  metrics.forEach((m, i) => {
    const y = H * (0.22 + i * 0.16);
    const x = W * 0.48;

    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.beginPath();
    ctx.roundRect(x, y, W * 0.47, H * 0.12, 5);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = `${H * 0.034}px Inter, sans-serif`;
    ctx.fillText(m.label, x + 8, y + H * 0.048);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = `bold ${H * 0.044}px JetBrains Mono, monospace`;
    ctx.fillText(m.val, x + 8, y + H * 0.1);

    ctx.fillStyle = m.c;
    ctx.font = `${H * 0.03}px JetBrains Mono, monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(m.trend, x + W * 0.44, y + H * 0.075);
    ctx.textAlign = 'left';
  });

  /* Mini sparkline at bottom */
  const slPoints = [0.3,0.55,0.4,0.7,0.5,0.8,0.65,0.9].map(
    (v, i) => ({ x: W * (0.06 + i / 7 * 0.88), y: H * (0.82 + 0.1 * (1 - v)) })
  );

  ctx.strokeStyle = 'rgba(46,91,255,0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  slPoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();
}

/* Draw functions for tile canvases */
function drawWebAppTile(ctx, W, H, t) { drawDashboard(ctx, W, H, t); }

function drawMobileTile(ctx, W, H, t) {
  ctx.fillStyle = '#090c18';
  ctx.fillRect(0, 0, W, H);

  /* Two phones side by side */
  const phones = [
    { x: W * 0.18, tint: 'rgba(0,200,83,0.8)' },
    { x: W * 0.56, tint: 'rgba(46,91,255,0.8)' },
  ];

  phones.forEach(ph => {
    /* Phone outline */
    ctx.fillStyle = 'rgba(26,30,42,0.9)';
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(ph.x, H * 0.05, W * 0.26, H * 0.88, 8);
    ctx.fill();
    ctx.stroke();

    /* Screen */
    ctx.fillStyle = '#090b12';
    ctx.beginPath();
    ctx.roundRect(ph.x + W * 0.02, H * 0.1, W * 0.22, H * 0.76, 5);
    ctx.fill();

    /* App interface */
    ctx.fillStyle = ph.tint;
    ctx.beginPath();
    ctx.roundRect(ph.x + W * 0.04, H * 0.13, W * 0.18, H * 0.14, 3);
    ctx.fill();

    /* Rows */
    for (let i = 0; i < 4; i++) {
      const y = H * (0.3 + i * 0.14);
      const opacity = 0.04 + 0.03 * Math.sin(t * 0.02 + i);
      ctx.fillStyle = `rgba(255,255,255,${opacity})`;
      ctx.beginPath();
      ctx.roundRect(ph.x + W * 0.03, y, W * 0.2, H * 0.09, 3);
      ctx.fill();

      /* Row dot */
      ctx.fillStyle = ph.tint;
      ctx.beginPath();
      ctx.arc(ph.x + W * 0.065, y + H * 0.045, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Bottom nav */
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(ph.x + W * 0.02, H * 0.82, W * 0.22, H * 0.06);
    ctx.fillStyle = ph.tint;
    ctx.beginPath();
    ctx.arc(ph.x + W * 0.13, H * 0.85, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawDesktopTile(ctx, W, H, t) {
  ctx.fillStyle = '#090c18';
  ctx.fillRect(0, 0, W, H);

  /* Window frame */
  ctx.fillStyle = '#14172a';
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(W * 0.04, H * 0.04, W * 0.92, H * 0.92, 10);
  ctx.fill();
  ctx.stroke();

  /* Traffic light buttons */
  const dots = [
    { x: W * 0.1, c: '#ff5f57' },
    { x: W * 0.17, c: '#ffbd2e' },
    { x: W * 0.24, c: '#28ca42' },
  ];
  dots.forEach(d => {
    ctx.fillStyle = d.c;
    ctx.beginPath();
    ctx.arc(d.x, H * 0.13, H * 0.038, 0, Math.PI * 2);
    ctx.fill();
  });

  /* Title bar */
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(W * 0.04, H * 0.04, W * 0.92, H * 0.18);

  /* Menu bar items */
  const menuItems = ['File', 'Edit', 'View', 'Build'];
  menuItems.forEach((item, i) => {
    ctx.fillStyle = i === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)';
    ctx.font = `${H * 0.055}px Inter, sans-serif`;
    ctx.fillText(item, W * (0.35 + i * 0.15), H * 0.14);
  });

  /* Main area — code editor feel */
  const lineColors = [
    'rgba(232,130,12,0.7)',
    'rgba(255,255,255,0.45)',
    'rgba(74,222,128,0.6)',
    'rgba(255,255,255,0.35)',
    'rgba(46,91,255,0.7)',
    'rgba(255,255,255,0.4)',
    'rgba(232,130,12,0.5)',
  ];

  lineColors.forEach((c, i) => {
    const y = H * (0.28 + i * 0.1);
    const w = W * (0.3 + Math.sin(i * 1.2 + t * 0.008) * 0.25);
    const indent = i % 2 === 1 ? W * 0.1 : 0;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.roundRect(W * 0.1 + indent, y, w, H * 0.055, 3);
    ctx.fill();
  });

  /* Cursor blink */
  const cursorVisible = Math.sin(t * 0.08) > 0;
  if (cursorVisible) {
    ctx.fillStyle = 'rgba(232,130,12,0.9)';
    ctx.fillRect(W * 0.1 + W * 0.45, H * 0.91, 2, H * 0.06);
  }
}

function drawAITile(ctx, W, H, t) {
  drawChatApp(ctx, W, H, t);
}

function drawSaaSTile(ctx, W, H, t) {
  ctx.fillStyle = '#090c18';
  ctx.fillRect(0, 0, W, H);

  const phase = (t * 0.006) % 5; /* 5 phases: login, dashboard, settings, payment, success */
  const p = Math.floor(phase);

  /* Phase labels */
  const phaseNames = ['Login', 'Dashboard', 'Settings', 'Payment', 'Success'];
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(0, 0, W, H * 0.12);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = `${H * 0.045}px JetBrains Mono, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(phaseNames[p], W / 2, H * 0.082);
  ctx.textAlign = 'left';

  if (p === 0) {
    /* Login form */
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath();
    ctx.roundRect(W * 0.12, H * 0.2, W * 0.76, H * 0.65, 8);
    ctx.fill();

    ['Email', 'Password'].forEach((label, i) => {
      const y = H * (0.3 + i * 0.22);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = `${H * 0.038}px Inter, sans-serif`;
      ctx.fillText(label, W * 0.18, y);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.beginPath();
      ctx.roundRect(W * 0.16, y + H * 0.03, W * 0.64, H * 0.1, 5);
      ctx.fill();
    });

    ctx.fillStyle = 'rgba(46,91,255,0.8)';
    ctx.beginPath();
    ctx.roundRect(W * 0.16, H * 0.71, W * 0.64, H * 0.1, 20);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `${H * 0.042}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Sign In', W / 2, H * 0.78);
    ctx.textAlign = 'left';
  } else if (p === 3) {
    /* Payment modal */
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#14172a';
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(W * 0.08, H * 0.15, W * 0.84, H * 0.72, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(74,222,128,0.9)';
    ctx.font = `bold ${H * 0.05}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('₹489 / lifetime', W / 2, H * 0.35);

    ctx.fillStyle = 'rgba(74,222,128,0.8)';
    ctx.beginPath();
    ctx.roundRect(W * 0.2, H * 0.6, W * 0.6, H * 0.12, 20);
    ctx.fill();

    ctx.fillStyle = '#052E16';
    ctx.font = `bold ${H * 0.044}px Inter, sans-serif`;
    ctx.fillText('Pay via UPI', W / 2, H * 0.675);
    ctx.textAlign = 'left';
  } else if (p === 4) {
    /* Success */
    const pulseR = H * 0.14 + H * 0.02 * Math.sin(t * 0.08);
    ctx.fillStyle = 'rgba(74,222,128,0.1)';
    ctx.beginPath();
    ctx.arc(W / 2, H * 0.42, pulseR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(74,222,128,0.9)';
    ctx.font = `${H * 0.2}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('✓', W / 2, H * 0.52);

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `${H * 0.05}px DM Serif Display, Georgia, serif`;
    ctx.fillText('Payment Successful', W / 2, H * 0.72);
    ctx.textAlign = 'left';
  } else {
    drawDashboard(ctx, W, H, t);
  }
}

function drawLandingTile(ctx, W, H, t) {
  ctx.fillStyle = '#090c18';
  ctx.fillRect(0, 0, W, H);

  /* Animated gradient background */
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  const hue = (t * 0.05) % 360;
  bgGrad.addColorStop(0, `hsla(${220 + Math.sin(t * 0.01) * 20}, 70%, 8%, 1)`);
  bgGrad.addColorStop(1, `hsla(${30 + Math.sin(t * 0.008) * 15}, 80%, 5%, 1)`);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  /* Hero text animation */
  const textProgress = Math.min(1, (t % 120) / 40);

  /* Eyebrow */
  ctx.fillStyle = `rgba(232,130,12,${textProgress * 0.7})`;
  ctx.font = `${H * 0.04}px JetBrains Mono, monospace`;
  ctx.fillText('FULL-STACK DEVELOPER', W * 0.06, H * 0.22);

  /* Main headline */
  const headlineY = H * 0.38;
  const hProgress = Math.min(1, (t % 120 - 10) / 30);

  ctx.save();
  ctx.globalAlpha = Math.max(0, hProgress);
  ctx.fillStyle = 'rgba(233,229,220,0.95)';
  ctx.font = `bold ${H * 0.095}px DM Serif Display, Georgia, serif`;
  ctx.fillText('I build', W * 0.06, headlineY);
  ctx.fillStyle = 'rgba(232,130,12,0.95)';
  ctx.fillText('products.', W * 0.06, headlineY + H * 0.11);
  ctx.restore();

  /* CTA button */
  const ctaProgress = Math.min(1, (t % 120 - 20) / 20);
  if (ctaProgress > 0) {
    const pulse = 0.6 + 0.2 * Math.sin(t * 0.06);
    ctx.fillStyle = `rgba(37,211,102,${ctaProgress * pulse})`;
    ctx.beginPath();
    ctx.roundRect(W * 0.06, H * 0.64, W * 0.55, H * 0.12, 30);
    ctx.fill();

    ctx.fillStyle = `rgba(5,46,22,${ctaProgress})`;
    ctx.font = `${H * 0.045}px Inter, sans-serif`;
    ctx.fillText('Start your build →', W * 0.12, H * 0.714);
  }

  /* Abstract shape */
  ctx.save();
  ctx.globalAlpha = 0.15;
  const shapeGrad = ctx.createRadialGradient(W * 0.8, H * 0.3, 0, W * 0.8, H * 0.3, W * 0.35);
  shapeGrad.addColorStop(0, 'rgba(232,130,12,0.8)');
  shapeGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = shapeGrad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════════════
   SERVICE TILE CANVASES
   ═══════════════════════════════════════════════════════════════════ */
function initTileCanvases() {
  const tileDefs = [
    { id: 'tile-canvas-0', draw: drawWebAppTile },
    { id: 'tile-canvas-1', draw: drawMobileTile },
    { id: 'tile-canvas-2', draw: drawDesktopTile },
    { id: 'tile-canvas-3', draw: drawAITile },
    { id: 'tile-canvas-4', draw: drawSaaSTile },
    { id: 'tile-canvas-5', draw: drawLandingTile },
  ];

  const dpr = Math.min(window.devicePixelRatio, 2);

  tileDefs.forEach(def => {
    const wrap = document.getElementById(def.id);
    if (!wrap) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:100%;border-radius:10px;';
    wrap.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W = 300, H = 169, rafId = null;
    let t = Math.random() * 200;

    function setSize() {
      W = wrap.offsetWidth  || 300;
      H = wrap.offsetHeight || 169;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      /* Reset transform so scale never accumulates across resizes */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    setSize();

    function draw() {
      rafId = null;
      ctx.clearRect(0, 0, W, H);
      def.draw(ctx, W, H, t);
      t += 0.4;
      rafId = requestAnimationFrame(draw);
    }

    /* Only animate when the tile is in the viewport — saves ~360fps off-screen */
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        if (!rafId) draw();
      } else {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      }
    }, { rootMargin: '80px' });
    io.observe(wrap);

    new ResizeObserver(() => { setSize(); }).observe(wrap);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   PROJECT SCREEN PREVIEWS  (live canvas instead of "coming soon")
   ═══════════════════════════════════════════════════════════════════ */
function drawCATalystScreen(ctx, W, H, t) {
  /* ── CATalyst Fix Mode — laptop 16:10 ── */
  ctx.fillStyle = '#060810';
  ctx.fillRect(0, 0, W, H);

  const fs  = H / 220;
  const px  = W * 0.05;
  /* Phase: 0–5s → question visible, 5–9s → wrong answer revealed, 9–14s → insight */
  const phase = ((t * 0.38) % (14 * 24)) / 24;
  const revealed = phase >= 5;

  /* ── Subtle ambient glow ── */
  const amb = ctx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, H * 0.7);
  amb.addColorStop(0, 'rgba(220,38,38,0.07)');
  amb.addColorStop(1, 'transparent');
  ctx.fillStyle = amb;
  ctx.fillRect(0, 0, W, H);

  /* ── Header (0 → H*0.1) ── */
  const hgrd = ctx.createLinearGradient(0, 0, W, 0);
  hgrd.addColorStop(0, 'rgba(220,38,38,0.28)');
  hgrd.addColorStop(1, 'rgba(180,20,20,0.04)');
  ctx.fillStyle = hgrd;
  ctx.fillRect(0, 0, W, H * 0.1);

  /* FIX MODE label */
  ctx.fillStyle = 'rgba(248,113,113,0.95)';
  ctx.font = `bold ${fs * 10.5}px Inter, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText('FIX MODE', px, H * 0.05);

  /* Timer — top right */
  const timeLeft = Math.max(0, 90 - Math.floor(t * 0.012) % 90);
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  ctx.fillStyle = timeLeft < 20 ? 'rgba(248,113,113,0.8)' : 'rgba(255,255,255,0.22)';
  ctx.font = `${fs * 9}px JetBrains Mono, monospace`;
  ctx.textAlign = 'right';
  ctx.fillText(`${mm}:${ss}`, W - px, H * 0.036);
  ctx.textAlign = 'left';

  /* Session dots — top right */
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = i < 3 ? 'rgba(248,113,113,0.85)' : 'rgba(255,255,255,0.1)';
    ctx.beginPath();
    ctx.arc(W - px - (4 - i) * fs * 12, H * 0.073, fs * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.textBaseline = 'alphabetic';

  /* ── Tag row (H*0.1 → H*0.148) ── */
  const tagH = H * 0.04;
  const tagY  = H * 0.108;
  [
    { text: 'Quant · Permutations', bg: 'rgba(59,130,246,0.13)', color: 'rgba(147,197,253,0.82)' },
    { text: 'Concept Gap',          bg: 'rgba(232,130,12,0.13)', color: 'rgba(232,170,80,0.82)'  },
  ].reduce((x, tag) => {
    ctx.font = `${fs * 8.8}px JetBrains Mono, monospace`;
    const tw = ctx.measureText(tag.text).width;
    ctx.fillStyle = tag.bg;
    ctx.beginPath(); ctx.roundRect(x, tagY, tw + fs * 10, tagH, 3); ctx.fill();
    ctx.fillStyle = tag.color;
    ctx.fillText(tag.text, x + fs * 5, tagY + tagH * 0.68);
    return x + tw + fs * 16;
  }, px);

  /* ── Question card (H*0.155 → dynamic bottom) ── */
  const cardY = H * 0.155;
  const qFont = `${fs * 9.8}px Inter, sans-serif`;
  const qLineH = H * 0.04;
  const qLines = [
    'In how many ways can 3 boys and',
    '3 girls sit in a row such that no',
    'two girls are adjacent?',
  ];
  /* Calculate card height based on content */
  const qBlockH  = qLines.length * qLineH;
  const optH     = H * 0.058;
  const optGap   = H * 0.007;
  const optBlock = 4 * optH + 3 * optGap;
  const cardPad  = H * 0.022;
  const qNumH    = H * 0.032;
  const gapQOpts = H * 0.018;
  const cardH    = cardPad + qNumH + qBlockH + gapQOpts + optBlock + cardPad;

  ctx.fillStyle = revealed ? 'rgba(220,38,38,0.04)' : 'rgba(255,255,255,0.02)';
  ctx.strokeStyle = revealed ? 'rgba(248,113,113,0.18)' : 'rgba(255,255,255,0.055)';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.roundRect(px, cardY, W - px * 2, cardH, 7); ctx.fill(); ctx.stroke();

  /* Q number */
  let cy = cardY + cardPad;
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.font = `${fs * 8}px JetBrains Mono, monospace`;
  ctx.fillText('Q.07 · 3 marks', px + fs * 7, cy + qNumH * 0.8);
  cy += qNumH;

  /* Question text */
  ctx.fillStyle = 'rgba(233,229,220,0.82)';
  ctx.font = qFont;
  qLines.forEach(l => { ctx.fillText(l, px + fs * 7, cy + qLineH * 0.8); cy += qLineH; });
  cy += gapQOpts;

  /* Options */
  const opts = [
    { lbl: 'A', txt: '36'  },
    { lbl: 'B', txt: '72',  correct: true },
    { lbl: 'C', txt: '144', wrong: true },
    { lbl: 'D', txt: '120' },
  ];
  opts.forEach(o => {
    const selected = o.wrong && phase >= 4;
    let bg = 'rgba(255,255,255,0.02)', border = 'rgba(255,255,255,0.05)', tc = 'rgba(233,229,220,0.48)';
    if (selected)            { bg = 'rgba(220,38,38,0.13)';  border = 'rgba(248,113,113,0.38)'; tc = 'rgba(248,113,113,0.88)'; }
    if (revealed && o.correct){ bg = 'rgba(34,197,94,0.08)'; border = 'rgba(74,222,128,0.38)';  tc = 'rgba(74,222,128,0.88)'; }

    ctx.fillStyle = bg; ctx.strokeStyle = border; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.roundRect(px + fs * 4, cy, W - px * 2 - fs * 8, optH, 5); ctx.fill(); ctx.stroke();

    /* Circle label */
    const cx2 = px + fs * 18, cy2 = cy + optH / 2;
    ctx.fillStyle = selected ? 'rgba(248,113,113,0.8)' : (revealed && o.correct ? 'rgba(74,222,128,0.8)' : 'rgba(255,255,255,0.09)');
    ctx.beginPath(); ctx.arc(cx2, cy2, fs * 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = (selected || (revealed && o.correct)) ? '#060810' : 'rgba(255,255,255,0.35)';
    ctx.font = `bold ${fs * 8.5}px Inter, sans-serif`;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText(o.lbl, cx2, cy2);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';

    /* Answer text */
    ctx.fillStyle = tc;
    ctx.font = `${fs * 9.8}px Inter, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.fillText(o.txt, px + fs * 30, cy + optH / 2);

    /* ✓ / ✗ */
    if (revealed && (o.correct || o.wrong)) {
      ctx.fillStyle = o.correct ? 'rgba(74,222,128,0.88)' : 'rgba(248,113,113,0.78)';
      ctx.font = `bold ${fs * 10}px sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(o.correct ? '✓' : '✗', W - px - fs * 10, cy + optH / 2);
      ctx.textAlign = 'left';
    }
    ctx.textBaseline = 'alphabetic';
    cy += optH + optGap;
  });
  cy += cardPad;

  /* ── Action bar (directly below card, H*0.07 tall) ── */
  const abY = cy + H * 0.014;
  const abH = H * 0.072;
  const pulse = 0.78 + 0.22 * Math.sin(t * 0.09);
  const halfW = (W - px * 2 - fs * 6) / 2;

  ctx.fillStyle = `rgba(220,38,38,${pulse * 0.92})`;
  ctx.beginPath(); ctx.roundRect(px, abY, halfW, abH, abH / 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = `bold ${fs * 9}px Inter, sans-serif`;
  ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  ctx.fillText('−1 mark · Fix this now', px + halfW / 2, abY + abH / 2);

  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.roundRect(px + halfW + fs * 6, abY, halfW, abH, abH / 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = `${fs * 9}px Inter, sans-serif`;
  ctx.fillText('Next question →', px + halfW * 1.5 + fs * 6, abY + abH / 2);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';

  /* ── Insight strip — ALWAYS visible, fades in ── */
  const iy = abY + abH + H * 0.018;
  const insightAlpha = phase >= 9 ? Math.min(1, (phase - 9) / 2) : 0.3;
  ctx.globalAlpha = insightAlpha;

  ctx.fillStyle = 'rgba(255,255,255,0.015)';
  ctx.fillRect(0, iy, W, H - iy);

  /* Top label row */
  ctx.fillStyle = 'rgba(248,113,113,0.72)';
  ctx.font = `bold ${fs * 8.5}px JetBrains Mono, monospace`;
  ctx.fillText('Error pattern: 3× this week', px, iy + H * 0.042);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.font = `${fs * 7.8}px JetBrains Mono, monospace`;
  ctx.textAlign = 'right';
  ctx.fillText('Permutations', W - px, iy + H * 0.042);
  ctx.textAlign = 'left';

  /* Bar chart */
  const bars = [0.45, 0.72, 0.38, 0.85, 0.55, 0.9, 0.6];
  const chartH  = H - iy - H * 0.08;
  const chartY  = iy + H * 0.06;
  const bW      = (W - px * 2) / bars.length - fs * 3;
  bars.forEach((bh, i) => {
    const bx  = px + i * ((W - px * 2) / bars.length);
    const bHH = chartH * bh;
    const by  = chartY + chartH - bHH;
    ctx.fillStyle = `rgba(248,113,113,${0.22 + 0.5 * bh})`;
    ctx.beginPath(); ctx.roundRect(bx, by, bW, bHH, [2, 2, 0, 0]); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.font = `${fs * 7}px JetBrains Mono, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(['M','T','W','T','F','S','S'][i], bx + bW / 2, chartY + chartH + H * 0.032);
  });
  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

function drawGharKhataScreen(ctx, W, H, t) {
  /* ── GharKhata — shared expense tracker, phone 9:19.5 ── */
  ctx.fillStyle = '#040d07';
  ctx.fillRect(0, 0, W, H);

  const fs = H / 420;
  const px = W * 0.06;
  const tabH = H * 0.085;
  const safe = H - tabH; /* usable height above tab bar */

  /* Ambient green glow */
  const amb = ctx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, H * 0.55);
  amb.addColorStop(0, 'rgba(0,200,83,0.12)');
  amb.addColorStop(1, 'transparent');
  ctx.fillStyle = amb;
  ctx.fillRect(0, 0, W, H);

  /* ── Status bar ── */
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.font = `${fs * 9}px JetBrains Mono, monospace`;
  ctx.fillText('9:41', px, H * 0.026);
  const syncPulse = 0.5 + 0.5 * Math.abs(Math.sin(t * 0.055));
  ctx.fillStyle = `rgba(0,200,83,${syncPulse * 0.7})`;
  ctx.font = `${fs * 8.5}px JetBrains Mono, monospace`;
  ctx.textAlign = 'right';
  ctx.fillText('⟳ synced', W - px, H * 0.026);
  ctx.textAlign = 'left';

  /* ── Header (H*0.04 → H*0.13) ── */
  ctx.fillStyle = 'rgba(0,200,83,0.92)';
  ctx.font = `bold ${fs * 17}px Inter, sans-serif`;
  ctx.fillText('GharKhata', px, H * 0.088);

  /* Avatars */
  ['#e8820c', '#2E5BFF'].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(W - px - (1 - i) * fs * 22, H * 0.08, fs * 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${fs * 9}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(i === 0 ? 'S' : 'P', W - px - (1 - i) * fs * 22, H * 0.08);
    ctx.textAlign = 'left';
  });

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.font = `${fs * 8.5}px JetBrains Mono, monospace`;
  ctx.fillText('June 2026', px, H * 0.117);

  /* ── Balance card (H*0.135 → H*0.355) ── */
  const cY = H * 0.135, cH = H * 0.22;
  const cg = ctx.createLinearGradient(0, cY, 0, cY + cH);
  cg.addColorStop(0, 'rgba(0,200,83,0.22)');
  cg.addColorStop(1, 'rgba(0,200,83,0.03)');
  ctx.fillStyle = cg;
  ctx.strokeStyle = 'rgba(0,200,83,0.2)';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.roundRect(px, cY, W - px * 2, cH, 10); ctx.fill(); ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.font = `${fs * 9}px JetBrains Mono, monospace`;
  ctx.fillText('Net Balance', px + fs * 7, cY + cH * 0.22);

  const balAnim = Math.floor(12449 + 12 * Math.sin(t * 0.018));
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  ctx.font = `bold ${fs * 21}px Inter, sans-serif`;
  ctx.fillText(`₹${balAnim.toLocaleString('en-IN')}`, px + fs * 7, cY + cH * 0.55);

  /* Income / Spent chips */
  const chipW = (W - px * 2 - fs * 6) / 2;
  [
    { label: '↑ Income', val: '₹18,000', color: 'rgba(0,200,83,0.82)' },
    { label: '↓ Spent',  val: '₹5,551',  color: 'rgba(248,113,113,0.72)' },
  ].forEach((chip, i) => {
    const cx2 = px + fs * 7 + (chipW + fs * 6) * i;
    ctx.fillStyle = chip.color;
    ctx.font = `${fs * 8.5}px JetBrains Mono, monospace`;
    ctx.fillText(chip.label, cx2, cY + cH * 0.73);
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.font = `bold ${fs * 10}px JetBrains Mono, monospace`;
    ctx.fillText(chip.val, cx2, cY + cH * 0.92);
  });

  /* ── Budget bar (H*0.365 → H*0.41) ── */
  const bpY = cY + cH + H * 0.018;
  ctx.fillStyle = 'rgba(255,255,255,0.055)';
  ctx.beginPath(); ctx.roundRect(px, bpY, W - px * 2, H * 0.024, 6); ctx.fill();
  const prog = 5551 / 12000;
  const bg2 = ctx.createLinearGradient(px, 0, px + (W - px * 2) * prog, 0);
  bg2.addColorStop(0, 'rgba(0,200,83,0.85)');
  bg2.addColorStop(1, 'rgba(232,130,12,0.72)');
  ctx.fillStyle = bg2;
  ctx.beginPath(); ctx.roundRect(px, bpY, (W - px * 2) * prog, H * 0.024, 6); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = `${fs * 7.8}px JetBrains Mono, monospace`;
  ctx.fillText('₹5,551 of ₹12,000 budget', px, bpY + H * 0.044);

  /* ── Transactions (3 rows, fits above tab bar) ── */
  const txLabelY = bpY + H * 0.066;
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.font = `bold ${fs * 8.5}px Inter, sans-serif`;
  ctx.fillText('RECENT', px, txLabelY);

  /* Compute available space: safe - txLabelY - gap */
  const txAreaTop = txLabelY + H * 0.025;
  const txAreaH   = safe - txAreaTop - H * 0.01;
  const txCount   = 3;
  const rowH      = txAreaH / txCount - H * 0.008;

  const tx = [
    { who: 'S', name: 'Zomato Dinner',  amt: '-₹560',  c: '#e8820c' },
    { who: 'P', name: 'Grocery store',  amt: '-₹840',  c: '#2E5BFF' },
    { who: 'S', name: 'Petrol',         amt: '-₹320',  c: '#e8820c' },
  ];
  const newRow = Math.floor((t * 0.004) % txCount);

  tx.forEach((e, i) => {
    const ry = txAreaTop + i * (rowH + H * 0.008);
    const isNew = i === newRow;
    ctx.globalAlpha = isNew ? 1 : 0.78;
    ctx.fillStyle = isNew ? 'rgba(0,200,83,0.07)' : 'rgba(255,255,255,0.025)';
    ctx.strokeStyle = isNew ? 'rgba(0,200,83,0.18)' : 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.roundRect(px, ry, W - px * 2, rowH, 7); ctx.fill(); ctx.stroke();

    /* Avatar */
    ctx.fillStyle = e.c;
    ctx.beginPath(); ctx.arc(px + rowH * 0.42, ry + rowH / 2, rowH * 0.33, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${fs * 9}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(e.who, px + rowH * 0.42, ry + rowH / 2);
    ctx.textAlign = 'left';

    /* Name */
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = `${fs * 9.8}px Inter, sans-serif`;
    ctx.fillText(e.name, px + rowH * 0.88, ry + rowH * 0.42);

    /* Amount */
    ctx.fillStyle = 'rgba(248,113,113,0.78)';
    ctx.font = `bold ${fs * 9.8}px JetBrains Mono, monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(e.amt, W - px, ry + rowH * 0.42);
    if (isNew) {
      ctx.fillStyle = 'rgba(0,200,83,0.72)';
      ctx.font = `${fs * 7.5}px JetBrains Mono, monospace`;
      ctx.fillText('NEW', W - px, ry + rowH * 0.72);
    }
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  });

  /* ── Tab bar ── */
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(4,13,7,0.97)';
  ctx.fillRect(0, safe, W, tabH);
  ctx.strokeStyle = 'rgba(0,200,83,0.08)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(0, safe); ctx.lineTo(W, safe); ctx.stroke();

  ctx.textBaseline = 'middle';
  ['Home', 'Split', '+', 'Stats'].forEach((lbl, i) => {
    const tx2 = W * (0.125 + i * 0.25);
    if (lbl === '+') {
      ctx.fillStyle = 'rgba(0,200,83,0.9)';
      ctx.beginPath(); ctx.arc(tx2, safe + tabH / 2, fs * 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${fs * 15}px Inter, sans-serif`;
    } else {
      ctx.fillStyle = i === 0 ? 'rgba(0,200,83,0.88)' : 'rgba(255,255,255,0.22)';
      ctx.font = `${fs * 8.5}px Inter, sans-serif`;
    }
    ctx.textAlign = 'center';
    ctx.fillText(lbl, tx2, safe + tabH / 2);
  });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawPitchReadyScreen(ctx, W, H, t) {
  /* ── PitchReady — cricket tracker, phone 9:19.5 ── */
  ctx.fillStyle = '#05060e';
  ctx.fillRect(0, 0, W, H);

  const fs  = H / 420;
  const px  = W * 0.06;
  const acc = '#FF8F00';
  const tabH = H * 0.085;
  const safe  = H - tabH;

  /* Ambient warm glow top */
  const amb = ctx.createRadialGradient(W * 0.5, 0, 0, W * 0.5, 0, H * 0.5);
  amb.addColorStop(0, 'rgba(255,143,0,0.1)');
  amb.addColorStop(1, 'transparent');
  ctx.fillStyle = amb;
  ctx.fillRect(0, 0, W, H);

  /* ── Status bar ── */
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.font = `${fs * 9}px JetBrains Mono, monospace`;
  ctx.fillText('9:41', px, H * 0.026);
  ctx.fillStyle = `rgba(255,143,0,0.5)`;
  ctx.textAlign = 'right';
  ctx.fillText('PitchReady', W - px, H * 0.026);
  ctx.textAlign = 'left';

  /* ── Header ── */
  ctx.fillStyle = acc;
  ctx.font = `bold ${fs * 16.5}px Inter, sans-serif`;
  ctx.fillText('Dashboard', px, H * 0.085);
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.font = `${fs * 9}px Inter, sans-serif`;
  ctx.fillText('Sahil · All formats', px, H * 0.115);

  /* ── Form ring + stat pills side by side ── */
  /* Ring: right side, W*0.52 to W*0.96 */
  const ringCX = W * 0.74, ringCY = H * 0.215, ringR = fs * 29;

  /* Track */
  ctx.strokeStyle = 'rgba(255,143,0,0.1)';
  ctx.lineWidth = fs * 5.5;
  ctx.beginPath(); ctx.arc(ringCX, ringCY, ringR, 0, Math.PI * 2); ctx.stroke();
  /* Progress */
  ctx.strokeStyle = acc;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(ringCX, ringCY, ringR, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.74); ctx.stroke();
  ctx.lineCap = 'butt';
  /* Labels */
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.font = `bold ${fs * 13.5}px JetBrains Mono, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('74%', ringCX, ringCY + fs * 4.5);
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.font = `${fs * 8}px Inter, sans-serif`;
  ctx.fillText('Form', ringCX, ringCY + fs * 15);
  ctx.textAlign = 'left';

  /* Stat pills: left side, stacked */
  const statY0 = H * 0.145;
  const statH  = H * 0.058;
  const statW  = W * 0.45;
  [
    { label: 'Avg',  val: '38.4',  color: acc },
    { label: 'SR',   val: '142',   color: 'rgba(74,222,128,0.88)' },
    { label: 'Runs', val: '1,247', color: 'rgba(255,255,255,0.72)' },
  ].forEach((s, i) => {
    const sy = statY0 + i * (statH + H * 0.01);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.roundRect(px, sy, statW, statH, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = `${fs * 8.5}px Inter, sans-serif`;
    ctx.fillText(s.label, px + fs * 7, sy + statH / 2);
    ctx.fillStyle = s.color;
    ctx.font = `bold ${fs * 11.5}px JetBrains Mono, monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(s.val, px + statW - fs * 7, sy + statH / 2);
    ctx.textAlign = 'left';
  });

  /* ── Last 5 innings bar chart ── */
  const inY = H * 0.32;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.font = `bold ${fs * 8.5}px Inter, sans-serif`;
  ctx.fillText('LAST 5 INNINGS', px, inY);

  const scores = [72, 34, 91, 18, 54];
  const isOut  = [true, false, true, true, false];
  const maxSc  = 100;
  const chartH = H * 0.13;
  const barAreaW2 = W - px * 2;
  const bW2   = barAreaW2 / scores.length - fs * 5;

  scores.forEach((r, i) => {
    const bx = px + i * (barAreaW2 / scores.length);
    const bH2 = (r / maxSc) * chartH;
    const by2 = inY + H * 0.015 + chartH - bH2;
    const col = isOut[i] ? 'rgba(255,143,0,' : 'rgba(74,222,128,';
    const bg3 = ctx.createLinearGradient(0, by2, 0, by2 + bH2);
    bg3.addColorStop(0, col + '0.88)'); bg3.addColorStop(1, col + '0.18)');
    ctx.fillStyle = bg3;
    ctx.beginPath(); ctx.roundRect(bx, by2, bW2, bH2, [3, 3, 0, 0]); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = `bold ${fs * 8}px JetBrains Mono, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(r + (!isOut[i] ? '*' : ''), bx + bW2 / 2, inY + H * 0.018 + chartH + H * 0.028);
  });
  ctx.textAlign = 'left';

  /* ── Training modules (fills remaining space) ── */
  const modTopY = inY + H * 0.018 + chartH + H * 0.055;
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.font = `bold ${fs * 8.5}px Inter, sans-serif`;
  ctx.fillText("TODAY'S TRAINING", px, modTopY);

  const modules = [
    { name: 'Batting drills', done: true,  pct: 100 },
    { name: 'Fitness',        done: false, pct: Math.floor(60 + 15 * Math.sin(t * 0.012)) },
    { name: 'Video analysis', done: false, pct: 0 },
  ];
  const modH   = (safe - modTopY - H * 0.025 - H * 0.03) / modules.length - H * 0.01;
  modules.forEach((m, i) => {
    const my = modTopY + H * 0.028 + i * (modH + H * 0.01);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.strokeStyle = 'rgba(255,255,255,0.045)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.roundRect(px, my, W - px * 2, modH, 5); ctx.fill(); ctx.stroke();

    if (m.pct > 0) {
      ctx.fillStyle = m.done ? 'rgba(74,222,128,0.15)' : 'rgba(255,143,0,0.1)';
      ctx.beginPath(); ctx.roundRect(px, my, (W - px * 2) * (m.pct / 100), modH, 5); ctx.fill();
    }
    ctx.fillStyle = m.done ? 'rgba(74,222,128,0.82)' : 'rgba(255,255,255,0.55)';
    ctx.font = `${fs * 9.5}px Inter, sans-serif`;
    ctx.fillText(m.name, px + fs * 8, my + modH / 2);
    ctx.fillStyle = m.done ? 'rgba(74,222,128,0.72)' : `rgba(255,143,0,0.68)`;
    ctx.font = `bold ${fs * 9}px JetBrains Mono, monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(m.done ? '✓ Done' : `${m.pct}%`, W - px - fs * 5, my + modH / 2);
    ctx.textAlign = 'left';
  });

  /* ── Tab bar ── */
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = 'rgba(5,6,14,0.97)';
  ctx.fillRect(0, safe, W, tabH);
  ctx.strokeStyle = 'rgba(255,143,0,0.08)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(0, safe); ctx.lineTo(W, safe); ctx.stroke();
  ctx.textBaseline = 'middle';
  ['Home', 'Stats', 'Train', 'Mind'].forEach((lbl, i) => {
    ctx.fillStyle = i === 0 ? `rgba(255,143,0,0.9)` : 'rgba(255,255,255,0.2)';
    ctx.font = `${fs * 8.5}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(lbl, W * (0.125 + i * 0.25), safe + tabH / 2);
  });
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
}

function drawPostroomScreen(ctx, W, H, t) {
  /* ── Postroom Studio — design tool, laptop 16:10 ── */
  ctx.fillStyle = '#050710';
  ctx.fillRect(0, 0, W, H);

  const fs  = H / 220;
  const tbH = H * 0.1;   /* toolbar height */
  const sw  = W * 0.18;  /* left layers panel */
  const rw  = W * 0.19;  /* right properties panel */
  const cw  = W - sw - rw;

  const selLayer = Math.floor((t * 0.005) % 5);

  /* ── Toolbar ── */
  ctx.fillStyle = '#080a17';
  ctx.fillRect(0, 0, W, tbH);
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(0, tbH); ctx.lineTo(W, tbH); ctx.stroke();

  /* Logo */
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(232,130,12,0.92)';
  ctx.font = `bold ${fs * 10.5}px Inter, sans-serif`;
  ctx.fillText('Postroom', fs * 9, tbH / 2);

  /* Menu: spaced evenly in centre */
  const menuItems = ['File', 'Edit', 'View', 'Insert'];
  const menuStartX = sw + fs * 8;
  const menuSpacing = cw * 0.16;
  menuItems.forEach((item, i) => {
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.font = `${fs * 9}px Inter, sans-serif`;
    ctx.fillText(item, menuStartX + i * menuSpacing, tbH / 2);
  });

  /* Zoom pill */
  const zoomX = W - rw - fs * 68;
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.beginPath(); ctx.roundRect(zoomX, tbH * 0.2, fs * 22, tbH * 0.6, 3); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = `${fs * 8.5}px JetBrains Mono, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('100%', zoomX + fs * 11, tbH / 2);
  ctx.textAlign = 'left';

  /* Publish button */
  const pubX = W - rw - fs * 44;
  ctx.fillStyle = 'rgba(74,222,128,0.88)';
  ctx.beginPath(); ctx.roundRect(pubX, tbH * 0.18, fs * 38, tbH * 0.64, 4); ctx.fill();
  ctx.fillStyle = 'rgba(5,46,22,0.9)';
  ctx.font = `bold ${fs * 9}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('↑ Publish', pubX + fs * 19, tbH / 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  /* ── Left layers panel ── */
  ctx.fillStyle = '#080a15';
  ctx.fillRect(0, tbH, sw, H - tbH);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(sw, tbH); ctx.lineTo(sw, H); ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.font = `bold ${fs * 8}px Inter, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText('LAYERS', fs * 8, tbH + H * 0.048);

  const layers = [
    { name: 'Headline',   icon: 'T' },
    { name: 'Sub-copy',   icon: 'T' },
    { name: 'CTA button', icon: '□' },
    { name: 'Hero image', icon: '▦' },
    { name: 'Nav bar',    icon: '≡' },
  ];
  const layerH = (H - tbH - H * 0.08) / layers.length;
  layers.forEach((l, i) => {
    const ly = tbH + H * 0.08 + i * layerH + layerH / 2;
    const isSel = i === selLayer;
    if (isSel) {
      ctx.fillStyle = 'rgba(232,130,12,0.1)';
      ctx.fillRect(0, ly - layerH / 2, sw, layerH);
    }
    /* Icon box */
    ctx.fillStyle = isSel ? 'rgba(232,130,12,0.85)' : 'rgba(255,255,255,0.07)';
    ctx.beginPath(); ctx.roundRect(fs * 6, ly - fs * 5.5, fs * 11, fs * 11, 2); ctx.fill();
    ctx.fillStyle = isSel ? '#fff' : 'rgba(255,255,255,0.22)';
    ctx.font = `${fs * 8}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(l.icon, fs * 11.5, ly);
    ctx.textAlign = 'left';
    /* Name */
    ctx.fillStyle = isSel ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.3)';
    ctx.font = `${fs * 9}px Inter, sans-serif`;
    ctx.fillText(l.name, fs * 22, ly);
  });

  /* ── Centre canvas area ── */
  ctx.fillStyle = '#06081a';
  ctx.fillRect(sw, tbH, cw, H - tbH);

  /* Dot grid */
  const gsp = Math.max(fs * 16, 8);
  ctx.fillStyle = 'rgba(255,255,255,0.032)';
  for (let gx = sw; gx < sw + cw; gx += gsp)
    for (let gy = tbH; gy < H; gy += gsp) {
      ctx.beginPath(); ctx.arc(gx, gy, 0.7, 0, Math.PI * 2); ctx.fill();
    }

  /* Page preview */
  const pgX = sw + cw * 0.06, pgY = tbH + H * 0.04;
  const pgW = cw * 0.88, pgH = H * 0.88;

  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur  = fs * 16;
  ctx.fillStyle   = '#090b1a';
  ctx.beginPath(); ctx.roundRect(pgX, pgY, pgW, pgH, 5); ctx.fill();
  ctx.shadowBlur  = 0;

  /* Browser chrome */
  ctx.fillStyle = '#0c0e20';
  ctx.fillRect(pgX, pgY, pgW, pgH * 0.055);
  [[0.1,'#ff5f57'],[0.17,'#ffbd2e'],[0.24,'#28ca42']].forEach(([fx, c]) => {
    ctx.fillStyle = c;
    ctx.beginPath(); ctx.arc(pgX + pgW * fx, pgY + pgH * 0.027, fs * 3, 0, Math.PI * 2); ctx.fill();
  });
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.beginPath(); ctx.roundRect(pgX + pgW * 0.32, pgY + pgH * 0.01, pgW * 0.36, pgH * 0.034, 10); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = `${fs * 7.5}px JetBrains Mono, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('postroom.studio', pgX + pgW * 0.5, pgY + pgH * 0.035);
  ctx.textAlign = 'left';

  /* Page body */
  const pcY = pgY + pgH * 0.06;

  /* Fake nav in page */
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  ctx.fillRect(pgX, pcY, pgW, pgH * 0.07);
  ctx.fillStyle = 'rgba(232,220,192,0.55)';
  ctx.font = `bold ${fs * 8.5}px Inter, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText('Postroom', pgX + pgW * 0.05, pcY + pgH * 0.035);
  ['Work','About','Contact'].forEach((lbl, i) => {
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.font = `${fs * 8}px Inter, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(lbl, pgX + pgW * (0.68 + i * 0.12), pcY + pgH * 0.035);
  });
  ctx.textAlign = 'left';

  /* Hero headline */
  const hlY = pcY + pgH * 0.1;
  ctx.fillStyle = 'rgba(232,220,192,0.88)';
  ctx.font = `bold ${fs * 18}px DM Serif Display, Georgia, serif`;
  ctx.fillText('Visual stories', pgX + pgW * 0.06, hlY);
  ctx.fillStyle = 'rgba(232,130,12,0.85)';
  ctx.fillText('that move.', pgX + pgW * 0.06, hlY + fs * 20);

  /* Cursor blink */
  if (Math.sin(t * 0.1) > 0) {
    ctx.font = `bold ${fs * 18}px DM Serif Display, Georgia, serif`;
    const tw = ctx.measureText('that move.').width;
    ctx.fillStyle = 'rgba(232,130,12,0.88)';
    ctx.fillRect(pgX + pgW * 0.06 + tw + 2, hlY + fs * 3, 2, fs * 16);
  }

  /* Sub-copy placeholder lines */
  [0, 1].forEach(i => {
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath();
    ctx.roundRect(pgX + pgW * 0.06, hlY + fs * 30 + i * fs * 11, pgW * (0.42 - i * 0.07), fs * 7, 2);
    ctx.fill();
  });

  /* CTA */
  const ctaY = hlY + fs * 54;
  const ctaG = ctx.createLinearGradient(pgX + pgW * 0.06, 0, pgX + pgW * 0.3, 0);
  ctaG.addColorStop(0, 'rgba(232,220,192,0.92)');
  ctaG.addColorStop(1, 'rgba(232,130,12,0.82)');
  ctx.fillStyle = ctaG;
  ctx.beginPath(); ctx.roundRect(pgX + pgW * 0.06, ctaY, pgW * 0.22, fs * 15, 20); ctx.fill();
  ctx.fillStyle = '#050810';
  ctx.font = `bold ${fs * 7.8}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('See our work →', pgX + pgW * 0.06 + pgW * 0.11, ctaY + fs * 8);
  ctx.textAlign = 'left';

  /* Blue selection border around headline block */
  const selX = pgX + pgW * 0.04, selY2 = hlY - fs * 3;
  const selW2 = pgW * 0.58, selH2 = fs * 46;
  ctx.strokeStyle = '#2E5BFF';
  ctx.lineWidth = 1;
  ctx.strokeRect(selX, selY2, selW2, selH2);
  [[0,0],[0.5,0],[1,0],[0,0.5],[1,0.5],[0,1],[0.5,1],[1,1]].forEach(([hx, hy]) => {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#2E5BFF'; ctx.lineWidth = 0.8;
    ctx.fillRect(selX + selW2 * hx - fs * 2.5, selY2 + selH2 * hy - fs * 2.5, fs * 5, fs * 5);
    ctx.strokeRect(selX + selW2 * hx - fs * 2.5, selY2 + selH2 * hy - fs * 2.5, fs * 5, fs * 5);
  });

  /* ── Right properties panel ── */
  ctx.fillStyle = '#080a15';
  ctx.fillRect(W - rw, tbH, rw, H - tbH);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(W - rw, tbH); ctx.lineTo(W - rw, H); ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.font = `bold ${fs * 8}px Inter, sans-serif`;
  ctx.fillText('STYLE', W - rw + fs * 8, tbH + H * 0.048);
  ctx.fillStyle = 'rgba(232,130,12,0.78)';
  ctx.font = `${fs * 8}px JetBrains Mono, monospace`;
  ctx.fillText('Headline', W - rw + fs * 8, tbH + H * 0.082);

  const props = [
    { label: 'Font',   val: 'DM Serif' },
    { label: 'Size',   val: '52px' },
    { label: 'Weight', val: '700' },
    { label: 'Color',  val: '#E8DCC0' },
    { label: 'Align',  val: 'Left ↓' },
    { label: 'Line H', val: '1.08' },
  ];
  const propH = (H - tbH - H * 0.12) / props.length;
  props.forEach((p, i) => {
    const py = tbH + H * 0.12 + i * propH + propH / 2;
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.font = `${fs * 8}px Inter, sans-serif`;
    ctx.fillText(p.label, W - rw + fs * 8, py - propH * 0.12);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath(); ctx.roundRect(W - rw + fs * 8, py - fs * 1.5, rw - fs * 16, fs * 11, 3); ctx.fill();
    ctx.fillStyle = 'rgba(232,130,12,0.72)';
    ctx.font = `${fs * 7.8}px JetBrains Mono, monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(p.val, W - fs * 10, py + fs * 5.5);
    ctx.textAlign = 'left';
  });
  ctx.textBaseline = 'alphabetic';
}

function initProjectPreviews() {
  const configs = [
    { id: 'preview-hero-laptop', draw: drawCATalystScreen },
    { id: 'preview-hero-phone',  draw: drawGharKhataScreen },
    { id: 'preview-catalyst',    draw: drawCATalystScreen },
    { id: 'preview-gharkhata',   draw: drawGharKhataScreen },
    { id: 'preview-pitchready',  draw: drawPitchReadyScreen },
    { id: 'preview-postroom',    draw: drawPostroomScreen },
  ];

  const dpr = Math.min(window.devicePixelRatio, 2);

  /* Defer canvas setup until Google Fonts are loaded — canvas text needs them */
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => {

  configs.forEach(cfg => {
    const wrap = document.getElementById(cfg.id);
    if (!wrap) return;

    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:100%;position:absolute;inset:0;';
    wrap.style.position = 'relative';
    wrap.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let W = 300, H = 200, rafId = null, t = Math.random() * 100;

    function setSize() {
      W = wrap.offsetWidth  || 300;
      H = wrap.offsetHeight || 200;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    setSize();

    function draw() {
      rafId = null;
      ctx.clearRect(0, 0, W, H);
      cfg.draw(ctx, W, H, t);
      t += 0.4;
      rafId = requestAnimationFrame(draw);
    }

    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { if (!rafId) draw(); }
      else { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }
    }, { rootMargin: '100px' });
    io.observe(wrap);

    new ResizeObserver(() => setSize()).observe(wrap);
  });

  }); /* end document.fonts.ready */
}

/* ═══════════════════════════════════════════════════════════════════
   TECH LOGO GRID  (SVG inline logos with brand glow)
   ═══════════════════════════════════════════════════════════════════ */
const TECH_LOGOS = [
  {
    name: 'Supabase',
    glow: 'rgba(62,207,142,0.7)',
    svg: `<svg viewBox="0 0 24 24" fill="none"><path d="M11.9 1.036c-.015-.986-1.26-1.41-1.874-.637L.764 12.05C.09 12.888.648 14.114 1.662 14.114h7.718l-.36 8.85c.015.986 1.26 1.41 1.874.637l9.262-11.653c.673-.838.115-2.064-.899-2.064h-7.72l.362-8.848z" fill="#3ECF8E"/></svg>`,
  },
  {
    name: 'React',
    glow: 'rgba(97,218,251,0.7)',
    svg: `<svg viewBox="0 0 24 24" fill="#61DAFB"><circle cx="12" cy="11.955" r="2.05"/><path d="M12 6.527c-4.418 0-8 2.014-8 4.5s3.582 4.5 8 4.5 8-2.014 8-4.5-3.582-4.5-8-4.5zm0 7.5c-3.59 0-6.5-1.343-6.5-3s2.91-3 6.5-3 6.5 1.343 6.5 3-2.91 3-6.5 3zM5.5 6.527C3.757 4.784 1.5 4.09 1.5 5.584c0 .886.697 1.886 1.866 2.75.297.218.624.426.977.619A13.64 13.64 0 014.5 11.5c-.55.856-.804 1.688-.804 2.39 0 1.493 2.257 2.187 4 .44M18.5 6.527c1.743-1.743 4-2.437 4-.943 0 .886-.697 1.886-1.866 2.75a13.15 13.15 0 01-.977.619c.218.624.343 1.273.343 1.946.55.856.804 1.688.804 2.39 0 1.493-2.257 2.187-4 .44"/></svg>`,
  },
  {
    name: 'Next.js',
    glow: 'rgba(255,255,255,0.5)',
    svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 01-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 00-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 00-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 01-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 01-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 01.174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 004.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 002.466-2.163 11.944 11.944 0 002.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 00-2.499-.523A33.119 33.119 0 0011.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 01.237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 01.233-.296c.096-.05.13-.054.499-.054z"/></svg>`,
  },
  {
    name: 'TypeScript',
    glow: 'rgba(49,120,198,0.8)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="2" fill="#3178C6"/><path d="M13.76 12.77h2.27v-.86h-5.6v.86h2.26V19h1.07v-6.23zM18.5 13.8c-.6-.3-1.06-.44-1.64-.44-.73 0-1.23.36-1.23.84 0 .42.26.66 1.1 1.01l.4.16c1.3.55 1.93 1.14 1.93 2.15 0 1.23-.93 2.02-2.51 2.02-.77 0-1.5-.18-2.1-.52v-.98c.64.42 1.33.65 2.07.65.8 0 1.31-.37 1.31-.94 0-.5-.28-.77-1.15-1.13l-.4-.17c-1.23-.52-1.87-1.1-1.87-2.08 0-1.12.9-1.86 2.3-1.86.6 0 1.17.14 1.79.44v.85z" fill="white"/></svg>`,
  },
  {
    name: 'Vercel',
    glow: 'rgba(255,255,255,0.5)',
    svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M24 22.525H0l12-21.05 12 21.05z"/></svg>`,
  },
  {
    name: 'Vite',
    glow: 'rgba(100,108,255,0.7)',
    svg: `<svg viewBox="0 0 32 32"><defs><linearGradient id="va" x1="6" y1="-.2" x2="23.5" y2="30.9" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#41d1ff"/><stop offset="1" stop-color="#bd34fe"/></linearGradient><linearGradient id="vb" x1="9.6" y1="5" x2="17" y2="25.3" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff3e00"/><stop offset="1" stop-color="#ffa800"/></linearGradient></defs><path d="M29.9 6.7L16.5 30.3a.7.7 0 01-1.2 0L1.9 6.7a.7.7 0 01.7-1.1L16 7.9l13.4-2.3a.7.7 0 01.6 1.1z" fill="url(#va)"/><path d="M22.1 4.6L16 15.2 9.9 4.6a.3.3 0 01.4-.5l5.7 1.5L21.7 4a.3.3 0 01.4.5z" fill="url(#vb)"/></svg>`,
  },
  {
    name: 'Tailwind',
    glow: 'rgba(56,189,248,0.7)',
    svg: `<svg viewBox="0 0 24 24" fill="#38BDF8"><path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"/></svg>`,
  },
  {
    name: 'GSAP',
    glow: 'rgba(136,206,64,0.7)',
    svg: `<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#0A2118"/><path d="M4 16C4 9.373 9.373 4 16 4s12 5.373 12 12-5.373 12-12 12S4 22.627 4 16zm12-8a8 8 0 100 16A8 8 0 0016 8zm0 3a5 5 0 110 10A5 5 0 0116 11z" fill="#88CE40"/></svg>`,
  },
  {
    name: 'Three.js',
    glow: 'rgba(255,255,255,0.4)',
    svg: `<svg viewBox="0 0 128 128"><path d="M72 1L37 122l73-49zm0 0L128 98 55 18zm0 0L0 98l55-80zm0 0L55 122 128 98z" fill="white"/></svg>`,
  },
  {
    name: 'Supabase DB',
    glow: 'rgba(62,207,142,0.5)',
    svg: `<svg viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#0A1A2A"/><path d="M4 7h16v2H4zm0 4h16v2H4zm0 4h10v2H4z" fill="#3ECF8E" opacity="0.8"/></svg>`,
  },
  {
    name: 'Node.js',
    glow: 'rgba(104,160,99,0.7)',
    svg: `<svg viewBox="0 0 24 24" fill="#68A063"><path d="M11.998 24a1.362 1.362 0 01-.681-.183l-2.166-1.283c-.323-.181-.165-.245-.059-.283.432-.15.519-.184.979-.446.048-.028.113-.017.162.011l1.664.986c.06.033.146.033.202 0l6.489-3.744c.061-.034.1-.104.1-.176V8.12c0-.074-.039-.14-.1-.177l-6.488-3.742a.183.183 0 00-.203 0L5.609 7.943a.202.202 0 00-.101.177v7.488c0 .073.04.142.101.176l1.777 1.026c.965.482 1.556-.086 1.556-.658V9.184c0-.106.084-.189.19-.189h.829c.104 0 .189.083.189.189v7.179c0 1.288-.702 2.025-1.923 2.025-.376 0-.672 0-1.497-.408l-1.703-.98a1.37 1.37 0 01-.681-1.186V8.12c0-.49.261-.944.681-1.187l6.489-3.746a1.41 1.41 0 011.364 0l6.489 3.746c.42.243.682.697.682 1.187v7.488c0 .49-.262.944-.682 1.187l-6.489 3.744a1.356 1.356 0 01-.682.181z"/></svg>`,
  },
  {
    name: 'PWA',
    glow: 'rgba(91,74,245,0.7)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#1a1a2e"/><text x="3" y="16" font-size="7" font-weight="bold" fill="#5B4AF5" font-family="Inter,sans-serif">PWA</text><path d="M16 8l-4 8-2-4-2 4" stroke="#5B4AF5" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    name: 'Expo',
    glow: 'rgba(255,255,255,0.4)',
    svg: `<svg viewBox="0 0 24 24" fill="white"><path d="M0 21.386c.267.4.72.614 1.16.614.202 0 .408-.047.595-.147L12 15.898l10.245 5.955a1.226 1.226 0 001.755-.467L24 20.69 13.22 2.32a1.396 1.396 0 00-2.44 0L0 20.69l.245.696zM12 13.775L3.098 19l8.902-15.932L20.902 19 12 13.775z"/></svg>`,
  },
  {
    name: 'Dexie',
    glow: 'rgba(255,193,7,0.6)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#1a1206"/><text x="3" y="16" font-size="9" font-weight="bold" fill="#FFC107" font-family="Inter,sans-serif">Dx</text></svg>`,
  },
  {
    name: 'Recharts',
    glow: 'rgba(255,122,89,0.6)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#1a0d0a"/><path d="M4 18l4-8 4 4 4-10 4 6" stroke="#FF7A59" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    name: 'KaTeX',
    glow: 'rgba(165,42,42,0.5)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#1a0000"/><text x="2" y="16" font-size="8" font-style="italic" fill="#cc4444" font-family="Georgia,serif">KaTeX</text></svg>`,
  },
  {
    name: 'Web Push',
    glow: 'rgba(74,222,128,0.5)',
    svg: `<svg viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="4" fill="#0a1a0e"/><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#4ADE80" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    name: 'Playwright',
    glow: 'rgba(45,195,95,0.5)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0d1a10"/><path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="#2DC35F"/><path d="M10 9l5 3-5 3V9z" fill="#2DC35F"/></svg>`,
  },
  /* ── New additions ── */
  {
    name: 'Claude API',
    glow: 'rgba(232,130,12,0.75)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#160e04"/><circle cx="12" cy="9.5" r="4.5" fill="none" stroke="#E8820C" stroke-width="1.6"/><circle cx="12" cy="9.5" r="1.8" fill="#E8820C"/><path d="M8.5 16.5c0-1.93 1.57-3.5 3.5-3.5s3.5 1.57 3.5 3.5" stroke="#E8820C" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    name: 'OpenAI',
    glow: 'rgba(16,163,127,0.7)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#0a1a16"/><path d="M12 5l6.5 3.75v7.5L12 19.75 5.5 16.25v-7.5z" fill="none" stroke="#10A37F" stroke-width="1.4"/><circle cx="12" cy="12" r="2.8" fill="#10A37F"/><path d="M12 8.5V5M15.5 10.25l3-1.75M15.5 13.75l3 1.75M12 15.5v3.25M8.5 13.75l-3 1.75M8.5 10.25l-3-1.75" stroke="#10A37F" stroke-width="1" opacity="0.5" stroke-linecap="round"/></svg>`,
  },
  {
    name: 'Docker',
    glow: 'rgba(36,150,237,0.7)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#06111a"/><rect x="3.5" y="9" width="3.5" height="3.5" rx="0.6" fill="#2496ED"/><rect x="8" y="9" width="3.5" height="3.5" rx="0.6" fill="#2496ED"/><rect x="12.5" y="9" width="3.5" height="3.5" rx="0.6" fill="#2496ED"/><rect x="8" y="4.5" width="3.5" height="3.5" rx="0.6" fill="#2496ED"/><rect x="12.5" y="4.5" width="3.5" height="3.5" rx="0.6" fill="#2496ED"/><path d="M20 10.5s1.5.5 1.5 2-2 3.5-5 4H3.5" stroke="#2496ED" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M1.5 12c.5-1.5 2-2 3.5-2" stroke="#2496ED" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>`,
  },
  {
    name: 'PostgreSQL',
    glow: 'rgba(51,103,145,0.7)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#080f18"/><ellipse cx="12" cy="8" rx="6.5" ry="3.5" fill="none" stroke="#336791" stroke-width="1.4"/><path d="M5.5 8v8c0 1.93 2.91 3.5 6.5 3.5s6.5-1.57 6.5-3.5V8" stroke="#336791" stroke-width="1.4" fill="none"/><path d="M5.5 12c0 1.93 2.91 3.5 6.5 3.5s6.5-1.57 6.5-3.5" stroke="#336791" stroke-width="1" fill="none" opacity="0.5"/></svg>`,
  },
  {
    name: 'Stripe',
    glow: 'rgba(99,91,255,0.7)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#0d0c1a"/><path d="M10.5 9.5c0-.9.73-1.5 2-1.5 1.8 0 3.6.7 4.9 1.4l.7-4.4C16.7 4.2 14.6 3.5 12 3.5c-2 0-3.7.55-4.9 1.55C5.8 6.2 5.2 7.7 5.2 9.5c0 3.2 2 4.6 5.2 5.8 2.1.75 2.8 1.3 2.8 2.1 0 .8-.68 1.25-1.9 1.25-1.5 0-4-.75-5.6-1.7l-.7 4.45C6.3 22.4 8.8 23.2 11.7 23.2c2.1 0 3.9-.5 5.1-1.45C18.1 20.6 18.8 19.1 18.8 17c0-3.3-2.02-4.7-5.3-5.85-2.1-.74-2.8-1.2-2.8-1.95l-.2-.7z" fill="#635BFF"/></svg>`,
  },
  {
    name: 'Prisma',
    glow: 'rgba(200,200,255,0.4)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#0d0d16"/><path d="M4 19L12 3l8 16H4z" fill="none" stroke="white" stroke-width="1.4" stroke-linejoin="round"/><path d="M4 19l8-9" stroke="white" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  },
  {
    name: 'shadcn/ui',
    glow: 'rgba(255,255,255,0.35)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#0f0f0f"/><rect x="5" y="7" width="14" height="2" rx="1" fill="white" opacity="0.9"/><rect x="5" y="11" width="10" height="2" rx="1" fill="white" opacity="0.55"/><rect x="5" y="15" width="12" height="2" rx="1" fill="white" opacity="0.55"/><rect x="18" y="13" width="1.5" height="6" rx="0.75" fill="white" opacity="0.3"/></svg>`,
  },
  {
    name: 'Framer Motion',
    glow: 'rgba(5,102,255,0.6)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#06091a"/><path d="M6 3h12v7.5H12zm0 7.5h6L6 21z" fill="#0566FF"/></svg>`,
  },
  {
    name: 'React Query',
    glow: 'rgba(255,68,68,0.6)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#1a0505"/><path d="M12 5a7 7 0 100 14A7 7 0 0012 5zm0 2a5 5 0 110 10A5 5 0 0112 7z" fill="#FF4444" opacity="0.4"/><path d="M12 9a3 3 0 100 6 3 3 0 000-6z" fill="#FF4444"/><path d="M18.5 5.5L20 4" stroke="#FF4444" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    name: 'Zustand',
    glow: 'rgba(255,160,50,0.6)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#160f04"/><circle cx="12" cy="10" r="5.5" fill="none" stroke="#FFA032" stroke-width="1.5"/><circle cx="10" cy="9" r="1.2" fill="#FFA032"/><circle cx="14" cy="9" r="1.2" fill="#FFA032"/><path d="M9.5 12.5s.8 1.5 2.5 1.5 2.5-1.5 2.5-1.5" stroke="#FFA032" stroke-width="1.2" fill="none" stroke-linecap="round"/><path d="M10 17v2M14 17v2" stroke="#FFA032" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  },
  {
    name: 'Astro',
    glow: 'rgba(255,80,5,0.6)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#12080a"/><path d="M9.5 15c.5-3 1.5-6.5 3-9 .4-.7.8-1 1-1s.6.3 1 1c1.5 2.5 2.5 6 3 9C16.5 17 14.5 18 12 18s-4.5-1-2.5-3z" fill="#FF5005" opacity="0.85"/><path d="M10 14c.8-1 3.2-1 4 0" stroke="#FF5005" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.6"/></svg>`,
  },
  {
    name: 'Python',
    glow: 'rgba(55,118,171,0.7)',
    svg: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="#080f18"/><path d="M12 3c-3 0-5 1-5 3v2h5v1H7c-2 0-4 1.5-4 4s2 4 4 4h1v-2H7c-1 0-1.5-.5-1.5-2S6 11 7 11h10c1 0 2-1 2-2V6c0-2-2-3-5-3l-2 0zM9.5 5.5a1 1 0 110 2 1 1 0 010-2z" fill="#3776AB"/><path d="M12 21c3 0 5-1 5-3v-2h-5v-1h5c2 0 4-1.5 4-4s-2-4-4-4h-1v2h1c1 0 1.5.5 1.5 2S18 13 17 13H7c-1 0-2 1-2 2v3c0 2 2 3 5 3l2 0zM14.5 18.5a1 1 0 110-2 1 1 0 010 2z" fill="#FFD43B"/></svg>`,
  },
];

function initTechLogos() {
  const grid = document.getElementById('tech-logos-grid');
  if (!grid) return;

  TECH_LOGOS.forEach(tech => {
    const cell = document.createElement('div');
    cell.className = 'tech-logo-cell';
    cell.style.setProperty('--glow-color', tech.glow);

    const icon = document.createElement('div');
    icon.className = 'tech-logo-icon';
    icon.innerHTML = tech.svg;

    const name = document.createElement('div');
    name.className = 'tech-logo-name';
    name.textContent = tech.name;

    cell.appendChild(icon);
    cell.appendChild(name);
    grid.appendChild(cell);
  });
}

/* ═══════════════════════════════════════════════════════════════════
   CUSTOM CURSOR  (desktop ≥1024px, non-touch)
   ═══════════════════════════════════════════════════════════════════ */
function initCursor() {
  const isMobile = window.SceneState?.isMobile
    || window.matchMedia('(max-width: 1023px)').matches
    || window.matchMedia('(pointer: coarse)').matches;

  if (isMobile) return;

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  document.body.classList.add('has-custom-cursor');
  document.body.style.cursor = 'none';

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(loop);
  }

  loop();

  document.addEventListener('mouseover', e => {
    const target = e.target.closest('a, button, [role="button"]');
    if (!target) { ring.className = 'cursor-ring'; return; }

    const isWA = target.classList.contains('btn-whatsapp')
              || target.classList.contains('btn-primary')
              || target.classList.contains('btn-final-wa')
              || target.classList.contains('fab-whatsapp')
              || target.classList.contains('btn-submit');

    ring.className = isWA ? 'cursor-ring hover-whatsapp' : 'cursor-ring hover-link';
  });

  document.addEventListener('mouseout', e => {
    if (!e.target.closest('a, button')) return;
    ring.className = 'cursor-ring';
  });

  document.addEventListener('mouseleave', () => { dot.style.opacity = 0; ring.style.opacity = 0; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = 1; ring.style.opacity = 1; });
}

/* ═══════════════════════════════════════════════════════════════════
   SOUND SYSTEM  — Fmaj7 chord pad + convolution reverb + melody
   Feels like ambient electronic / late-night coding session
   ═══════════════════════════════════════════════════════════════════ */
const Sound = (function () {
  let ac = null, isOn = false, started = false;
  let ambientGain = null, melodyDest = null;
  const KEY = 'portfolio_sound';

  function getCtx() {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    return ac;
  }

  /* Convolution reverb — exponentially-decaying noise impulse response */
  function createReverb(a, seconds) {
    const conv = a.createConvolver();
    const len  = Math.ceil(a.sampleRate * seconds);
    const ir   = a.createBuffer(2, len, a.sampleRate);
    for (let c = 0; c < 2; c++) {
      const ch = ir.getChannelData(c);
      for (let i = 0; i < len; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
    }
    conv.buffer = ir;
    return conv;
  }

  /* Main ambient: Fmaj7 pad (F2 sub + F3 A3 C4 E4 + A4 shimmer) */
  function startAmbient() {
    const a = getCtx();

    /* Output: master → compressor → destination */
    const comp = a.createDynamicsCompressor();
    comp.threshold.value = -16;
    comp.knee.value = 8;
    comp.ratio.value = 4;
    comp.attack.value  = 0.003;
    comp.release.value = 0.25;
    comp.connect(a.destination);

    ambientGain = a.createGain();
    ambientGain.gain.value = 0;
    ambientGain.connect(comp);

    /* Reverb (wet) */
    const reverb     = createReverb(a, 4.5);
    const reverbGain = a.createGain();
    reverbGain.gain.value = 0.7;
    reverb.connect(reverbGain);
    reverbGain.connect(ambientGain);

    /* Warm LPF — feeds both dry and reverb */
    const lpf = a.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 1500;
    lpf.Q.value = 0.5;
    lpf.connect(reverb);
    const dryGain = a.createGain();
    dryGain.gain.value = 0.35;
    lpf.connect(dryGain);
    dryGain.connect(ambientGain);

    /* Slow LFO sweeps the filter — gives movement to the pad */
    const lfoF = a.createOscillator();
    lfoF.type = 'sine';
    lfoF.frequency.value = 0.038;
    const lfoFGain = a.createGain();
    lfoFGain.gain.value = 350;
    lfoF.connect(lfoFGain);
    lfoFGain.connect(lpf.frequency);
    lfoF.start();

    /* Chord voicing: Fmaj7 — warm, hopeful, sophisticated */
    [
      { f: 87.3,  v: 0.10 }, /* F2  sub */
      { f: 174.6, v: 0.13 }, /* F3  root */
      { f: 220.0, v: 0.11 }, /* A3  major third */
      { f: 261.6, v: 0.10 }, /* C4  fifth */
      { f: 329.6, v: 0.09 }, /* E4  major seventh */
      { f: 440.0, v: 0.028 },/* A4  shimmer */
    ].forEach(({ f, v }) => {
      /* Two detuned oscillators per chord tone → stereo width */
      [-2.8, 2.8].forEach(d => {
        const osc = a.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        osc.detune.value = d;
        const g = a.createGain();
        g.gain.value = v * 0.5;
        osc.connect(g);
        g.connect(lpf);
        osc.start();
      });
    });

    /* Breathing LFO on master — makes the pad feel alive */
    const breathLFO = a.createOscillator();
    breathLFO.type = 'sine';
    breathLFO.frequency.value = 0.065; /* ~15 s per breath */
    const breathGain = a.createGain();
    breathGain.gain.value = 0.016;
    breathLFO.connect(breathGain);
    breathGain.connect(ambientGain.gain);
    breathLFO.start();

    /* Melody destination — melody notes route here */
    melodyDest = lpf;

    /* Start first melodic phrase after 3.5 s */
    setTimeout(() => scheduleMelody(a), 3500);

    /* Fade in over 2.5 s */
    ambientGain.gain.linearRampToValueAtTime(0.13, a.currentTime + 2.5);
    started = true;
  }

  /* Slow melodic phrase — Fmaj7 scale fragment, repeats with rests */
  function scheduleMelody(a) {
    if (!isOn || !melodyDest) return;
    /* F4 A4 C5 E5 C5 A4 — ascending then descending */
    const phrase = [
      [349.2, 2.0], [440, 1.8], [523.3, 2.0],
      [659.3, 2.8], [523.3, 1.8], [440, 2.2],
    ];
    let sched = a.currentTime;
    phrase.forEach(([freq, dur]) => {
      const osc = a.createOscillator();
      const g   = a.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, sched);
      g.gain.linearRampToValueAtTime(0.017, sched + 0.2);
      g.gain.setValueAtTime(0.017, sched + dur - 0.35);
      g.gain.linearRampToValueAtTime(0, sched + dur);
      osc.connect(g);
      g.connect(melodyDest);
      osc.start(sched);
      osc.stop(sched + dur + 0.05);
      sched += dur;
    });
    /* Repeat: total phrase duration + 4 s rest */
    const total = phrase.reduce((s, [, d]) => s + d, 0);
    setTimeout(() => scheduleMelody(a), (total + 4) * 1000);
  }

  /* Crisp key-tap using triangle wave */
  function synthClick() {
    const a = getCtx();
    const osc = a.createOscillator(), g = a.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1100, a.currentTime);
    osc.frequency.exponentialRampToValueAtTime(380, a.currentTime + 0.03);
    g.gain.setValueAtTime(0.055, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.055);
    osc.connect(g); g.connect(a.destination);
    osc.start(); osc.stop(a.currentTime + 0.06);
  }

  /* Three-note ascending chime — C6→E6→G6 */
  function synthPing() {
    const a = getCtx();
    [[1046.5, 0], [1318.5, 0.13], [1568, 0.28]].forEach(([freq, delay]) => {
      const osc = a.createOscillator(), g = a.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, a.currentTime + delay);
      g.gain.linearRampToValueAtTime(0.065, a.currentTime + delay + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + delay + 0.75);
      osc.connect(g); g.connect(a.destination);
      osc.start(a.currentTime + delay);
      osc.stop(a.currentTime + delay + 0.8);
    });
  }

  return {
    toggle() {
      isOn = !isOn;
      if (isOn) {
        if (!started) {
          startAmbient();
        } else {
          getCtx();
          ambientGain.gain.linearRampToValueAtTime(0.13, ac.currentTime + 1.5);
          setTimeout(() => scheduleMelody(ac), 1500);
        }
      } else {
        if (ambientGain) ambientGain.gain.linearRampToValueAtTime(0, ac.currentTime + 1.2);
      }
      localStorage.setItem(KEY, isOn ? 'on' : 'off');
      return isOn;
    },
    playKey()  { if (isOn) synthClick(); },
    playPing() { if (isOn) synthPing();  },
    get active() { return isOn; },
  };
})();

window.Sound = Sound;

function initSoundToggle() {
  const btn = document.getElementById('sound-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const on = Sound.toggle();
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-pressed', String(on));
  });
}

/* ═══════════════════════════════════════════════════════════════════
   FLOATING WHATSAPP BUTTON
   ═══════════════════════════════════════════════════════════════════ */
function initFAB() {
  const fab = document.getElementById('fab-whatsapp');
  if (!fab) return;

  let shown = false;
  const show = () => { if (shown) return; shown = true; fab.classList.add('visible'); };

  setTimeout(show, 20000);

  window.addEventListener('scroll', function check() {
    const ratio = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    if (ratio >= 0.5) { show(); window.removeEventListener('scroll', check); }
  }, { passive: true });

  const finalCTA = document.getElementById('final-cta');
  if (finalCTA) {
    new IntersectionObserver(([entry]) => {
      fab.style.opacity = entry.isIntersecting ? '0' : '';
      fab.style.pointerEvents = entry.isIntersecting ? 'none' : '';
    }, { threshold: 0.2 }).observe(finalCTA);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   SMOOTH SCROLL
   ═══════════════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ═══════════════════════════════════════════════════════════════════
   TIMELINE — auto-advance + hover interactivity
   ═══════════════════════════════════════════════════════════════════ */
function initTimeline() {
  const days = document.querySelectorAll('#timeline-desktop .timeline-day');
  if (!days.length) return;

  let autoIdx = 0, isHovering = false, timerId;

  function activate(idx) {
    days.forEach((d, i) => {
      d.classList.toggle('lit', i <= idx);
      d.classList.toggle('active-day', i === idx);
    });
  }

  function step() {
    if (!isHovering) {
      activate(autoIdx);
      autoIdx = (autoIdx + 1) % (days.length + 2); /* pause at end before reset */
      if (autoIdx >= days.length) {
        /* Hold on "all lit" for 2 ticks, then reset */
        if (autoIdx === days.length + 1) autoIdx = 0;
      }
    }
  }

  days.forEach((day, i) => {
    day.addEventListener('mouseenter', () => {
      isHovering = true;
      activate(i);
    });
    day.addEventListener('mouseleave', () => {
      isHovering = false;
    });
  });

  /* Start auto-advance when section scrolls into view */
  const section = document.getElementById('timeline-desktop');
  if (section) {
    new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (!timerId) timerId = setInterval(step, 850);
      } else {
        clearInterval(timerId);
        timerId = null;
        autoIdx = 0;
        days.forEach(d => { d.classList.remove('lit', 'active-day'); });
      }
    }, { threshold: 0.3 }).observe(section);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   POSTROOM LINK
   ═══════════════════════════════════════════════════════════════════ */
function initPostroomLink() {
  const link = document.getElementById('postroom-link');
  if (!link || POSTROOM_URL === 'FILL_ME_IN') return;
  link.href = POSTROOM_URL;
}

/* ═══════════════════════════════════════════════════════════════════
   BOOT
   ═══════════════════════════════════════════════════════════════════ */
function boot() {
  initMarquee();
  initCursor();
  initHeroGradient();
  initConstellation();
  initTileCanvases();
  initProjectPreviews();
  initTechLogos();
  initSoundToggle();
  initFAB();
  initSmoothScroll();
  initPostroomLink();
  initTimeline();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
