import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root = new URL('../dist/', import.meta.url);
const mounts = ['dashboard', 'areas', 'districts', 'gaps', 'donut', 'map', 'timeline'];
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
  for (const mount of mounts) assert(ids.includes(`island-${mount}`), `${file}: ${mount} mount`);
  for (const [, attr] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(?:https?:|data:|mailto:|tel:|\/\/)/.test(attr)) continue;
    if (attr.startsWith('#')) {
      if (attr.length > 1) assert(ids.includes(attr.slice(1)), `${file}: unresolved ${attr}`);
      continue;
    }
    await access(new URL(attr.split('#')[0], url));
  }
  console.log(`${file}: data, islands, IDs, anchors and local assets OK`);
}
for (const privatePath of ['reference/', 'islands/', '.git/']) {
  let present = false;
  try { await access(new URL(privatePath, root)); present = true; } catch {}
  assert(!present, `${privatePath} must not be published`);
}
console.log('Publishing boundary OK: reference materials and source code excluded.');
