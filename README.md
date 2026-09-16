# Balaton Jó Hely Index — redesign

The Hungarian and English research site, redesigned in the existing static HTML + React islands architecture. The palette is deep teal `#0E4A57`, mist `#E4EFF1`, clay `#B5562F`, and white. The survey text and embedded datasets are retained from the supplied redesign branch.

## Local preview

```sh
npm --prefix islands ci
npm run build
npm run check
npm run preview
```

Open http://127.0.0.1:4187/ (Hungarian) or http://127.0.0.1:4187/en/ (English). If another server uses that port, choose a different port with `python3 -m http.server PORT --directory dist`.

## Files

- `index.html`, `en/index.html`: language editions and original survey data.
- `assets/base.css`: shared styles extracted unchanged from both original HTML files.
- `assets/editorial.css`, `assets/editorial.js`: the new layout and navigation behavior.
- `islands/src`: existing React/TypeScript components, including the 21st.dev components, charts and Leaflet map.
- `assets/islands.js`, `assets/islands.css`: compiled islands, committed for static hosting.
- `scripts/build-site.mjs`: builds a public-only `dist` folder. It excludes `reference`, source files and Git history.

## Deployment

Production (balatonjohelyindex.hu) is deployed by Netlify from the `main` branch of **Europeanbeat/johely** — the original repo, which has no build step and serves the committed files. Every push to that branch costs a deploy (15 credits on the free plan), so never push there without the owner's explicit instruction. **Europeanbeat/johely-redesign** is the design work-in-progress repo and is not connected to Netlify; its `netlify.toml` (islands build, publishes `dist`) only applies if the owner ever connects this repo. Before merging this branch into the production repo, decide whether to keep that `netlify.toml` or delete it.

The subscription form (`ertesites/`, `en/notify/`, and the contact section of both landing pages) uses Netlify Forms with an AJAX submit and a honeypot field; it only works on Netlify. Do not submit test addresses on the live site. The imprint and privacy links are still placeholders; `reference/HANDOFF.md` lists the remaining open items.

## Checks

`npm run check` checks the built language editions, expected survey dimensions, respondent totals, mount points, local assets, IDs, internal anchors and the public-only output boundary. Manual browser checks cover mobile navigation, locale switching, result expansion, district selection and FAQ disclosure.
