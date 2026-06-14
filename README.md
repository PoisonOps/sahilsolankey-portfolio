# sahilsolankey.vercel.app

> Personal portfolio — Full-Stack Developer & AI Engineer. Awwwards-quality static site, no framework, no build tools.

**Live → [sahilsolankey.vercel.app](https://sahilsolankey.vercel.app)**

---

## What It Is

A portfolio site built to convert a founder or business owner within 60 seconds. Every decision — copy, motion, layout — is engineered for one outcome: "I need to hire this person."

The site **is** the proof of skill. Built with the same stack used to ship client products: vanilla HTML/CSS/JS, GSAP, Three.js, Howler.

---

## Architecture

Single-file SPA. No framework. No bundler. No npm. Open `index.html` in a browser.

```
/index.html          — all markup, semantic HTML5
/css/style.css       — design tokens, all styles, responsive
/js/main.js          — marquee, hero gradient, constellation, canvas previews, cursor, sound, FAB
/js/scene.js         — ONE Three.js WebGL context, ambient particles + spark trail
/js/animations.js    — GSAP ScrollTrigger, count-ups, timeline, device parallax
/js/form.js          — idea form → WhatsApp URL + submit
/assets/videos/      — project demo videos (MP4)
/assets/audio/       — ambient + UI sounds (opt-in, Howler)
```

**The one WebGL rule:** One `<canvas>`. One `THREE.WebGLRenderer`. One scene. All visual groups live within it — no second renderer, ever.

---

## Key Features

- **Canvas project previews** — each project card has a live 2D canvas animation mimicking its real UI (CATalyst dashboard, GharKhata expense view, PitchReady stats, PageAutopsy results)
- **Three.js ambient layer** — 120 particles + spark trail, single renderer, pauses when tab is hidden
- **CSS 3D constellation** — service device cards in perspective space, JS-driven rotation with counter-rotation so text never mirrors
- **Custom cursor** — lerp dot + ring, `pointer: coarse` detection (never applies on touch)
- **Sound system** — opt-in, lazy-init (Howler instances created on first click only), ambient at 0.05 volume
- **7-day process timeline** — auto-advances through days, hover to pause
- **Idea form → WhatsApp** — validated, builds pre-filled WhatsApp URL, opens in new tab

---

## Running Locally

```bash
npx serve .
# → localhost:3000
```

No environment variables. No API keys. No database.

---

## CDN Libraries (pinned versions)

```html
three.js r128        → cdnjs.cloudflare.com
GSAP 3.12.2          → cdnjs.cloudflare.com
ScrollTrigger 3.12.2 → cdnjs.cloudflare.com
Howler 2.2.3         → cdnjs.cloudflare.com
```

---

## Deploy

```bash
vercel --prod
```

Static site — instant deploy, no build step.

---

Built by [Sahil Solankey](https://sahilsolankey.vercel.app)
