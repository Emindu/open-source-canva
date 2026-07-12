// Verifies gradient/pattern/blend/shadow at the Fabric v6 layer.

import { StaticCanvas, Rect, Textbox, Gradient, Shadow } from 'fabric/node';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

console.log('\n== Gradient / Pattern / Blend / Shadow ==\n');

const canvas = new StaticCanvas(null, { width: 400, height: 300 });

console.log('1) Linear gradient on shape:');
const rect = new Rect({ left: 10, top: 10, width: 200, height: 100, fill: '#000' });
canvas.add(rect);
const linear = new Gradient({
  type: 'linear',
  gradientUnits: 'percentage',
  coords: { x1: 0, y1: 0, x2: 1, y2: 0 },
  colorStops: [
    { offset: 0, color: '#ff6b6b' },
    { offset: 1, color: '#feca57' },
  ],
});
rect.set('fill', linear);
canvas.renderAll();
expect(rect.fill?.type === 'linear', `rect.fill.type = "linear" (got "${rect.fill?.type}")`);
expect(Array.isArray(rect.fill?.colorStops) && rect.fill.colorStops.length === 2, '2 colorStops');
expect(rect.fill?.colorStops[0].color === '#ff6b6b', 'stop 0 color preserved');

console.log('\n2) Radial gradient on text:');
const text = new Textbox('Gradient', { fontSize: 30, left: 20, top: 150 });
canvas.add(text);
const radial = new Gradient({
  type: 'radial',
  gradientUnits: 'percentage',
  coords: { x1: 0.5, y1: 0.5, r1: 0, x2: 0.5, y2: 0.5, r2: 0.5 },
  colorStops: [
    { offset: 0, color: '#7c5cff' },
    { offset: 1, color: '#4f46e5' },
  ],
});
text.set('fill', radial);
expect(text.fill?.type === 'radial', `text.fill.type = "radial"`);

console.log('\n3) Blend mode via globalCompositeOperation:');
rect.set('globalCompositeOperation', 'multiply');
expect(rect.globalCompositeOperation === 'multiply', 'multiply set');
rect.set('globalCompositeOperation', 'source-over');
expect(rect.globalCompositeOperation === 'source-over', 'reset to normal');

console.log('\n4) Shadow on shape:');
rect.set('shadow', new Shadow({ color: 'rgba(0,0,0,0.5)', blur: 10, offsetX: 5, offsetY: 5 }));
expect(rect.shadow?.blur === 10, 'shape shadow blur preserved');
expect(rect.shadow?.offsetX === 5, 'shape shadow offsetX preserved');

console.log('\n5) Shadow on image works the same (universal FabricObject property):');
// StaticCanvas + FabricImage requires actual image loading; just verify the API surface exists
expect(typeof rect.shadow === 'object' && rect.shadow !== null, 'shadow is an object on FabricObject');

console.log('\n6) JSON roundtrip preserves gradient, blend, and shadow:');
const json = JSON.stringify(canvas.toJSON());
const c2 = new StaticCanvas(null, { width: 400, height: 300 });
await c2.loadFromJSON(JSON.parse(json));
const [r2, t2] = c2.getObjects();
expect(r2.fill?.type === 'linear', 'rect fill still linear after roundtrip');
expect(r2.fill?.colorStops?.[0]?.color === '#ff6b6b', 'stop color survived roundtrip');
expect(r2.shadow?.blur === 10, `shape shadow blur roundtrip (got ${r2.shadow?.blur})`);
expect(t2.fill?.type === 'radial', 'text radial gradient roundtrip');

console.log('\n7) Angle→coords math (0° = left→right, 90° = top→bottom):');
const angleToCoords = (deg) => {
  const rad = (deg * Math.PI) / 180;
  const dx = Math.cos(rad) * 0.5;
  const dy = Math.sin(rad) * 0.5;
  return { x1: 0.5 - dx, y1: 0.5 - dy, x2: 0.5 + dx, y2: 0.5 + dy };
};
const g0 = angleToCoords(0);
expect(Math.abs(g0.x1 - 0) < 0.01 && Math.abs(g0.x2 - 1) < 0.01, `0°: horizontal (x1=${g0.x1.toFixed(2)}, x2=${g0.x2.toFixed(2)})`);
const g90 = angleToCoords(90);
expect(Math.abs(g90.y1 - 0) < 0.01 && Math.abs(g90.y2 - 1) < 0.01, `90°: vertical (y1=${g90.y1.toFixed(2)}, y2=${g90.y2.toFixed(2)})`);

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All checks passed\n');
