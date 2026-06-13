/* main.js — boot, nav, marquee, cursor, sound, floating WA button */
'use strict';

/* ── Constants ──────────────────────────────────────────────────── */
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

/* ── Marquee ─────────────────────────────────────────────────────── */
function initMarquee() {
  const track = document.getElementById('marquee-track');
  if (!track) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const itemsHTML = MARQUEE_ITEMS.map(item => `<span style="padding:0 2.5rem;">${item}</span>`).join('');
  const content   = `<div class="marquee-content">${itemsHTML}</div>`;

  if (prefersReduced) {
    /* Static centered */
    track.style.animation = 'none';
    track.style.justifyContent = 'center';
    track.innerHTML = content;
    return;
  }

  /* Double for seamless loop */
  track.innerHTML = content + content;
}

/* ── Custom cursor (desktop ≥1024px, non-touch) ─────────────────── */
function initCursor() {
  const isMobile = window.matchMedia('(max-width: 1023px)').matches
                || window.matchMedia('(pointer: coarse)').matches;

  if (isMobile) return;

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  document.body.classList.add('has-custom-cursor');
  document.body.style.cursor = 'none';

  let dotX = 0, dotY = 0;
  let ringX = 0, ringY = 0;
  let mouseX = 0, mouseY = 0;
  let rafId;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    /* Dot follows instantly */
    dotX = e.clientX;
    dotY = e.clientY;
    dot.style.left = dotX + 'px';
    dot.style.top  = dotY + 'px';
  });

  /* Ring lerp loop */
  function lerp(a, b, t) { return a + (b - a) * t; }

  function loop() {
    ringX = lerp(ringX, mouseX, 0.12);
    ringY = lerp(ringY, mouseY, 0.12);
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    rafId = requestAnimationFrame(loop);
  }

  loop();

  /* Interactive hover states */
  document.addEventListener('mouseover', e => {
    const target = e.target.closest('a, button, [role="button"]');
    if (!target) {
      ring.className = 'cursor-ring';
      return;
    }

    const isWA = target.classList.contains('btn-whatsapp')
              || target.classList.contains('btn-primary')
              || target.classList.contains('btn-final-wa')
              || target.classList.contains('fab-whatsapp');

    if (isWA) {
      ring.className = 'cursor-ring hover-whatsapp';
    } else {
      ring.className = 'cursor-ring hover-link';
    }
  });

  document.addEventListener('mouseout', e => {
    if (!e.target.closest('a, button, [role="button"]')) return;
    ring.className = 'cursor-ring';
  });

  /* Hide when leaving window */
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
}

/* ── Sound system (lazy init, opt-in only) ──────────────────────── */
const Sound = (function () {
  let initialized = false;
  let ambient, hover, whoosh, type, ping;
  let isOn = false;

  const STORAGE_KEY = 'portfolio_sound';

  function tryLoad(src) {
    try {
      return new Howl({
        src: [src],
        preload: true,
        onloaderror: () => console.warn('Audio not found:', src),
      });
    } catch (e) {
      console.warn('Howler error:', e);
      return null;
    }
  }

  function lazyInit() {
    if (initialized) return;
    initialized = true;

    try {
      ambient = new Howl({
        src: ['assets/audio/ambient.mp3'],
        loop: true,
        volume: 0,
        onloaderror: () => console.warn('ambient.mp3 not found'),
      });
      hover  = tryLoad('assets/audio/hover.mp3');
      whoosh = tryLoad('assets/audio/whoosh.mp3');
      type   = tryLoad('assets/audio/type.mp3');
      ping   = tryLoad('assets/audio/ping.mp3');
    } catch (e) {
      console.warn('Howler init error:', e);
    }
  }

  function turnOn() {
    lazyInit();
    isOn = true;
    if (ambient) {
      try {
        ambient.play();
        ambient.fade(0, 0.05, 1500);
      } catch (e) {}
    }
  }

  function turnOff() {
    isOn = false;
    if (ambient) {
      try { ambient.fade(ambient.volume(), 0, 800); } catch (e) {}
    }
  }

  return {
    toggle() {
      if (isOn) {
        turnOff();
        localStorage.setItem(STORAGE_KEY, 'off');
      } else {
        turnOn();
        localStorage.setItem(STORAGE_KEY, 'on');
      }
      return isOn;
    },
    playHover() {
      if (!isOn || !hover) return;
      try { hover.play(); } catch (e) {}
    },
    playWhoosh() {
      if (!isOn || !whoosh) return;
      try { whoosh.play(); } catch (e) {}
    },
    playKey() {
      if (!isOn || !type) return;
      try { type.play(); } catch (e) {}
    },
    playPing() {
      if (!isOn || !ping) return;
      try { ping.play(); } catch (e) {}
    },
    get active() { return isOn; },
    restoreState() {
      const isMobile = window.matchMedia('(pointer: coarse)').matches;
      if (isMobile) return;
      /* Page is silent on load — only restore "on" state if previously enabled */
      /* Per spec: page is silent on load. Do NOT auto-enable. */
    }
  };
})();

/* Expose sound to form.js */
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

/* ── Floating WhatsApp button ────────────────────────────────────── */
function initFAB() {
  const fab = document.getElementById('fab-whatsapp');
  if (!fab) return;

  let shown = false;

  function show() {
    if (shown) return;
    shown = true;
    fab.classList.add('visible');
  }

  /* Show after 20s */
  setTimeout(show, 20000);

  /* OR after 50% scroll */
  const onScroll = () => {
    const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    if (scrolled >= 0.5) { show(); window.removeEventListener('scroll', onScroll); }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Hide when final CTA is in view */
  const finalCTA = document.getElementById('final-cta');
  if (finalCTA) {
    const obs = new IntersectionObserver(([entry]) => {
      fab.style.opacity = entry.isIntersecting ? '0' : '';
      fab.style.pointerEvents = entry.isIntersecting ? 'none' : '';
    }, { threshold: 0.3 });
    obs.observe(finalCTA);
  }
}

/* ── Postroom link ───────────────────────────────────────────────── */
function initPostroomLink() {
  const link = document.getElementById('postroom-link');
  if (!link || POSTROOM_URL === 'FILL_ME_IN') return;
  link.href = POSTROOM_URL;
}

/* ── Smooth scroll for ghost CTA ────────────────────────────────── */
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

/* ── Boot ────────────────────────────────────────────────────────── */
function boot() {
  initMarquee();
  initCursor();
  initSoundToggle();
  initFAB();
  initPostroomLink();
  initSmoothScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
