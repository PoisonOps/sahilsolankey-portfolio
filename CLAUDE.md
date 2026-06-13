# CLAUDE.md — Sahil Solankey Portfolio Website

This file tells you exactly how to work on this project.
Read it completely before touching any code.

---

## What You Are Building

A personal portfolio website for Sahil Solankey — Full-Stack Developer & AI Engineer.
The full visual and content specification lives in `MVP_Website_Build_Spec.md` in this folder.
Read that file in full before writing a single line of code.

**The goal of this site:** A founder or business owner lands here and within 60 seconds thinks "I need to hire this person." Every decision serves that conversion.

**Quality bar:** Awwwards-level execution. This site IS the proof of skill. Do not cut corners.

---

## The Single Most Important Rule

**ONE WebGL context. Always. Forever.**

There is one `<canvas>` element. One `THREE.WebGLRenderer`. One scene. One render loop.

All Three.js visuals — hero terrain, orbit particles, device constellation, service tile mini-objects, tech graph, process spark trail — are groups within this ONE scene. They are shown or hidden using scissor rectangles (`renderer.setScissor`) mapped to their DOM section positions.

If you ever find yourself writing `new THREE.WebGLRenderer()` a second time — stop. You are doing it wrong. Come back to this rule.

---

## File Structure (create exactly this)

```
/index.html
/css/style.css
/js/main.js          — boot, nav, marquee, cursor, sound toggle, floating WA button
/js/scene.js         — ALL Three.js: one renderer, one scene, all groups
/js/animations.js    — GSAP scroll animations (ScrollTrigger)
/js/form.js          — idea form → WhatsApp submission
/assets/videos/      — catalyst.mp4, gharkhata.mp4, pitchready.mp4, postroom.mp4
/assets/audio/       — ambient.mp3, hover.mp3, whoosh.mp3, type.mp3, ping.mp3
/assets/og-image.png — 1200×630 placeholder (generate a styled dark panel with the site title)
/CLAUDE.md           — this file
/MVP_Website_Build_Spec.md — the full spec
```

No framework. No build tools. No npm. No bundler.
`index.html` opens directly in a browser — or served with `npx serve .`

CDN libraries (load in index.html, in this order, pinned versions):
- Three.js r128: `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
- GSAP 3.12.2: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js`
- ScrollTrigger 3.12.2: `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js`
- Howler 2.2.3: `https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js`

Google Fonts (preconnect + link in `<head>`):
- DM Serif Display: weight 400
- Inter: weights 400, 500, 600
- JetBrains Mono: weights 400, 500

---

## How You Work On This Project

### Rule 1 — Build section by section. Never skip ahead.

The spec defines 14 sections. Build them in order:

```
1.  Design tokens + base CSS (css/style.css)
2.  index.html shell + font/CDN imports
3.  Marquee bar
4.  Nav (sticky, backdrop blur, sound toggle, WhatsApp button)
5.  Custom cursor (desktop only)
6.  Hero — DOM layout + typography + CTAs
7.  Hero — Three.js (terrain + orbit particles) in scene.js
8.  Proof strip (count-up on scroll)
9.  Project sections (all 4, screen-slide transition, color shifts)
10. Services — device constellation (Three.js, scissored)
11. Services — six tiles (DOM + CSS micro-demos + Three.js mini-objects scissored)
12. 7-day process timeline (draw-line scroll animation + spark particles)
13. Tech graph (force-directed Three.js on desktop, CSS grid on mobile)
14. Idea form + success state + WhatsApp submission
15. Final CTA section + footer
16. Floating WhatsApp button
17. Sound system (Howler, opt-in only)
18. Mobile pass (verify every section at 375px)
19. Reduced-motion pass
20. QA checklist from spec
```

After each step: verify it renders, has no console errors, and matches the spec before moving to the next.

### Rule 2 — Copy is final. Do not invent.

Every word that appears on the site is specified in `MVP_Website_Build_Spec.md`. Use it exactly. Do not rephrase, shorten, or "improve" any copy. If copy for something isn't in the spec, ask before inventing.

### Rule 3 — Mobile is built simultaneously, not added at the end.

Every section has a mobile spec. Implement the desktop and mobile version of each section together — not after the whole site is built. Use the breakpoint `@media (max-width: 1023px)` as the mobile/tablet cutoff.

The hard mobile rule: **Three.js never initializes on touch devices or mobile viewports.** Detect with:
```javascript
const isMobile = window.matchMedia('(max-width: 1023px)').matches 
               || window.matchMedia('(pointer: coarse)').matches;
if (!isMobile) { initScene(); }
```
All Three.js visuals have CSS fallback equivalents specified in the spec. Build both.

### Rule 4 — When Three.js code becomes complex, structure it cleanly.

`scene.js` exports one `initScene()` function called from `main.js`. Inside, organize with clearly labeled groups:

```javascript
const groups = {
  heroTerrain: new THREE.Group(),
  heroParticles: new THREE.Group(),
  constellation: new THREE.Group(),
  serviceMinis: new THREE.Group(),
  techGraph: new THREE.Group(),
  sparkTrail: new THREE.Group(),
};
Object.values(groups).forEach(g => scene.add(g));
```

Each group is `visible = false` by default. IntersectionObserver on each section's DOM element toggles its group's visibility — objects not on screen cost nothing.

### Rule 5 — Scissor rendering for service tile mini-objects.

The six service tiles each need a small 3D object. These all live in `groups.serviceMinis`. Each frame, iterate the six tiles, get their `getBoundingClientRect()`, call `renderer.setScissor()` and `renderer.setViewport()` for each, render only that tile's object into that rect. Reset scissor after all six.

Do NOT create six separate renderers or six canvas elements. If you are uncertain how to implement scissor rendering, ask before attempting.

### Rule 6 — Placeholder assets.

Videos (`assets/videos/*.mp4`) do not exist yet. For each video slot:
- Create a `<div class="video-placeholder">` sized to the exact spec dimensions
- Style: --surface background, centered text in JetBrains Mono showing the project name + "· video coming soon"
- The placeholder must sit inside the same device frame that the real video will use
- When the video file exists, dropping it in and removing the placeholder class is the only change needed — no layout shift

Audio files (`assets/audio/*.mp3`) do not exist yet. Howler must not throw errors when files are absent. Wrap all Howler playback in try/catch. On missing file: fail silently, log a console.warn only.

### Rule 7 — Performance rules are hard requirements.

- pixelRatio: `Math.min(window.devicePixelRatio, 2)` — never higher
- Total particles in scene at once: ≤ 200
- No postprocessing passes (no EffectComposer, no bloom, no depth-of-field — fake it with material opacity)
- No shadows (`renderer.shadowMap.enabled = false`)
- Three.js render loop only when tab is visible (`document.addEventListener('visibilitychange', ...)`)
- GSAP ScrollTrigger: use `once: true` for reveal animations (re-triggering on up-scroll wastes performance)

### Rule 8 — Reduced motion.

```javascript
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

If true:
- Marquee: remove animation, display as static centered text
- GSAP: replace all `gsap.from/to` entrance animations with instant `gsap.set` (no duration)
- Three.js: render a single frame and stop the rAF loop (`renderer.render(scene, camera)` once, no `animate()`)
- Videos: show poster frame with a visible play button affordance (add `controls` attribute)
- CSS keyframe animations: add a global `*, *::before, *::after { animation-duration: 0.01ms !important; }` rule inside a `prefers-reduced-motion` media query

### Rule 9 — Sound is opt-in. Never autoplays.

Howler instances are created ONLY on first sound toggle click (lazy init — do not load audio files on page load). The ambient loop starts at volume 0 and fades to 0.05 over 1.5s. All other sounds are volume 0.04 or less. No sound on mobile (the toggle is hidden on mobile).

### Rule 10 — Commits after each major section.

After completing each numbered step above, output the exact git commands to commit that section's work:

```bash
git add .
git commit -m "Step X: [section name] complete"
```

This creates rollback points. If something breaks in Step 13, we can return to Step 12's state.

---

## Design Tokens (exact — use these, derive nothing)

```css
:root {
  --bg:           #050810;
  --bg-warm:      #0A080E;
  --surface:      #0C0F18;
  --line:         #1A1E2A;
  --text:         #E9E5DC;
  --text-dim:     #8A8FA3;
  --accent:       #E8820C;
  --whatsapp:     #25D366;
  --live:         #4ADE80;

  --p-catalyst:   #2E5BFF;
  --p-gharkhata:  #00C853;
  --p-pitchready: #FF8F00;
  --p-postroom:   #E8DCC0;

  --radius-card:  14px;
  --radius-pill:  999px;
  --radius-sm:    8px;

  --section-py:   clamp(96px, 14vh, 160px);
  --content-max:  1280px;
  --content-px:   clamp(24px, 5vw, 48px);
}
```

Font roles:
- `font-family: 'DM Serif Display', Georgia, serif` — headlines only
- `font-family: 'Inter', system-ui, sans-serif` — body, UI, nav
- `font-family: 'JetBrains Mono', 'Courier New', monospace` — labels, metrics, eyebrows, code

Type scale:
```css
.t-hero     { font-size: clamp(2.6rem, 6vw, 5.2rem); line-height: 1.08; }
.t-section  { font-size: clamp(2rem, 4vw, 3.4rem);   line-height: 1.12; }
.t-metric   { font-size: clamp(2.2rem, 4vw, 3.2rem); font-family: 'JetBrains Mono'; }
.t-body     { font-size: 1.05rem; line-height: 1.7; }
.t-eyebrow  { font-size: 0.72rem; letter-spacing: 0.18em; text-transform: uppercase; font-family: 'JetBrains Mono'; color: var(--text-dim); }
.t-small    { font-size: 0.875rem; color: var(--text-dim); }
```

---

## Key URLs (hardcode these exactly)

- WhatsApp CTA: `https://wa.me/917080442040?text=Hi%20Sahil%2C%20I%20saw%20your%20portfolio%20and%20want%20to%20discuss%20a%20project.`
- CATalyst: `https://catalyst-app-six.vercel.app`
- GharKhata: `https://gharkhata.vercel.app`
- PitchReady: `https://pitchready-app.vercel.app`
- Postroom: `POSTROOM_URL` — leave as a clearly named JS constant at top of main.js for Sahil to fill
- LinkedIn: `https://www.linkedin.com/in/sahil-solankey-3aa7b2188`
- GitHub: `https://github.com/PoisonOps`
- Email: `sahilsolankey1009@gmail.com`

---

## Marquee Content (exact — repeat 2× for seamless loop)

```
● CATalyst — live with paying users   ● GharKhata shipped in 2 days   ● PitchReady shipped in 1 day   ● Postroom Studio — designed & shipped   ● NEXT SLOT: AVAILABLE NOW   ● 7-DAY DELIVERY · FROM ₹15,000   
```

Store as `const MARQUEE_CONTENT` at top of main.js. "NEXT SLOT: AVAILABLE NOW" gets `class="marquee-live"` styled with `var(--live)`.

---

## QA Checklist (run before declaring done)

Claude Code must run through this list and report pass/fail for each:

- [ ] Resize 320px → 1920px: no horizontal scroll, no clipped text, no layout breaks
- [ ] Touch device emulation: WebGL never initializes, CSS fallbacks are polished not degraded
- [ ] All 4 project live links open correct URLs in new tabs
- [ ] All 3 WhatsApp entry points (nav, floating button, form CTA) open correct pre-filled message
- [ ] Idea form: submits → WhatsApp opens with encoded message; empty idea field blocked with inline validation (no browser alert())  
- [ ] Form success state renders correctly; does not show the form again
- [ ] prefers-reduced-motion: marquee static, animations instant, Three.js single frame
- [ ] Sound: page is completely silent on load; toggle enables ambient; toggle again disables; state survives page reload (localStorage)
- [ ] Scroll full page twice at 1280px: stable, no jank, no Three.js errors in console
- [ ] Zero console errors on fresh load
- [ ] Zero 404s for CDN scripts and fonts
- [ ] Floating WhatsApp button: absent for first 20s, then appears; hidden when final CTA is in view
- [ ] Custom cursor active on desktop; absent on mobile (no cursor:none on touch)
- [ ] All LIVE ● dots have --live color and pulse animation
- [ ] Meta tags: title, description, OG image, Twitter card all present and correct

---

## When You Finish

Give Sahil:
1. Summary of every section built and any deviations from spec
2. List of placeholder assets still needed (videos, audio files) with exact filenames
3. The Vercel deploy commands:
```bash
npm i -g vercel   # if not installed
vercel            # follow prompts, project name: sahilsolankey
vercel --prod     # production deploy
```
4. The one constant to fill: `POSTROOM_URL` in main.js
5. Lighthouse mobile score from DevTools

---

## If You Are Ever Unsure

Ask before building. A wrong assumption caught before coding costs 10 seconds. A wrong assumption caught after costs an hour of fixes.

When in doubt: re-read `MVP_Website_Build_Spec.md`. The answer is almost certainly there.
