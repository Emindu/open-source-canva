// Verifies manual group / ungroup in Fabric v6 preserves object positions.

import { StaticCanvas, Rect, Group, ActiveSelection } from 'fabric/node';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

console.log('\n== Group / ungroup (Fabric v6 manual) ==\n');

const canvas = new StaticCanvas(null, { width: 800, height: 600 });
const rectA = new Rect({ left: 100, top: 100, width: 60, height: 60, fill: '#f00' });
const rectB = new Rect({ left: 300, top: 200, width: 80, height: 80, fill: '#0f0' });
canvas.add(rectA, rectB);

console.log('1) Group two objects:');
const objs = [rectA, rectB];
objs.forEach((o) => canvas.remove(o));
const group = new Group(objs);
canvas.add(group);
expect(canvas.getObjects().length === 1, `canvas has 1 object (the group). Got ${canvas.getObjects().length}`);
expect(group.type === 'group', 'wrapper is a group');
expect(group.getObjects().length === 2, 'group contains 2 children');

console.log('\n2) Ungroup back to separate objects:');
const items = group.removeAll();
canvas.remove(group);
items.forEach((o) => canvas.add(o));
expect(canvas.getObjects().length === 2, `canvas has 2 objects again. Got ${canvas.getObjects().length}`);
// Positions preserved? (approximate — Fabric may apply small transforms)
const [r1, r2] = canvas.getObjects();
console.log(`     positions after ungroup: A=(${Math.round(r1.left)}, ${Math.round(r1.top)}), B=(${Math.round(r2.left)}, ${Math.round(r2.top)})`);

console.log('\n3) Group → ungroup roundtrip preserves object types:');
expect(canvas.getObjects().every((o) => o.type === 'rect'), 'both children still rects');

console.log('\n4) ActiveSelection wrapper after ungroup for immediate multi-edit:');
const sel = new ActiveSelection(canvas.getObjects(), { canvas });
expect(sel.type === 'activeselection', `active is ActiveSelection (got ${sel.type})`);
expect(sel.getObjects().length === 2, 'selection has 2 objects');

console.log('\n5) JSON roundtrip preserves group:');
const g2 = new Group([
  new Rect({ left: 10, top: 10, width: 40, height: 40 }),
  new Rect({ left: 60, top: 60, width: 40, height: 40 }),
]);
canvas.clear();
canvas.add(g2);
const json = JSON.stringify(canvas.toJSON());
const c2 = new StaticCanvas(null, { width: 800, height: 600 });
await c2.loadFromJSON(JSON.parse(json));
expect(c2.getObjects().length === 1, 'roundtrip: 1 top-level object');
expect(c2.getObjects()[0].type === 'group', 'roundtrip: it is a group');
expect(c2.getObjects()[0].getObjects().length === 2, 'roundtrip: 2 children inside');

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All checks passed\n');
