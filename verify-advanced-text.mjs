// Verifies advanced text formatting features at the Fabric layer.

import { StaticCanvas, Textbox, Shadow } from 'fabric/node';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

const fixedUpdate = (canvas, key, value) => {
  const target = canvas.getActiveObject();
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
};

console.log('\n== Advanced text formatting ==\n');

const canvas = new StaticCanvas(null, { width: 900, height: 200 });
const text = new Textbox('Hello World', {
  fontFamily: 'Inter',
  fontSize: 40,
  fontWeight: '400',
});
canvas.add(text);
canvas.getActiveObject = () => text;

console.log('1) Text decorations:');
fixedUpdate(canvas, 'linethrough', true);
expect(text.linethrough === true, 'strikethrough on');
fixedUpdate(canvas, 'linethrough', false);
expect(text.linethrough === false, 'strikethrough off');

fixedUpdate(canvas, 'overline', true);
expect(text.overline === true, 'overline on');
fixedUpdate(canvas, 'overline', false);
expect(text.overline === false, 'overline off');

console.log('\n2) Justify align:');
fixedUpdate(canvas, 'textAlign', 'justify');
expect(text.textAlign === 'justify', 'textAlign = justify');
fixedUpdate(canvas, 'textAlign', 'center');
expect(text.textAlign === 'center', 'textAlign = center');

console.log('\n3) Text case transforms:');
fixedUpdate(canvas, 'text', text.text.toLocaleUpperCase());
expect(text.text === 'HELLO WORLD', `uppercase (got "${text.text}")`);

fixedUpdate(canvas, 'text', text.text.toLocaleLowerCase());
expect(text.text === 'hello world', `lowercase (got "${text.text}")`);

const titleCase = (s) => s.replace(/\S+/g, (w) => w.charAt(0).toLocaleUpperCase() + w.slice(1).toLocaleLowerCase());
fixedUpdate(canvas, 'text', titleCase(text.text));
expect(text.text === 'Hello World', `title case (got "${text.text}")`);

console.log('\n4) Text case is grapheme-safe with Sinhala (no case → no-op):');
fixedUpdate(canvas, 'text', 'ආයුබෝවන්');
const beforeCase = text.text;
fixedUpdate(canvas, 'text', text.text.toLocaleUpperCase());
expect(text.text === beforeCase, 'Sinhala unchanged by uppercase (has no case)');
expect(text._text.length === 5, `still 5 graphemes (got ${text._text.length})`);

console.log('\n5) Text highlight (textBackgroundColor):');
fixedUpdate(canvas, 'textBackgroundColor', '#fff59d');
expect(text.textBackgroundColor === '#fff59d', 'highlight color set');
fixedUpdate(canvas, 'textBackgroundColor', '');
expect(text.textBackgroundColor === '', 'highlight removed');

console.log('\n6) Text shadow (via plain object):');
fixedUpdate(canvas, 'shadow', { color: 'rgba(0,0,0,0.5)', blur: 12, offsetX: 2, offsetY: 4 });
expect(text.shadow !== null && text.shadow !== undefined, 'shadow set');
expect(text.shadow.color === 'rgba(0,0,0,0.5)', 'shadow color preserved');
expect(text.shadow.blur === 12, 'shadow blur preserved');
expect(text.shadow.offsetX === 2, 'shadow offsetX preserved');
expect(text.shadow.offsetY === 4, 'shadow offsetY preserved');

fixedUpdate(canvas, 'shadow', null);
expect(!text.shadow, 'shadow removed with null');

console.log('\n7) Text shadow via fabric.Shadow instance:');
fixedUpdate(canvas, 'shadow', new Shadow({ color: '#7c5cff', blur: 20, offsetX: 0, offsetY: 0 }));
expect(text.shadow?.color === '#7c5cff', 'Shadow instance color');

console.log('\n8) JSON roundtrip preserves advanced formatting:');
fixedUpdate(canvas, 'text', 'Hello');
fixedUpdate(canvas, 'linethrough', true);
fixedUpdate(canvas, 'overline', true);
fixedUpdate(canvas, 'textAlign', 'justify');
fixedUpdate(canvas, 'textBackgroundColor', '#fff59d');
fixedUpdate(canvas, 'shadow', { color: '#000000', blur: 8, offsetX: 2, offsetY: 2 });

const json = JSON.stringify(canvas.toJSON());
const c2 = new StaticCanvas(null, { width: 900, height: 200 });
await c2.loadFromJSON(JSON.parse(json));
const r = c2.getObjects()[0];
expect(r.linethrough === true, 'roundtrip linethrough');
expect(r.overline === true, 'roundtrip overline');
expect(r.textAlign === 'justify', 'roundtrip textAlign justify');
expect(r.textBackgroundColor === '#fff59d', 'roundtrip textBackgroundColor');
expect(r.shadow?.blur === 8, `roundtrip shadow blur (got ${r.shadow?.blur})`);
expect(r.shadow?.offsetX === 2, 'roundtrip shadow offsetX');

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All checks passed\n');
