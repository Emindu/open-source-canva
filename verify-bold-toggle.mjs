// Verifies the store's updateSelectedProperty handles the "second click"
// scenario correctly: after the first update, store holds a shallow clone,
// not the canvas object. The next update must still mutate the canvas object.

import { StaticCanvas, Textbox } from 'fabric/node';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

/* --------- The BROKEN implementation (before the fix) --------- */
const brokenUpdate = (storeActiveObject, canvas, key, value) => {
  // Reads target from store — a shallow clone after the first update!
  const target = storeActiveObject;
  target.set(key, value);
  canvas.renderAll();
  // Return the "new" clone the store would hold next
  return Object.assign(Object.create(Object.getPrototypeOf(target)), target);
};

/* --------- The FIXED implementation --------- */
const fixedUpdate = (canvas, key, value) => {
  const target = canvas.getActiveObject(); // always the REAL object on canvas
  if (typeof target.removeStyle === 'function') {
    const styleProps = target.constructor?._styleProperties;
    if (styleProps?.includes(key)) target.removeStyle(key);
  }
  target.set(key, value);
  target.setCoords();
  if (typeof target.initDimensions === 'function' &&
      target.constructor?.textLayoutProperties?.includes(key)) {
    target._forceClearCache = true;
    target.initDimensions();
  }
  target.dirty = true;
  canvas.renderAll();
  return Object.assign(Object.create(Object.getPrototypeOf(target)), target);
};

console.log('\n== Bold toggle across MULTIPLE clicks (the actual reported bug) ==\n');

console.log('--- Broken path (using stale store reference) ---');
{
  const canvas = new StaticCanvas(null, { width: 400, height: 100 });
  const real = new Textbox('Hello', { fontSize: 40, fontWeight: '700' });
  canvas.add(real);
  canvas.getActiveObject = () => real; // StaticCanvas has no selection; stub it

  let storeActive = real; // first render: store holds the real object
  storeActive = brokenUpdate(storeActive, canvas, 'fontWeight', '400');
  expect(real.fontWeight === '400', 'click 1: real canvas object updated to 400');

  // Click 2: try to bold again. Store holds the clone from click 1.
  storeActive = brokenUpdate(storeActive, canvas, 'fontWeight', '700');
  const canvasIsBold = real.fontWeight === '700';
  expect(!canvasIsBold, 'click 2 (broken): canvas object STAYED at 400 — bug reproduced');
  console.log(`     (real.fontWeight is "${real.fontWeight}", storeActive.fontWeight is "${storeActive.fontWeight}")`);
}

console.log('\n--- Fixed path (always look up canvas.getActiveObject()) ---');
{
  const canvas = new StaticCanvas(null, { width: 400, height: 100 });
  const real = new Textbox('Hello', { fontSize: 40, fontWeight: '700' });
  canvas.add(real);
  canvas.getActiveObject = () => real; // StaticCanvas has no selection; stub it

  fixedUpdate(canvas, 'fontWeight', '400');
  expect(real.fontWeight === '400', 'click 1: unbold works');

  fixedUpdate(canvas, 'fontWeight', '700');
  expect(real.fontWeight === '700', 'click 2: rebold works');

  fixedUpdate(canvas, 'fontWeight', '400');
  expect(real.fontWeight === '400', 'click 3: unbold works again');

  fixedUpdate(canvas, 'fontStyle', 'italic');
  expect(real.fontStyle === 'italic', 'italic toggles on');

  fixedUpdate(canvas, 'fontStyle', 'normal');
  expect(real.fontStyle === 'normal', 'italic toggles off');

  fixedUpdate(canvas, 'underline', true);
  expect(real.underline === true, 'underline toggles on');

  fixedUpdate(canvas, 'underline', false);
  expect(real.underline === false, 'underline toggles off');

  fixedUpdate(canvas, 'fill', '#ff0000');
  expect(real.fill === '#ff0000', 'fill changes to red');

  fixedUpdate(canvas, 'fill', '#000000');
  expect(real.fill === '#000000', 'fill changes back to black');
}

console.log('\n--- With per-char styles baked in (edit-mode simulation) ---');
{
  const canvas = new StaticCanvas(null, { width: 400, height: 100 });
  const real = new Textbox('Hello', { fontSize: 40, fontWeight: '400' });
  canvas.add(real);
  canvas.getActiveObject = () => real; // StaticCanvas has no selection; stub it

  // Simulate range select + bold in edit mode
  real.setSelectionStyles({ fontWeight: '700' }, 0, 5);
  expect(Object.keys(real.styles).length > 0, 'per-char bold baked in');

  fixedUpdate(canvas, 'fontWeight', '400');
  const hasBoldPerChar = Object.values(real.styles || {}).some(l =>
    Object.values(l).some(c => c.fontWeight && Number(c.fontWeight) >= 700)
  );
  expect(!hasBoldPerChar, 'per-char bold cleared by the fix');
  expect(real.fontWeight === '400', 'top-level unbold applied');
}

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All checks passed\n');
