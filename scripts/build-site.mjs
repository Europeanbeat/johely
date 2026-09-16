import { cp, mkdir, rm } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const out = new URL('dist/', root);
await rm(out, { recursive: true, force: true });
for (const d of ['en/notify/', 'ertesites/', 'docs/']) await mkdir(new URL(d, out), { recursive: true });
for (const path of ['index.html', 'en/index.html', 'ertesites/index.html', 'en/notify/index.html', 'assets', 'docs']) {
  await cp(new URL(path, root), new URL(path, out), { recursive: true });
}
console.log('Built dist/: HU, EN, form pages, PDFs and public assets only.');
