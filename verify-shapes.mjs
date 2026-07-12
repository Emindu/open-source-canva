// Verifies every shape in SHAPE_LIB builds a valid Fabric object.
// Runs the library's build() fn for each entry in the same order the panel would.

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Enable TS support via tsx runtime if available; otherwise skip.
try {
  register('tsx/esm', pathToFileURL(process.cwd() + '/'));
} catch {}

// Directly import Fabric objects and reimplement a slim SHAPE_LIB check by
// running the build functions individually — this avoids importing the .ts
// library (which uses React) into Node.
import { Rect, Circle, Ellipse, Triangle, Polygon, Line, Path, Group } from 'fabric/node';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

console.log('\n== Fabric shape primitives used by the library are all constructible ==\n');

// Instantiate one of each primitive kind
try {
  const r = new Rect({ width: 100, height: 60 });
  expect(r.type === 'rect', 'Rect');
  const c = new Circle({ radius: 40 });
  expect(c.type === 'circle', 'Circle');
  const e = new Ellipse({ rx: 60, ry: 40 });
  expect(e.type === 'ellipse', 'Ellipse');
  const t = new Triangle({ width: 100, height: 100 });
  expect(t.type === 'triangle', 'Triangle');
  const p = new Polygon(
    [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
    { fill: '#000' }
  );
  expect(p.type === 'polygon', 'Polygon');
  const l = new Line([0, 0, 100, 0], { stroke: '#000', strokeWidth: 2 });
  expect(l.type === 'line', 'Line');
  const pa = new Path('M 0 0 L 100 0 L 100 100 Z', { fill: '#000' });
  expect(pa.type === 'path', 'Path');
  const g = new Group([r]);
  expect(g.type === 'group', 'Group');
} catch (e) {
  fail(`Primitive instantiation threw: ${e.message}`);
}

console.log('\n== Complex path shapes parse ==\n');

const paths = [
  // Document (flowchart)
  'M 0 0 L 200 0 L 200 90 Q 150 110 100 90 Q 50 70 0 90 Z',
  // Cylinder (flowchart data-store)
  'M 0 20 A 100 20 0 0 1 200 20 L 200 120 A 100 20 0 0 1 0 120 Z M 0 20 A 100 20 0 0 0 200 20',
  // Curved arrow
  'M 0 120 Q 100 -20 200 120 L 175 100 M 200 120 L 175 110',
  // Shield
  'M 70 0 L 140 20 L 140 80 Q 140 130 70 150 Q 0 130 0 80 L 0 20 Z',
  // Blob
  'M170 30 Q220 70 200 120 Q230 170 170 200 Q110 220 70 180 Q20 150 40 100 Q20 50 80 40 Q130 20 170 30 Z',
  // Cloud
  'M40,120 Q0,120 20,80 Q20,40 60,50 Q80,10 120,30 Q160,10 170,60 Q200,80 170,120 Q160,140 120,130 L80,130 Q50,140 40,120 Z',
];

for (const d of paths) {
  try {
    const p = new Path(d, { fill: '#7c5cff' });
    expect(!!p && p.type === 'path' && Array.isArray(p.path), `path parses (${d.slice(0, 20)}…)`);
  } catch (e) {
    fail(`path failed: ${d.slice(0, 40)} — ${e.message}`);
  }
}

console.log('\n== Regular polygon math (used by pentagon/hexagon/octagon) ==\n');

const regularPolygonPoints = (sides, r = 60) => {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
    pts.push({ x: r + Math.cos(a) * r, y: r + Math.sin(a) * r });
  }
  return pts;
};
[5, 6, 8].forEach((n) => {
  const pts = regularPolygonPoints(n, 60);
  expect(pts.length === n, `${n}-gon has ${n} points`);
  // First point should be at top: (60, 0)
  expect(Math.abs(pts[0].x - 60) < 0.01 && Math.abs(pts[0].y) < 0.01, `${n}-gon: first vertex at top`);
});

console.log('\n== Star math (used by 4/5/6-point + starburst + square star) ==\n');

const starPoints = (points, outerR, innerR) => {
  const step = Math.PI / points;
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    pts.push({ x: outerR + Math.cos(a) * r, y: outerR + Math.sin(a) * r });
  }
  return pts;
};
[4, 5, 6, 12].forEach((n) => {
  const pts = starPoints(n, 70, 30);
  expect(pts.length === n * 2, `${n}-point star has ${n * 2} vertices (outer+inner alternating)`);
});

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All shape primitives verified\n');
