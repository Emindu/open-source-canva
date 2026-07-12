// Verifies: recent-color list mechanics, comment persistence via toObject roundtrip,
// brand kit shape guards.

import { StaticCanvas, Rect, Textbox } from 'fabric/node';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

/* --- Recent colors math --- */
console.log('\n== Recent colors (dedupe + cap + case-insensitive) ==\n');
const MAX = 12;
const pushRecent = (current, color) => {
  if (!color || typeof color !== 'string') return current;
  const norm = color.toLowerCase();
  const filtered = current.filter((c) => c.toLowerCase() !== norm);
  return [color, ...filtered].slice(0, MAX);
};

let list = [];
list = pushRecent(list, '#7c5cff');
list = pushRecent(list, '#ff0000');
list = pushRecent(list, '#00ff00');
expect(list[0] === '#00ff00', 'most-recent at index 0');

list = pushRecent(list, '#7C5CFF'); // same as first but uppercase
expect(list[0] === '#7C5CFF', 'case-insensitive dedupe: new casing moved to front');
expect(list.length === 3, `no duplicate entry (got ${list.length})`);

// Cap at MAX=12
list = [];
for (let i = 0; i < 20; i++) list = pushRecent(list, `#${i.toString(16).padStart(6, '0')}`);
expect(list.length === MAX, `capped at ${MAX} (got ${list.length})`);
expect(list[0] === '#000013', 'newest at front');

/* --- Comment roundtrip via toObject / loadFromJSON --- */
console.log('\n== Comment persistence via canvas.toObject(EXTRA_PROPS) ==\n');
{
  const canvas = new StaticCanvas(null, { width: 400, height: 300 });
  const rect = new Rect({ left: 20, top: 20, width: 80, height: 80, fill: '#7c5cff' });
  rect.comment = 'Review this shape — is the purple too vivid?';
  const text = new Textbox('Hello', { fontSize: 30, left: 200, top: 100 });
  text.comment = 'Copy needs approval from marketing';
  canvas.add(rect, text);

  // Without EXTRA_PROPS — comments dropped
  const rawJson = JSON.stringify(canvas.toObject());
  const cRaw = new StaticCanvas(null, { width: 400, height: 300 });
  await cRaw.loadFromJSON(JSON.parse(rawJson));
  const anyRawWithComment = cRaw.getObjects().some((o) => !!(o).comment);
  expect(!anyRawWithComment, 'raw toObject() drops the custom "comment" prop');

  // With EXTRA_PROPS — comments preserved
  const richJson = JSON.stringify(canvas.toObject(['comment']));
  const cRich = new StaticCanvas(null, { width: 400, height: 300 });
  await cRich.loadFromJSON(JSON.parse(richJson));
  const objs = cRich.getObjects();
  expect(objs.length === 2, 'both objects restored');
  expect((objs[0]).comment === 'Review this shape — is the purple too vivid?', 'rect comment preserved');
  expect((objs[1]).comment === 'Copy needs approval from marketing', 'text comment preserved');
}

/* --- Brand kit shape --- */
console.log('\n== Brand kit shape ==\n');
{
  const emptyKit = () => ({ colors: [], fonts: [], logos: [] });
  const kit = emptyKit();

  // Add colors
  const addColor = (k, c) => (k.colors.includes(c) ? k : { ...k, colors: [c, ...k.colors].slice(0, 40) });
  let k1 = addColor(kit, '#7c5cff');
  k1 = addColor(k1, '#000000');
  k1 = addColor(k1, '#7c5cff'); // duplicate — should be skipped
  expect(k1.colors.length === 2, `dedupe (got ${k1.colors.length}: ${k1.colors.join(',')})`);
  expect(k1.colors[0] === '#000000', 'newest at front');

  // Cap
  let full = emptyKit();
  for (let i = 0; i < 50; i++) full = addColor(full, `#${i.toString(16).padStart(6, '0')}`);
  expect(full.colors.length === 40, `capped at 40 (got ${full.colors.length})`);
}

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All checks passed\n');
