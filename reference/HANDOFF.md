# Balaton Jó Hely Index – design handoff

Working notes for whoever continues the redesign (human or AI). Everything here is what was actually decided and built up to 2026-09-16.

## Repos and deployment

| What | Where |
|---|---|
| Production site (Netlify auto-deploys `main`) | https://github.com/Europeanbeat/johely |
| This work-in-progress repo (NOT connected to Netlify) | https://github.com/Europeanbeat/johely-redesign |
| Live site | https://balatonjohelyindex.hu (HU) and https://balatonjohelyindex.hu/en/ (EN) |

Rules that must not be broken:

- Netlify free plan: every deploy of the production repo costs 15 credits out of 300. Never push to `Europeanbeat/johely` without the owner's explicit OK. Batch changes.
- The original page text and content must not change. Only the visual elements, layout and components change. This is the owner's most repeated instruction.
- No cream / beige section backgrounds. White base, coloured tiles.
- The 21st.dev components in `islands/src` were paid for and must be used as real React/TypeScript/Tailwind components, not re-drawn in plain CSS.

## Colours (from `index.html` `:root`)

| Token | Hex | Used for |
|---|---|---|
| `--deep` | `#0E4A57` | dark teal tile background, primary, map band 1 |
| `--teal` | `#25758A` | teal text/links (AA on white) |
| `--mid` | `#63A8B5` | map band 2, secondary chart colour |
| `--light` | `#B9D8DC` | map band 3 |
| `--mist` | `#E4EFF1` | grey/mist tile background |
| `--clay` | `#B5562F` | accent tile background, "below 50" values, map band 4 |
| `--clay-text` | `#93421F` | clay as text on white (AA) |
| `--ochre` | `#D9A03C` | selection ring, highlight |
| `--ochre-text` | `#8A5A0F` | ochre as text on white (AA) |
| `--ochre-light` | `#E7B45B` | ochre on dark backgrounds |
| `--paper` | `#FCFCFA` | page background |
| `--card` | `#FFFFFF` | light tile background |
| `--soft` | `#F3F6F5` | very light surface |
| `--line` | `#E2E6E4` | borders, dividers |
| `--ink` | `#122028` | body text |
| `--ink-2` | `#3a4d56` | secondary text |
| `--muted` | `#526469` | muted text (AA on white; the old `#6b8089` failed contrast) |

Tile tones (the pattern the owner likes most): dark `#0E4A57` with white text, mist `#E4EFF1` with ink text, clay `#B5562F` with white text, white with a `#E2E6E4` border. Every tile: pill label top-left (full-width outlined pill), big number bottom-left, one-line description bottom-right, 24px radius.

## Fonts

- Body: **Manrope** 400–800 (Google Fonts).
- Headings and big numbers: **DM Sans** 400–700 (Google Fonts), tight tracking (-0.03 to -0.04em), tabular figures for numbers.
- Both loaded from fonts.googleapis.com in the `<head>`. Token `--serif` now points to DM Sans (name is historical).
- Type floor: 13px minimum anywhere, 16px body, WCAG AA contrast everywhere, 44px touch targets.

## Website references used

1. **harrisoncarloss.com** – the main style reference. Owner said "these are good" about the blog pages and asked to use as many of its patterns as possible: https://harrisoncarloss.com/blog/ and the case study https://harrisoncarloss.com/projects/dougie-mac-dementia-campaign/ (section rhythm, big lead sentences, tile grid, pill labels, generous spacing). We keep OUR colours, not theirs.
2. **Dashboard tile grid** – see `screenshots/01-liked-dashboard-tile-grid.png` (the reference) and `screenshots/02-current-dashboard-build.png` (what we built from it). This is the owner's favourite element: mixed-tone tiles, pill label, huge number, short description. Rebuilt as `islands/src/dashboard.tsx` + `tile.tsx`.
3. **Nav bar and white base** – `screenshots/03-nav-and-white-base-reference.png`. Hero must stay white; a strong blue/dark hero was rejected.
4. Editorial data-journalism references discussed (Guardian-style illustrated explainers, John Harris) – inspiration only, nothing copied. `screenshots/04-ridge-illustration-idea.png` is a ridge-line illustration style the owner saved; could work as a hero graphic in our colours.

Rejected (don't bring these back): plain-CSS ports of the paid components, a Next.js rebuild, dark photo hero, radial gauges section for the eight areas ("the worst"), cream backgrounds, too-dark form card, plain scale/tick lines under numbers, tiles of wildly different heights.

## Architecture

Static HTML with React "islands":

- `index.html` (HU) and `en/index.html` (EN). The notification form has its own pages, `ertesites/index.html` (HU) and `en/notify/index.html` (EN), reached from the dark "Értesítést kérek / Notify me" button in the navbar; the landing pages keep only a mist CTA tile that links there. The form pages carry the same Netlify form (`name="ertesites"`). The landing pages also end with the same notification form (`#kapcsolat` section, still `name="ertesites"`) just above the partner logos and footer, so one Netlify form is used in three places. The two PDFs live in `docs/` and are linked from every footer. Section intros are stacked: heading first, lead paragraph under it, never side by side. Data lives in `<script id="adat" type="application/json">`. The page script exposes `window.__J = {MIT, ONE, CS, cleanQ}` and `window.__showJaras`.
- `islands/` – React 19 + Tailwind 4 + framer-motion + recharts + Leaflet, bundled by esbuild. Build: `cd islands && npm install && npm run build` → writes `assets/islands.js` and `assets/islands.css` (both committed; Netlify has no build step).
- Mount points in both HTML files: `#island-dashboard`, `#island-areas`, `#island-districts`, `#island-gaps`, `#island-donut`, `#island-map`, `#island-timeline`.
- Tailwind is scoped: utilities only, tokens under `.tw-island`, no preflight, so it cannot break the page's own CSS.
- Map: Leaflet, Esri World Light Gray tiles (no key), district polygons from Nominatim in `islands/src/data/jarasok.geojson`, lake in `balaton.geojson` drawn on top so districts never cover the water.
- Motion: `islands/src/motion.tsx` (`Reveal`, `CountUp`), page-level `.rv`/`.in` IntersectionObserver rise-in, hero count-up. `prefers-reduced-motion` disables all of it.

Components from 21st.dev and where they are used:

| File | Component | Used in |
|---|---|---|
| `stats-cards-with-links.tsx` | Stats05 (cards with links) | `#island-gaps` |
| `weekly-expense-card.tsx` | donut card | `#island-donut` (conclusions section) |
| `timeline.tsx` | Timeline | `#island-timeline` |
| `circle-progress.tsx` | CircleProgress ring | score rings in the eight area tiles and the seven district tiles (`ScoreRing` in main.tsx) |
| `testimonials.tsx` | testimonial cards (photo removed) | `#island-quotes` in the thanks section; text read from the hidden `.card.quote` |
| `card-10.tsx` | StatCard | currently unused |
| `stats-bento.tsx` | StatsBento | currently unused (replaced by the tile dashboard) |
| `stats-cards-with-links.tsx` | Stats07 radial gauges | rejected, keep unused |

## Open content problems (from `site-review-2026-09-14.html`)

Fix these in the same commit as the next deploy:

- Commissioner name: must be "Magyar Turisztikai Szövetség Alapítvány" (site had "Turizmus").
- Three footer links still point to `#` (Sajtókapcsolat, Impresszum, Adatkezelési tájékoztató). The two PDF links now work.
- Placeholder text "[partnerek felsorolása / logósor — egyeztetés után]" still in the page.
- `og-2026.png` (1200×630 share image) is referenced but missing.
- 13 small factual slips between site copy and the study; district card response counts don't add up to 632 / 246 / 170.
- Hero sentence "a Balaton jó hely — sokkal inkább az, mint nem" contradicts the study's tone (removed with the gauge card in this branch).

## Study facts to keep consistent

Index 2026 = 64,0 (0–100), baseline year, not a grade. Eight areas: Percepció 84,4 · Kínálat 73,6 · Szolgáltatásminőség 68,0 · Versenypozíció 66,1 · Élhetőség 60,1 · Mobilitás 58,1 · Környezet 55,3 · Irányítás 46,7. 1048 valid answers (632 residents, 246 providers, 170 guests). District index for 7 of 11 districts: Keszthelyi 68,3 · Balatonfüredi 67,6 · Fonyódi 66,3 · Veszprémi 64,6 · Balatonalmádi 63,6 · Siófoki 59,9 · Tapolcai 56,5. Not a ranking. 15 of 82 questions below 50. Fixing them would move the index 1,3 points: 41 % local, 32 % national, 27 % regional responsibility.

## Content check, 2026-09-16

Two agent checks were run against the original page text and the study/summary PDFs.
- Every questionnaire number on the site matches the study: 1048 / 632 / 246 / 170 / 34 / 127 / 180 / 11 / 7 / 82 / 27 / 21 / 34, every per-question score and N in the weakest/strongest lists (study pp. 50–58 and 123–126), all sub-index, per-group and district values, the 41/32/27 % split and +0,57/+0,27/+0,37/+0,09.
- Corrected on the site: Siófoki járás blurb ("all eight" areas below the regional value, not seven); parking tile no longer claims the widest district spread of the whole survey (only among resident items); lake-protection tile keeps the summary's qualifier "every district with a resident sample".
- Restored from the original after the redesign dropped or altered them: the "Így készült a mérés" fact band (4 / 180 / 127 / 10), the full "Kinek a kezében" sentence, the 2-point map bands, the original navbar order, the map note wording.
- Known, left as in the original: commitment 04 says parking "járásonként a legszélsőségesebben szór" (study: "az egyik legszélesebb sávban"); the quotes note says "127-en éltek vele" (study: 131 used the open question, 127 substantive). The district `n` values in the JSON sum to 634/252/172 because sub-threshold cells are included; never sum them on the page.
