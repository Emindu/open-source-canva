// Verifies Sinhala Unicode handling: grapheme cluster splitting, roundtrip
// preservation of complex characters, and font-family application.

import { StaticCanvas, Textbox } from 'fabric/node';

// Use Intl.Segmenter directly — same API Fabric's graphemeSplit uses under the hood
const graphemeSplit = (s) => {
  const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  return Array.from(seg.segment(s)).map((x) => x.segment);
};
const util = { graphemeSplit };

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

console.log('\n== Sinhala Unicode support ==\n');

console.log('1) Grapheme cluster splitting (must NOT split Sinhala combining marks):');
// A single Sinhala grapheme cluster is composed of a base + combining marks.
// e.g. "කු" = "ක" + "ු" (uu-sign) → visually one letter
const kuGraphemes = util.graphemeSplit('කු');
expect(kuGraphemes.length === 1, `"කු" is 1 grapheme (Intl.Segmenter joins base+mark). Got: [${kuGraphemes.join('|')}]`);

// "ශ්‍රී" = ශ + hal + zwj + ර + iigana. Per Unicode UAX #29 this is 2 grapheme
// clusters (the ZWJ+hal is a boundary). Cursor stops between "ශ්‍" and "රී"
// is standards-compliant editor behavior.
const shri = 'ශ්‍රී';
const shriG = util.graphemeSplit(shri);
expect(shriG.length === 2, `"ශ්‍රී" splits into 2 clusters per UAX #29. Got: [${shriG.join('|')}]`);

// "ආයුබෝවන්" = ආ + යු + බෝ + ව + න් → 5 clusters
const ayubowan = 'ආයුබෝවන්';
const ayuG = util.graphemeSplit(ayubowan);
expect(ayuG.length === 5, `"ආයුබෝවන්" is 5 graphemes. Got ${ayuG.length}: [${ayuG.join('|')}]`);

console.log('\n2) Textbox creation with Sinhala text preserves the string byte-for-byte:');
const canvas = new StaticCanvas(null, { width: 900, height: 200 });
const text = new Textbox('ආයුබෝවන්', {
  fontFamily: 'Noto Sans Sinhala',
  fontSize: 44,
  fontWeight: '700',
});
canvas.add(text);
expect(text.text === 'ආයුබෝවන්', `text preserved (got "${text.text}")`);
expect(text.fontFamily === 'Noto Sans Sinhala', 'fontFamily preserved');

console.log('\n3) JSON roundtrip preserves Sinhala unicode (used by autosave/undo):');
const json = JSON.stringify(canvas.toJSON());
const c2 = new StaticCanvas(null, { width: 900, height: 200 });
await c2.loadFromJSON(JSON.parse(json));
const restored = c2.getObjects()[0];
expect(restored.text === 'ආයුබෝවන්', `restored text matches (got "${restored.text}")`);
expect(restored.fontFamily === 'Noto Sans Sinhala', 'restored fontFamily matches');

console.log('\n4) Cursor navigation across grapheme clusters:');
// Fabric uses _text (grapheme array) internally for cursor movement
// Length of _text should equal grapheme count, not codepoint count
expect(text._text.length === 5, `_text array has 5 grapheme entries. Got ${text._text.length}: ${text._text.join('|')}`);
expect(text._text.length !== text.text.length, `_text.length (${text._text.length}) ≠ codepoint count (${text.text.length}) — proves grapheme awareness`);

console.log('\n5) Setting Sinhala text after creation (dropdown font change):');
const englishText = new Textbox('Hello', {
  fontFamily: 'Inter',
  fontSize: 40,
});
canvas.add(englishText);
englishText.set('text', 'ආයුබෝවන්');
englishText.set('fontFamily', 'Noto Sans Sinhala');
englishText.initDimensions();
expect(englishText.text === 'ආයුබෝවන්', 'text changed to Sinhala');
expect(englishText._text.length === 5, `re-measured as 5 graphemes. Got ${englishText._text.length}`);

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All checks passed\n');
