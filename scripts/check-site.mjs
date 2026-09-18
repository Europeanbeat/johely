import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
const stripScripts = (html) => html.replace(/<script\b[\s\S]*?<\/script>/g, '');
const root = new URL('../dist/', import.meta.url);
for (const file of ['index.html', 'en/index.html']) {
  const url = new URL(file, root);
  const html = await readFile(url, 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${file}: one main heading`);
  const data = JSON.parse(html.match(/<script id="adat" type="application\/json">(.*?)<\/script>/s)[1]);
  assert.equal(data.index, 64);
  assert.equal(data.alindexek.length, 8);
  assert.equal(data.jarasok.filter(d => d.valid).length, 7);
  assert.equal(Object.values(data.csoportN).reduce((a, b) => a + b, 0), data.valaszok);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, `${file}: no duplicate IDs`);
  for (const [, attr] of stripScripts(html).matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|data:|mailto:|tel:|\/\/)/.test(attr)) continue;
    if (attr.startsWith('#')) {
      if (attr.length > 1) assert(ids.includes(attr.slice(1)), `${file}: unresolved ${attr}`);
      continue;
    }
    await access(new URL(attr.split(/[?#]/)[0], url));
  }
  console.log(`${file}: data, IDs, anchors and local assets OK`);
}
for (const pdf of ['docs/balaton-jo-hely-index-2026.pdf', 'docs/balaton-jo-hely-index-2026-vezetoi-osszefoglalo.pdf']) await access(new URL(pdf, root));
{
  const html = await readFile(new URL('index.html', root), 'utf8');
  const files = [...html.matchAll(/docs\/jarasok\/([\w.-]+\.pdf)/g)].map(m => m[1]);
  assert.equal(new Set(files).size, 7, 'seven district summaries linked');
  for (const f of new Set(files)) await access(new URL('docs/jarasok/' + f, root));
  console.log('Documents OK: study, executive summary and seven district summaries.');
}
for (const privatePath of ['reference/', 'scripts/', '.git/']) {
  let present = false;
  try { await access(new URL(privatePath, root)); present = true; } catch {}
  assert(!present, `${privatePath} must not be published`);
}
for (const page of ['adatkezeles/index.html', 'en/privacy/index.html', 'ertesites/index.html', 'en/notify/index.html']) {
  const html = await readFile(new URL(page, root), 'utf8');
  for (const [, attr] of stripScripts(html).matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|data:|mailto:|tel:|#|\/\/)/.test(attr)) continue;
    await access(new URL(attr.split(/[?#]/)[0], new URL(page, root)));
  }
  console.log(`${page}: local links OK`);
}
console.log('Publishing boundary OK: reference materials and source code excluded.');
