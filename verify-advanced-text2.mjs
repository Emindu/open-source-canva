// Verifies curved text, per-char formatting, effects presets, and sup/subscript.

import { StaticCanvas, Textbox, Path } from 'fabric/node';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

console.log('\n== Curved text (path attachment) ==\n');
{
  const canvas = new StaticCanvas(null, { width: 800, height: 400 });
  const text = new Textbox('Curved text sample', { fontSize: 40, width: 400 });
  canvas.add(text);
  const arcPath = new Path('M 0 100 Q 200 -50 400 100', { fill: '', stroke: '' });
  text.set('path', arcPath);
  text._forceClearCache = true;
  if (typeof text.initDimensions === 'function') text.initDimensions();
  canvas.renderAll();
  expect(text.path !== null && text.path !== undefined, 'text.path attached');
  expect(text.path?.type === 'path', `path type = "path" (got ${text.path?.type})`);

  // Remove
  text.set('path', null);
  canvas.renderAll();
  expect(!text.path, 'path removed with null');
}

console.log('\n== Per-character formatting via setSelectionStyles ==\n');
{
  const canvas = new StaticCanvas(null, { width: 800, height: 200 });
  const text = new Textbox('Hello world', { fontSize: 40, fontWeight: '400' });
  canvas.add(text);
  // Simulate the panel path: select "world" (indices 6..11) and apply bold
  text.setSelectionStyles({ fontWeight: '700' }, 6, 11);
  canvas.renderAll();

  const styles = text.styles || {};
  const line0 = styles[0] || {};
  const boldRange = [6, 7, 8, 9, 10].every((i) => line0[i]?.fontWeight === '700');
  const notBoldBefore = ![0, 1, 2, 3, 4].some((i) => line0[i]?.fontWeight === '700');
  expect(boldRange, 'chars 6-10 have per-char bold');
  expect(notBoldBefore, 'chars 0-4 do NOT have per-char bold');
  expect(text.fontWeight === '400', 'top-level fontWeight stays 400');
}

console.log('\n== Text effects presets (fill + stroke + shadow combos) ==\n');
{
  const canvas = new StaticCanvas(null, { width: 800, height: 200 });
  const text = new Textbox('Effect', { fontSize: 60, fill: '#7c5cff' });
  canvas.add(text);

  // Neon: color fill + colored glow shadow, no stroke
  const applyNeon = (t) => {
    t.set('fill', '#ffffff');
    t.set('stroke', null);
    t.set('strokeWidth', 0);
    t.set('shadow', { color: '#7c5cff', blur: 30, offsetX: 0, offsetY: 0 });
  };
  applyNeon(text);
  expect(text.fill === '#ffffff', 'Neon: fill white');
  expect(text.shadow?.blur === 30, 'Neon: shadow blur 30');
  expect(text.shadow?.offsetX === 0, 'Neon: no offset');

  // Echo: strong offset shadow
  text.set('shadow', { color: '#7c5cff', blur: 0, offsetX: 8, offsetY: 8 });
  expect(text.shadow?.offsetX === 8, 'Echo: offsetX 8');

  // Outline: transparent fill + colored stroke
  text.set({ fill: 'transparent', stroke: '#7c5cff', strokeWidth: 2, shadow: null });
  expect(text.fill === 'transparent', 'Outline: transparent fill');
  expect(text.stroke === '#7c5cff', 'Outline: colored stroke');
  expect(!text.shadow, 'Outline: no shadow');

  // Reset to None
  text.set({ stroke: null, strokeWidth: 0, shadow: null });
  expect(!text.shadow && !text.stroke, 'None: cleared');
}

console.log('\n== Superscript / Subscript on selection range ==\n');
{
  const canvas = new StaticCanvas(null, { width: 800, height: 200 });
  const text = new Textbox('x2 and H2O', { fontSize: 40 });
  canvas.add(text);
  // Apply superscript to the "2" at index 1
  text.setSuperscript(1, 2);
  canvas.renderAll();
  const styles = text.styles || {};
  const supStyle = styles[0]?.[1];
  expect(!!supStyle, 'super style applied');
  expect(supStyle?.fontSize !== undefined, `super has scaled fontSize (${supStyle?.fontSize})`);
  expect(supStyle?.deltaY !== undefined && supStyle.deltaY < 0, `super has negative deltaY (got ${supStyle?.deltaY})`);

  // Subscript on the "2" in H2O (index 7 in "x2 and H2O")
  text.setSubscript(7, 8);
  canvas.renderAll();
  const subStyle = text.styles?.[0]?.[7];
  expect(!!subStyle, 'sub style applied');
  expect(subStyle?.deltaY !== undefined && subStyle.deltaY > 0, `sub has positive deltaY (got ${subStyle?.deltaY})`);
}

console.log('\n== JSON roundtrip for curved text + per-char styles + effects ==\n');
{
  const canvas = new StaticCanvas(null, { width: 800, height: 400 });
  const text = new Textbox('Roundtrip', { fontSize: 40 });
  canvas.add(text);
  text.set('path', new Path('M 0 50 Q 200 -30 400 50', { fill: '', stroke: '' }));
  text.setSelectionStyles({ fontWeight: '700', fill: '#ff0000' }, 0, 5);
  text.set('shadow', { color: '#7c5cff', blur: 20, offsetX: 0, offsetY: 0 });

  const json = JSON.stringify(canvas.toJSON());
  const c2 = new StaticCanvas(null, { width: 800, height: 400 });
  await c2.loadFromJSON(JSON.parse(json));
  const r = c2.getObjects()[0];
  expect(r.path !== null && r.path !== undefined, 'roundtrip: path preserved');
  expect(r.styles?.[0]?.[0]?.fontWeight === '700', 'roundtrip: per-char bold preserved');
  expect(r.styles?.[0]?.[0]?.fill === '#ff0000', 'roundtrip: per-char red preserved');
  expect(r.shadow?.blur === 20, 'roundtrip: shadow preserved');
}

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All checks passed\n');
