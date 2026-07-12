// Verifies the text-editing property flow at the Fabric v6 layer,
// simulating what useEditorStore.updateSelectedProperty does.
// Run: node verify-text.mjs

import { StaticCanvas, Textbox } from 'fabric/node';

const pass = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  console.log(`  ✗ ${msg}`);
  process.exitCode = 1;
};
const expect = (cond, msg) => (cond ? pass(msg) : fail(msg));
const eq = (a, b, msg) => expect(a === b, `${msg} (got ${JSON.stringify(a)}, expected ${JSON.stringify(b)})`);

console.log('\n== Fabric v6 text-editing property flow ==\n');

const canvas = new StaticCanvas(null, { width: 900, height: 600 });

// --- Create a Textbox exactly like store.addText('heading') ---
const text = new Textbox('Add a heading', {
  left: 200,
  top: 200,
  width: 360,
  fontFamily: 'Inter',
  fill: '#111827',
  fontSize: 44,
  fontWeight: '700',
});
canvas.add(text);

console.log('1) Type accessor (Fabric v6 quirk):');
eq(Textbox.type, 'Textbox', 'static Textbox.type is PascalCase');
eq(text.type, 'textbox', 'instance text.type is lowercase (via get type() accessor)');

console.log('\n2) Store-style property updates apply to the object:');
const apply = (key, value) => {
  text.set(key, value);
  text.setCoords();
};

apply('fontFamily', 'Roboto');
eq(text.fontFamily, 'Roboto', 'fontFamily updates via set()');

apply('fontSize', 28);
eq(text.fontSize, 28, 'fontSize updates via set()');

apply('fontWeight', '400');
eq(text.fontWeight, '400', 'fontWeight (regular) updates via set()');

apply('fontStyle', 'italic');
eq(text.fontStyle, 'italic', 'fontStyle (italic) updates via set()');

apply('underline', true);
eq(text.underline, true, 'underline updates via set()');

apply('textAlign', 'center');
eq(text.textAlign, 'center', 'textAlign updates via set()');

apply('lineHeight', 1.5);
eq(text.lineHeight, 1.5, 'lineHeight updates via set()');

apply('charSpacing', 120);
eq(text.charSpacing, 120, 'charSpacing updates via set()');

apply('fill', '#ff0000');
eq(text.fill, '#ff0000', 'fill (color) updates via set()');

apply('stroke', '#000000');
apply('strokeWidth', 2);
eq(text.stroke, '#000000', 'stroke color updates on text');
eq(text.strokeWidth, 2, 'strokeWidth updates on text');

console.log('\n3) The shallow-clone trick (from updateSelectedProperty) preserves values:');
const clone = Object.assign(Object.create(Object.getPrototypeOf(text)), text);
eq(clone.fontFamily, 'Roboto', 'cloned reference reads fontFamily correctly');
eq(clone.fontSize, 28, 'cloned reference reads fontSize correctly');
eq(clone.type, 'textbox', 'cloned reference still reports type "textbox"');
expect(Object.getPrototypeOf(clone) === Object.getPrototypeOf(text), 'clone shares Textbox prototype');

console.log('\n4) Bold-state detection handles Fabric\'s flexible fontWeight:');
const isBold = (w) => w === 'bold' || Number(w) >= 700;
expect(isBold('700'), 'isBold("700") true');
expect(isBold(700), 'isBold(700) true');
expect(isBold('bold'), 'isBold("bold") true');
expect(!isBold('400'), 'isBold("400") false');
expect(!isBold('600'), 'isBold("600") false');
expect(isBold('900'), 'isBold("900") true');

console.log('\n5) JSON roundtrip (autosave/undo path) preserves text properties:');
const json = JSON.stringify(canvas.toJSON());
const c2 = new StaticCanvas(null, { width: 900, height: 600 });
await c2.loadFromJSON(JSON.parse(json));
const restored = c2.getObjects()[0];
eq(restored.type, 'textbox', 'roundtripped object type is "textbox"');
eq(restored.fontFamily, 'Roboto', 'roundtripped fontFamily');
eq(restored.fontSize, 28, 'roundtripped fontSize');
eq(restored.fontStyle, 'italic', 'roundtripped fontStyle');
eq(restored.underline, true, 'roundtripped underline');
eq(restored.textAlign, 'center', 'roundtripped textAlign');
eq(restored.lineHeight, 1.5, 'roundtripped lineHeight');
eq(restored.charSpacing, 120, 'roundtripped charSpacing');
eq(restored.fill, '#ff0000', 'roundtripped fill');

console.log('\n6) IText inline editing surface exists (double-click flow):');
expect(typeof text.enterEditing === 'function', 'enterEditing() available');
expect(typeof text.exitEditing === 'function', 'exitEditing() available');
eq(text.isEditing, false, 'isEditing is false initially');

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All checks passed\n');
