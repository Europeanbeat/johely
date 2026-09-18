// Keeps the shared page shell in sync: the header, the partner logo band and the footer are
// authored once on index.html (HU) and en/index.html (EN); every other page gets the same markup
// with its own relative paths. Run: npm run sync
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = (p) => readFile(new URL(p, root), 'utf8');
const block = (html, start, end) => html.match(new RegExp(start + '[\\s\\S]*?' + end))[0];

const PAGES = [
  { file: 'ertesites/index.html', from: 'index.html', up: '../', cta: '#ertesites', lang: { href: '../en/notify/index.html', code: 'en', title: 'English version', label: 'EN' } },
  { file: 'adatkezeles/index.html', from: 'index.html', up: '../', cta: '../ertesites/index.html', lang: { href: '../en/privacy/index.html', code: 'en', title: 'English version', label: 'EN' } },
  { file: 'en/notify/index.html', from: 'en/index.html', up: '../', cta: '#ertesites', lang: { href: '../../ertesites/index.html', code: 'hu', title: 'Magyar változat', label: 'HU' } },
  { file: 'en/privacy/index.html', from: 'en/index.html', up: '../', cta: '../notify/index.html', lang: { href: '../../adatkezeles/index.html', code: 'hu', title: 'Magyar változat', label: 'HU' } },
];

for (const page of PAGES) {
  const src = await read(page.from);
  const isEn = page.from.startsWith('en/');
  const depth = page.up;
  const fix = (html) => html
    .replace(/href="#([a-z-]+)"/g, (m, id) => `href="${depth}index.html#${id}"`)
    .replace(/(href|src)="(\.\.\/)?(assets|docs)\//g, (m, attr, rel, dir) => `${attr}="${depth}${rel ?? ''}${dir}/`)
    .replace(/href="(\.\.\/)?(ertesites|notify)\/index\.html"/g, () => `href="${page.cta}"`)
    .replace(/href="(adatkezeles|privacy)\/index\.html"/g, (m, dir) => `href="${depth}${dir}/index.html"`)
    .replace(/<a class="lang"[^>]*>[A-Z]+<\/a>/, `<a class="lang" href="${page.lang.href}" hreflang="${page.lang.code}" lang="${page.lang.code}" title="${page.lang.title}">${page.lang.label}</a>`);

  const header = fix(block(src, '<header class="top">', '</header>'));
  const shell = fix(block(src, '<div class="logoband"', '</footer>')).replace('href="#top"', `href="${depth}index.html"`);

  let out = await read(page.file);
  out = out.replace(block(out, '<header class="top">', '</header>'), header);
  out = out.replace(block(out, '<div class="logoband"', '</footer>'), shell);
  await writeFile(new URL(page.file, root), out);
  console.log(`${page.file}: header, logo band and footer synced from ${page.from}`);
}
