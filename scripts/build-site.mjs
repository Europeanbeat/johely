import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const out = new URL('dist/', root);
await rm(out, { recursive: true, force: true });
for (const d of ['en/notify/', 'en/privacy/', 'ertesites/', 'adatkezeles/', 'docs/']) await mkdir(new URL(d, out), { recursive: true });
for (const path of ['index.html', 'en/index.html', 'ertesites/index.html', 'en/notify/index.html', 'adatkezeles/index.html', 'en/privacy/index.html', 'assets', 'docs']) {
  await cp(new URL(path, root), new URL(path, out), { recursive: true });
}
// Cache busting: every CSS/JS reference gets ?v=<content hash>, so a deploy never mixes a fresh page with cached old assets
const hashes = {};
const hashOf = async (name) => (hashes[name] ??= createHash('sha1').update(await readFile(new URL('assets/' + name, out))).digest('hex').slice(0, 10));
for (const page of ['index.html', 'en/index.html', 'ertesites/index.html', 'en/notify/index.html', 'adatkezeles/index.html', 'en/privacy/index.html']) {
  const file = new URL(page, out);
  let html = await readFile(file, 'utf8');
  const refs = [...html.matchAll(/((?:\.\.\/)*assets\/([\w.-]+\.(?:css|js)))(?:\?v=[\w]+)?"/g)];
  for (const [whole, path, name] of refs) html = html.replace(whole, `${path}?v=${await hashOf(name)}"`);
  await writeFile(file, html);
}
console.log('Built dist/: HU, EN, form pages, PDFs and public assets only; CSS/JS references cache-busted.');
