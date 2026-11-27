// Deploy-pipeline gate: assert the admin loadBundled slice of data.js is strict JSON.
// Run before any deploy that touches data.js. Exit 1 (fail) blocks the publish.
// Usage: node datajs-json-gate.js [path-to-data.js]   (default: /downloads/app-repo/data.js)
const fs = require('fs');
const p = process.argv[2] || '/downloads/app-repo/data.js';
const t = fs.readFileSync(p, 'utf8');
const i = t.indexOf('{'); const j = t.indexOf('};', i);
if (i < 0 || j < 0) { console.error('GATE FAIL: no object slice found'); process.exit(1); }
const slice = t.slice(i, j + 1);
try {
  const d = JSON.parse(slice);
  if (!d || !Array.isArray(d.grades)) throw new Error('no grades array');
  console.log('GATE PASS: slice is strict JSON; grades=' + d.grades.length + ' (' + d.grades.map(g => g.id).join(',') + '); slice=' + slice.length + ' chars; file=' + p);
} catch (e) {
  console.error('GATE FAIL: extracted object is not strict JSON — admin loadBundled (JSON.parse) would fail closed:', e.message);
  process.exit(1);
}
