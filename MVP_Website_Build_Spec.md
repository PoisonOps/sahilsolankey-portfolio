# PORTFOLIO WEBSITE — FULL BUILD SPECIFICATION
## Claude Code Prompt — paste this entire document into Claude Code

Project: Personal portfolio for Sahil Solankey — Full-Stack Developer & AI Engineer
Goal: A founder/business owner lands here and within 60 seconds thinks "I need to hire this person." Every design decision serves that conversion. Deploy target: new Vercel project.
Quality bar: Awwwards-level. This site IS the proof of skill.

---


# 0. HOW TO BUILD THIS (instructions to Claude Code)

1. Read this ENTIRE document before writing any code.
2. Build as a static site: `index.html` + `css/` + `js/` + `assets/`. No framework, no build step. Three.js, GSAP (+ ScrollTrigger), and Howler.js loaded from CDN (use cdnjs or unpkg, pinned versions).
3. Build section by section IN ORDER. After each section, verify it renders before moving on.
4. Mobile is NOT an afterthought — every section has an explicit mobile spec below. Implement both together.
5. All copy is FINAL and provided in this document. Do not invent or change copy.
6. Performance budget and fallback rules in Section 12 are hard requirements.
7. Placeholder assets: where product videos are referenced, create a styled placeholder (dark panel + project name + "video loop" label) sized exactly to spec, so videos can be dropped in later without layout shift.

File structure:
```
/index.html
/css/style.css
/js/main.js          (boot, nav, marquee, cursor, sound toggle)
/js/scene.js         (single shared Three.js context — ALL 3D)
/js/animations.js    (GSAP scroll animations)
/js/form.js          (idea form → WhatsApp)
/assets/videos/      (catalyst.mp4, gharkhata.mp4, pitchready.mp4, postroom.mp4)
/assets/audio/       (ambient.mp3, hover.mp3, whoosh.mp3, type.mp3, ping.mp3)
/assets/og-image.png (1200×630 placeholder)
```

---

# 1. DESIGN TOKENS (exact values — derive everything from these)

## Colors
```css
--bg:            #050810;   /* deep navy-black — page background */
--bg-warm:       #0A080E;   /* idea-form section background */
--surface:       #0C0F18;   /* cards, panels */
--line:          #1A1E2A;   /* hairline borders */
--text:          #E9E5DC;   /* warm off-white — primary text */
--text-dim:      #8A8FA3;   /* secondary text */
--accent:        #E8820C;   /* amber — particles, highlights, signature color */
--whatsapp:      #25D366;   /* WhatsApp buttons ONLY — intentional palette break */
--live:          #4ADE80;   /* pulsing LIVE dots */

/* Per-project atmosphere tints (Three.js particle + gradient shifts) */
--p-catalyst:    #2E5BFF;
--p-gharkhata:   #00C853;
--p-pitchready:  #FF8F00;
--p-postroom:    #E8DCC0;
```

## Typography (Google Fonts)
- Display / headlines: **DM Serif Display** (400) — sharp, modern serif with personality
- Body / UI: **Inter** (400 / 500 / 600)
- Code / metrics / labels: **JetBrains Mono** (400 / 500)

Type scale (desktop → mobile):
- Hero headline: clamp(2.6rem, 6vw, 5.2rem), DM Serif, line-height 1.08
- Section headlines: clamp(2rem, 4vw, 3.4rem)
- Body: 1.05rem / 1.7
- Labels/eyebrows: 0.72rem, JetBrains Mono, letter-spacing 0.18em, uppercase, --text-dim
- Metric numbers: clamp(2.2rem, 4vw, 3.2rem), JetBrains Mono 500

## Spacing & shape
- Section vertical padding: clamp(96px, 14vh, 160px)
- Max content width: 1280px, side padding 24px (mobile) / 48px (desktop)
- Border radius: 14px cards, 8px pills, 999px buttons
- Hairline borders: 1px solid var(--line)

## Custom cursor (desktop only, ≥1024px)
- 6px dot (--text) follows mouse exactly
- 28px ring follows with 0.12 lerp lag
- Over any link/button: ring scales 1.6×, border-color → --accent
- Over WhatsApp buttons: ring FILLS with --whatsapp at 25% opacity
- `cursor: none` on body only when custom cursor active; never on touch devices

---

# 2. THE MARQUEE BAR (top of page, before nav)

A 34px strip, background #000, full width. Content scrolls left continuously (CSS animation, 40s loop, pauses on hover). JetBrains Mono, 0.72rem, --text-dim, with --live colored dots.

EXACT content (repeat 2× for seamless loop):
```
● CATalyst — live with paying users   ● GharKhata shipped in 2 days   ● PitchReady shipped in 1 day   ● Postroom Studio — designed & shipped   ● NEXT SLOT: AVAILABLE NOW   ● 7-DAY DELIVERY · FROM ₹15,000   
```
"NEXT SLOT: AVAILABLE NOW" in --live color. Make this string a single JS constant at the top of main.js (easy to edit when a slot fills).

Mobile: identical (marquee is cheap).

---

# 3. NAV (sticky, below marquee)

56px tall, backdrop-blur(12px), background rgba(5,8,16,0.7), hairline bottom border.
- Left: `Sahil Solankey` — Inter 600, 0.95rem
- Right cluster:
  - Sound toggle: small waveform SVG icon + label "Sound" — OFF by default (browsers block autoplay audio). When clicked: Howler ambient fades in (volume 0.05), waveform bars animate. Click again: fades out. State in localStorage.
  - A 8px --live dot with CSS pulse + text "Available"
  - WhatsApp button: pill, --whatsapp background, #052E16 text, "WhatsApp →", links to `https://wa.me/917080442040?text=Hi%20Sahil%2C%20I%20saw%20your%20portfolio%20and%20want%20to%20discuss%20a%20project.`

Mobile: name left; right shows only the live dot + a compact WhatsApp icon button. Sound toggle hidden on mobile (no ambient audio on mobile — saves battery/data).

---

# 4. HERO (100vh)

## Layout
Two halves on desktop (55% text / 45% visual). Stacked on mobile (text first).

## Left — typography (final copy):
```
[eyebrow] FULL-STACK DEVELOPER & AI ENGINEER

I build the product
you've been planning
in Notion for 6 months.

In 7 days.
```
- Eyebrow: JetBrains Mono label style
- Headline: DM Serif Display; the words "In 7 days." on their own line in --accent
- Below: two CTAs side by side:
  - Primary: WhatsApp pill (same link as nav) — "Start your build →"
  - Ghost: "See the work ↓" — smooth-scrolls to projects
- Entrance animation: lines rise in with 80ms stagger, slight blur→sharp (GSAP, once, on load)

## Right — the device showcase (Three.js layer + DOM layer)
- DOM: a laptop frame and phone frame (CSS-built device mockups, not images) floating with subtle CSS transform idle animation (slow 6s ease-in-out bob, alternating phase).
  - Laptop screen: `assets/videos/catalyst.mp4` — autoplay, muted, loop, playsinline
  - Phone screen: `assets/videos/gharkhata.mp4` — same attributes
  - (Placeholders until videos exist — see §0.7)
- Three.js (in the single shared scene, rendered behind the DOM via fixed full-screen canvas, z-index below content):
  1. **Low-poly terrain**: a PlaneGeometry (~120×60 segments) with vertex noise displacement forming dark ridges across the bottom third of the viewport. Material: MeshStandardMaterial, color #0A0E1A, flatShading. Lit by one dim PointLight from below-center with --accent color at low intensity (0.35) — ridge edges catch faint amber. Rotation: imperceptible drift (0.0004 rad/frame max).
  2. **Orbit particles**: ~60 small amber points (size 2px, opacity 0.4) loosely orbiting the screen-space region of the device mockups (project their DOM position into the scene each frame). Slow, organic, slightly randomized orbits.
- Mouse parallax: entire Three.js camera offsets ±10px against cursor (lerped). DOM devices counter-shift ±6px for depth.

## Mobile hero
- NO Three.js. Background: CSS radial-gradient glow (--accent at 8% opacity, slow 8s pulse via keyframes).
- Devices: phone frame only (laptop hidden), full-width, video loop inside.
- Headline scales via clamp; CTAs stack full-width.

---

# 5. PROOF STRIP

Background --surface, hairline top/bottom borders. Five stats in a row (grid, wraps 3+2 on tablet, vertical on mobile ≤480px).

| Number | Label |
|---|---|
| 4 | PRODUCTS SHIPPED |
| 1 | DAY — FASTEST SHIP |
| 68 | COMMITS ON CATALYST |
| 100% | SOLO — DESIGN TO DEPLOY |
| ₹489 | FIRST REVENUE EARNED |

- Numbers: JetBrains Mono metric style; labels: eyebrow style
- Count-up animation on scroll into view (GSAP, once, 1.2s, ease out). "₹489" counts the integer; "100%" counts to 100.

---

# 6. PROJECT SECTIONS (the core — four full-viewport sections)

Order: CATalyst → GharKhata → PitchReady → Postroom Studio.

## Shared structure per section (100vh, content vertically centered)
- Left (45%): details. Right (55%): device frame with the project's video loop.
- The SAME device frame persists visually between sections; on scroll transition, the screen content SLIDES out left while the next slides in from right (GSAP ScrollTrigger, scrubbed, transform-only). The frame never reloads — it reads as one physical device whose screen swaps.
- Atmosphere shift: as each section enters, the Three.js particle field + a full-screen CSS radial gradient overlay tween to that project's tint color over 800ms. Use HSL interpolation in JS for the particle color (never lerp through muddy RGB midpoints). Gradient overlay opacity stays ≤ 0.12 — atmosphere, never wash.

## Left-side template (exact copy per project below):
```
[eyebrow] PROJECT 01 — EDTECH SAAS
[Project name — DM Serif, large]
[one-line description]

[metric chips — JetBrains Mono pills]
[tech pills — smaller, --text-dim]

[View live →]   (opens in new tab)
```

### Project 01 — CATalyst
- Eyebrow: `PROJECT 01 — EDTECH SAAS · REVENUE-GENERATING`
- One-liner: `A mistake-fixing system for CAT exam aspirants. Not a practice app — a system that catches your repeated errors and forces you to fix them.`
- Metrics: `30 days of iteration` · `68 commits` · `20+ deploys` · `LIVE ● with paying users`
- Tech pills: Vanilla JS SPA · Supabase · Vercel Serverless · Web Push · PWA · GSAP
- Link: https://catalyst-app-six.vercel.app
- Video: assets/videos/catalyst.mp4 (laptop frame)

### Project 02 — GharKhata
- Eyebrow: `PROJECT 02 — FINTECH PWA · OFFLINE-FIRST`
- One-liner: `A shared expense app for couples — works fully offline, syncs when you're back. Built in 2 days.`
- Metrics: `2 days idea → live` · `Offline-first sync engine` · `13 unit tests` · `LIVE ●`
- Tech pills: React 18 · TypeScript · Vite · Dexie/IndexedDB · Supabase · Recharts
- Link: https://gharkhata.vercel.app
- Video: assets/videos/gharkhata.mp4 (phone frame)

### Project 03 — PitchReady
- Eyebrow: `PROJECT 03 — SPORTS TECH · SSR`
- One-liner: `A cricket performance tracker — training, matches, fitness and mindset in one place. Scaffolded to deployed in 1 day.`
- Metrics: `1 day to ship` · `6 tracked domains` · `Server-side auth` · `LIVE ●`
- Tech pills: Next.js 16 · React 19 · Supabase SSR · Tailwind 4 · PWA
- Link: https://pitchready-app.vercel.app
- Video: assets/videos/pitchready.mp4 (phone frame)

### Project 04 — Postroom Studio
- Eyebrow: `PROJECT 04 — BRAND & WEB DESIGN`
- One-liner: `Full brand identity and marketing site for a video-editing studio — designed, written, and shipped solo. Twice.`
- Metrics: `2 complete design iterations` · `Zero dependencies` · `Custom cursor + motion system` · `LIVE ●`
- Tech pills: Single-file HTML/CSS/JS · Custom rAF cursor · IntersectionObserver reveals · Design tokens
- Link: (Postroom Vercel URL — leave an obvious constant in main.js to fill)
- Video: assets/videos/postroom.mp4 (laptop frame)

## LIVE dot
Every "LIVE ●" uses --live with a 2s CSS pulse (scale + opacity ring).

## Mobile project sections
- Stack: details above, device below (phone frame full-width; laptop videos letterboxed inside a simple browser-chrome frame).
- No screen-slide scrub; simple fade-in per section (IntersectionObserver, once).
- Atmosphere: CSS gradient tint shift only (no Three.js particles on mobile).

---

# 7. SERVICES — "EVERY SCREEN" (expanded section)

## 7a. Device constellation (desktop)
Section opens with a Three.js constellation rendered in the shared scene, viewport-scissored to this section's canvas area (~70vh):
- Five device meshes built from simple box/plane primitives with emissive screen planes: MacBook (back-left), iPhone (front-right), Android phone (front-left), iPad (back-right, landscape), Windows laptop (back-center).
- All five screens display the SAME animated texture: a CanvasTexture running a tiny dashboard animation (a bar chart bar rising, a notification dot appearing) — drawn on an offscreen 2D canvas, updated ~12fps, shared by all five materials. One texture, five screens — proves "one idea, every screen" literally.
- Depth of field feel: front devices full opacity/sharp; back devices material opacity 0.55 (cheap DoF illusion — do NOT use postprocessing bokeh).
- The whole constellation slowly orbits a center point (60s full revolution) + camera parallax with mouse (same lerp system as hero).

Text above constellation (eyebrow): `WEB · iOS · ANDROID · MAC · WINDOWS`
Text below (DM Serif, large): `One idea. Every screen.`

## Mobile 7a
Replace constellation with a horizontal snap-scroll of three CSS device frames (phone / laptop / tablet), each with the same CSS-animated mini dashboard. No Three.js.

## 7b. Six service tiles (3×2 grid desktop, 1-col mobile)
Each tile: --surface background, hairline border, 14px radius, 28px padding.
Tile anatomy top→bottom: [mini 3D object] [service name, Inter 600 1.15rem] [one line, --text-dim] [platform pills] — and a CSS micro-demo strip (height 84px) at the bottom that plays on hover (desktop) / autoplays slowly (mobile).

**Mini 3D objects — ONE shared WebGL context, scissor rendering:** all six miniature objects live in the single shared Three.js scene; each tile declares a viewport rect; renderer uses setScissorTest(true) and renders each object into its tile's rect each frame. NEVER create six renderers. Objects are simple wireframe/emissive primitives, slow Y-rotation (0.004 rad/frame):

1. **Web Apps** — wireframe browser-window (rounded box + top bar bar)
   Copy: `Full-stack products that run in any browser.`
   Pills: Web · Desktop · Tablet
   Micro-demo: dashboard assembles — sidebar slides in, header drops, chart bars rise, notification dot pops.
2. **Mobile Apps** — extruded phone silhouette with visible depth
   Copy: `Native iOS and Android. App Store ready. Built with React Native + Expo.`
   Pills: iOS · Android
   Micro-demo: splash screen → home screen with bottom tab bar → push notification slides from top.
3. **Desktop Apps** — laptop form, lid at 110°
   Copy: `Mac and Windows. Installs like a real application. Electron or Tauri.`
   Pills: Mac · Windows
   Micro-demo: desktop window with traffic-light buttons opens → resizes → menu drops.
4. **AI-Powered Products** — 7-node mini network, a light pulse travels edge to edge
   Copy: `Tools that think. Claude API, OpenAI, custom AI workflows built in.`
   Pills: Web · iOS · Android
   Micro-demo: chat bubble appears → response streams in character-by-character → loops.
5. **Full SaaS Products** — three stacked planes that separate and rejoin (frontend/backend/database)
   Copy: `Auth, payments, dashboards, user management. The complete product.`
   Pills: Web · Mobile
   Micro-demo: login → dashboard → settings → payment modal → success tick, 6s loop.
6. **Landing Pages + Motion** — a plane whose corner curls up and settles
   Copy: `Scroll animations, 3D, conversion-focused. The kind of site people screenshot.`
   Pills: Web
   Micro-demo: hero text rises, image sharpens from blur, CTA pulses once.

All micro-demos: pure CSS keyframes on tiny DOM elements (no canvas, no JS timers beyond play/pause class toggles). Hover (desktop): demo plays + tile lifts (translateY(-4px), shadow). Mobile: demos run on slow loop when tile is in viewport (IntersectionObserver toggles a class).

## 7c. Closing line under the grid
`Don't see exactly what you need? → Describe it anyway.` — links (smooth scroll) to the Idea Form. The arrow nudges right on hover.

---

# 8. THE 7-DAY PROCESS (horizontal timeline)

Seven columns across content width (desktop). Each column: Day number (JetBrains Mono, large, --text-dim) on top, 2–3 ship items below (0.9rem).

EXACT content:
- Day 1 — Scope locked · Repo + infra setup · Database schema
- Day 2 — Auth + core data layer · First deploy (yes, day 2)
- Day 3 — Core feature build
- Day 4 — Core feature complete · Internal testing
- Day 5 — Second feature + edge cases
- Day 6 — Design polish · Mobile pass · Speed pass
- Day 7 — Final review with you · DEPLOYED

A 2px line connects dots at the base of each column. ScrollTrigger scrub: the line draws left→right as the section crosses the viewport; ~12 tiny amber particles trail the line's head (rendered in the shared Three.js scene, screen-projected) like welding sparks, fading fast. When the line completes: a --live pulsing dot + label `DEPLOYED ●` appears at the end.

Mobile: vertical timeline (dots on the left rail, content right), line draws top→down on scroll, no particles.

---

# 9. TECH GRAPH — force-directed (desktop) / grid (mobile)

Desktop: a 60vh panel. In the shared Three.js scene: ~18 nodes (glowing spheres, size by usage weight) with line connections for technologies used together in the same project.

Nodes & key links (build adjacency from this):
- Supabase (largest — connects to almost everything)
- React, TypeScript, Next.js, Vite, Tailwind, Vanilla JS, Node/Serverless, PWA, Web Push, IndexedDB/Dexie, GSAP, Three.js, Razorpay/UPI, Recharts, KaTeX, Playwright/Vitest, Vercel
- Simple physics: spring force on links, repulsion between nodes, gentle centering force; integrate per-frame (no physics lib). Whole graph slowly rotates (60s/rev).
- Hover node: scale 1.3×, connected lines brighten to --accent, tooltip `Used in: CATalyst, GharKhata` (small DOM tooltip following cursor).

Mobile: replace entirely with a clean 4-column logo/text grid of the same technologies (no Three.js).

---

# 10. IDEA FORM (lead engine — NO AI API)

Section background --bg-warm. Centered, max-width 640px.

Headline (DM Serif): 
```
Describe your idea.
I'll tell you what's buildable.
```
Subline (--text-dim, 0.95rem):
`Personally reviewed — no AI, no template. A real answer, usually within a few hours.`

Fields (stacked, generous 16px padding, --surface bg, hairline borders, labels as eyebrows):
1. `THE IDEA` — textarea, 3 rows, placeholder: "A booking tool for my coaching business…"
2. `WHO IT'S FOR` — input, placeholder: "Fitness coaches with 1:1 clients"
3. `YOUR NAME` — input, placeholder: "So I know who I'm replying to"

Button: full-width WhatsApp-green pill — `Get my free MVP plan →`

On submit (form.js):
- Validate non-empty idea.
- Build message: `Hi Sahil! I have a product idea.%0A%0AIdea: {idea}%0AWho it's for: {who}%0AName: {name}%0A%0ACan you tell me what it would take to build?`
- `window.open('https://wa.me/917080442040?text=' + encodeURIComponent(...))`
- Replace form with success state: `✓ Opening WhatsApp…` + `I'll review your idea and send you a custom build plan — usually within 2–3 hours.`
- Play ping.mp3 if sound is on.

Ambient detail (desktop only): while any field is focused, ~10 amber particles in the shared scene drift gently toward that field's screen position. Subtle — opacity ≤ 0.35.

Faint key-tap sound on keydown in fields ONLY if sound toggle is on (volume 0.04, throttled to max 1 sound per 90ms).

---

# 11. FINAL CTA (100vh) + FOOTER

Centered, nothing else on screen:
```
Your idea deserves
to exist.
```
(DM Serif, largest scale on the page.) Below: large WhatsApp pill `Start your build →` + small text link `or sahilsolankey1009@gmail.com`.
Background: the hero terrain remains visible; particle drift speed ×1.6 in this section (energy rising).

Footer (compact, hairline top border): `© 2026 Sahil Solankey` · links: LinkedIn (https://www.linkedin.com/in/sahil-solankey-3aa7b2188) · GitHub (github.com/PoisonOps) · `Built by me, obviously.` (JetBrains Mono, --text-dim — the one allowed wink.)

Floating WhatsApp button: a 52px circular --whatsapp button (chat icon), fixed bottom-right 24px, appears after 20s on page OR 50% scroll (whichever first), gentle scale-in. Hidden while final CTA section is in view (redundant there). Visible on mobile too.

---

# 12. PERFORMANCE, FALLBACKS, ACCESSIBILITY (hard requirements)

1. **ONE WebGL context total.** One fixed full-screen `<canvas>`, one renderer. Section visuals (hero terrain/particles, constellation, tile minis, graph, spark trail) are groups within ONE scene, rendered via scissor rects mapped to their DOM sections. Groups outside the viewport are `visible = false` (IntersectionObserver) — zero draw cost when off-screen.
2. **Frame budget:** target 60fps desktop. Cap pixelRatio at min(devicePixelRatio, 2). Total particles on screen at once ≤ 200. No postprocessing passes. No shadows except nothing — fake all lighting with emissive + opacity.
3. **Mobile (≤1023px or any touch device): Three.js NEVER initializes.** Detect via matchMedia + pointer:coarse. All specified CSS fallbacks apply. The site must feel equally designed — not "degraded."
4. **`prefers-reduced-motion: reduce`:** kill marquee animation (static text), all GSAP scrubs become instant reveals, Three.js renders one static frame (no rAF loop), videos show poster frames with a play affordance.
5. **Videos:** lazy-load via IntersectionObserver (`preload="none"`, swap in src when near viewport), `muted playsinline loop autoplay`, each ≤ 2.5MB target (note for Sahil's encoding, not enforceable in code).
6. **Audio:** nothing loads until the sound toggle is first enabled (Howler instances created on first toggle). Respect autoplay policies — ambient starts only from that user gesture.
7. **Fonts:** `display=swap`, preconnect to fonts.googleapis.com/gstatic.
8. **Accessibility:** semantic landmarks (header/nav/main/section/footer), one h1 (hero headline), visible :focus-visible rings (--accent, 2px offset), all interactive elements reachable by keyboard, form labels properly associated, alt text on any imagery, color contrast ≥ 4.5:1 for body text (the chosen palette passes).
9. **SEO/meta:** title `Sahil Solankey — I build products in 7 days`; meta description `Full-stack developer & AI engineer. Four live products shipped solo. Web, mobile, desktop, AI — idea to deployed in 7 days.`; OG/Twitter tags pointing to /assets/og-image.png; favicon (simple "SS" monogram SVG, generate it).
10. **No console errors, no 404s, Lighthouse mobile ≥ 85 performance** with placeholders in place.

---

# 13. ASSETS SAHIL RECORDS LATER (build with placeholders now)

4 screen recordings, each an 8-second loop of the single most impressive flow, 60fps, 2× resolution, exported H.264 MP4 ≤ 2.5MB:
- catalyst.mp4 — Fix Mode Phase 1 → 2 transition (laptop, 16:10 crop)
- gharkhata.mp4 — adding an expense → balance updates (phone, 9:19.5 crop)
- pitchready.mp4 — logging a training session (phone)
- postroom.mp4 — scrolling the Postroom site's hero + work section (laptop)

5 audio files (royalty-free, quiet): ambient.mp3 (low room/server hum, 30s seamless loop), hover.mp3 (soft 80ms click), whoosh.mp3 (200ms air), type.mp3 (single faint key tap), ping.mp3 (soft notification). Build with silent/no-op fallbacks if files are absent.

---

# 14. BUILD ORDER & SELF-QA (Claude Code: follow exactly)

Build order: tokens/base CSS → marquee + nav + cursor → hero (DOM + Three.js terrain/particles) → proof strip → project sections (incl. screen-slide + color shifts) → services (constellation + tiles + scissor minis) → process timeline → tech graph → idea form → final CTA + footer + floating button → sound system → reduced-motion + mobile passes → QA.

QA checklist before declaring done:
- [ ] Resize 320px → 1920px: no horizontal scroll, no overlap, no clipped text
- [ ] Touch device emulation: zero WebGL initialized, CSS fallbacks present and polished
- [ ] All 4 project links + 3 WhatsApp entry points open correct URLs
- [ ] Form submit opens WhatsApp with correctly encoded message; success state renders; empty-idea blocked with inline hint (not alert())
- [ ] prefers-reduced-motion verified
- [ ] Sound: page silent until toggle; toggle state persists on reload
- [ ] Scroll the full page twice: stable 60fps desktop (no jank in project transitions)
- [ ] Lighthouse mobile run noted in final summary

When complete: summarize what was built, list the placeholder assets awaiting Sahil's files, and give the exact `vercel` deploy steps.

---
END OF SPECIFICATION


Your name IS the brand. The entire site concept — personal replies, "I'll tell you what's buildable," founder trust — collapses if it's hidden behind an agency name. Don't invent a "DevStudio" type name.
Vercel project name: sahilsolankey

Clean URL: sahilsolankey.vercel.app — readable, professional, no "-app-six" mess like CATalyst got.
Website title (browser tab / SEO):
Sahil Solankey — I build products in 7 days
The name for recognition, the claim for memory. Someone with 12 tabs open sees "...products in 7 days" and knows which tab you are.
On the site itself the identity is just Sahil Solankey in the nav — the spec already handles this.
Later, when money exists: sahilsolankey.com or sahil.build (~₹700-1500/yr). The .build one is genuinely good for what you do — but that's a post-first-client purchase, same rule as the CATalyst domain.
Deploy as sahilsolankey. Done. Now 