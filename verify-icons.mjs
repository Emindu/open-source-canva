// Verifies fabric.loadSVGFromString round-trips a lucide-style SVG.

import * as fabric from 'fabric/node';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

// This is exactly the shape lucide-react's <Heart /> component emits
// when rendered via renderToStaticMarkup with size=96, color='#111827', strokeWidth=2.
const HEART_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>`;

console.log('\n== fabric.loadSVGFromString with lucide-style icon ==\n');

const parsed = await fabric.loadSVGFromString(HEART_SVG);
expect(Array.isArray(parsed.objects), 'result has objects array');
const nonNull = (parsed.objects || []).filter(Boolean);
expect(nonNull.length > 0, `at least one object parsed (got ${nonNull.length})`);
expect(!!parsed.options, 'result has options');

console.log('\n== groupSVGElements → single Fabric object ==\n');
const group = fabric.util.groupSVGElements(nonNull, parsed.options);
expect(group !== null && group !== undefined, 'group produced');
expect(group.width && group.width > 0, `group has width ${group.width}`);
expect(group.height && group.height > 0, `group has height ${group.height}`);

console.log('\n== Add to canvas, serialize, restore ==\n');
const canvas = new fabric.StaticCanvas(null, { width: 400, height: 400 });
group.set({ left: 50, top: 50, scaleX: 2, scaleY: 2 });
canvas.add(group);
canvas.renderAll();
expect(canvas.getObjects().length === 1, 'added to canvas');

const json = JSON.stringify(canvas.toJSON());
const c2 = new fabric.StaticCanvas(null, { width: 400, height: 400 });
await c2.loadFromJSON(JSON.parse(json));
expect(c2.getObjects().length === 1, 'roundtrip preserved the icon');

console.log('\n== Multi-shape SVG (like some lucide icons: line + path + circle) ==\n');
const MULTI_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
const parsed2 = await fabric.loadSVGFromString(MULTI_SVG);
const objs2 = (parsed2.objects || []).filter(Boolean);
expect(objs2.length >= 2, `multi-shape parsed: ${objs2.length} objects (circle + path)`);
const g2 = fabric.util.groupSVGElements(objs2, parsed2.options);
expect(!!g2, 'multi-shape group produced');

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All checks passed\n');
