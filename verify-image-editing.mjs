// Verifies image filters (brightness/contrast/saturation/blur/hue),
// BlendColor, crop math, and the filter-state roundtrip.

import { StaticCanvas, FabricImage, filters as fabricFilters } from 'fabric/node';
import { createCanvas } from 'canvas';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

// Build a solid-colored test image
const buildTestImage = async () => {
  const c = createCanvas(200, 100);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#7c5cff';
  ctx.fillRect(0, 0, 200, 100);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(50, 20, 100, 60);
  const url = c.toDataURL('image/png');
  return FabricImage.fromURL(url);
};

console.log('\n== Image filter pipeline ==\n');

const canvas = new StaticCanvas(null, { width: 400, height: 200 });
const img = await buildTestImage();
canvas.add(img);

console.log('1) Individual filter classes exist:');
expect(typeof fabricFilters.Brightness === 'function', 'Brightness');
expect(typeof fabricFilters.Contrast === 'function', 'Contrast');
expect(typeof fabricFilters.Saturation === 'function', 'Saturation');
expect(typeof fabricFilters.Blur === 'function', 'Blur');
expect(typeof fabricFilters.HueRotation === 'function', 'HueRotation');
expect(typeof fabricFilters.Grayscale === 'function', 'Grayscale');
expect(typeof fabricFilters.Sepia === 'function', 'Sepia');
expect(typeof fabricFilters.BlendColor === 'function', 'BlendColor');
expect(typeof fabricFilters.Invert === 'function', 'Invert');
expect(typeof fabricFilters.Pixelate === 'function', 'Pixelate');
expect(typeof fabricFilters.Noise === 'function', 'Noise');

console.log('\n2) Apply and read back single filter (Brightness):');
img.filters = [new fabricFilters.Brightness({ brightness: 0.3 })];
img.applyFilters();
expect(img.filters?.length === 1, `1 filter (got ${img.filters?.length})`);
expect(img.filters?.[0]?.brightness === 0.3, `brightness = 0.3 (got ${img.filters?.[0]?.brightness})`);

console.log('\n3) Chain multiple filters:');
img.filters = [
  new fabricFilters.Brightness({ brightness: 0.1 }),
  new fabricFilters.Contrast({ contrast: 0.2 }),
  new fabricFilters.Saturation({ saturation: 0.3 }),
  new fabricFilters.Blur({ blur: 0.05 }),
];
img.applyFilters();
expect(img.filters?.length === 4, `4 filters chained (got ${img.filters?.length})`);

console.log('\n4) BlendColor for colorize:');
img.filters = [
  new fabricFilters.BlendColor({ color: '#7c5cff', mode: 'tint', alpha: 0.5 }),
];
img.applyFilters();
const blend = img.filters?.[0];
expect(blend?.color === '#7c5cff', 'blend color');
expect(blend?.mode === 'tint', 'blend mode = tint');
expect(blend?.alpha === 0.5, 'blend alpha 0.5');

console.log('\n5) Grayscale + BlendColor (approximate duotone):');
img.filters = [new fabricFilters.Grayscale(), new fabricFilters.BlendColor({ color: '#c8a97e', mode: 'tint', alpha: 0.4 })];
img.applyFilters();
expect(img.filters?.length === 2, '2-filter combo applied');

console.log('\n6) Filter roundtrip via JSON:');
img.filters = [
  new fabricFilters.Brightness({ brightness: 0.15 }),
  new fabricFilters.BlendColor({ color: '#66a3ff', mode: 'tint', alpha: 0.3 }),
];
img.applyFilters();
const json = JSON.stringify(canvas.toJSON());
const c2 = new StaticCanvas(null, { width: 400, height: 200 });
await c2.loadFromJSON(JSON.parse(json));
const r = c2.getObjects()[0];
expect(r.filters?.length === 2, `roundtrip: 2 filters (got ${r.filters?.length})`);
expect(r.filters?.[0]?.brightness === 0.15, 'roundtrip: brightness preserved');
expect(r.filters?.[1]?.color === '#66a3ff', 'roundtrip: blend color preserved');

console.log('\n7) Crop math (cropX/cropY/width/height in source coords):');
const img2 = await buildTestImage();
// Original 200x100. Crop the middle-right half (from x=100, y=0, w=100, h=100)
img2.set({ cropX: 100, cropY: 0, width: 100, height: 100 });
expect(img2.cropX === 100, 'cropX applied');
expect(img2.width === 100, 'width reduced to crop area');
// Display dimensions
expect(img2.getScaledWidth() === 100, 'scaled width = 100');

console.log('\n8) Crop → JSON roundtrip:');
canvas.clear();
canvas.add(img2);
const j2 = JSON.stringify(canvas.toJSON());
const c3 = new StaticCanvas(null, { width: 400, height: 200 });
await c3.loadFromJSON(JSON.parse(j2));
const r3 = c3.getObjects()[0];
expect(r3.cropX === 100, 'roundtrip: cropX preserved');
expect(r3.width === 100, 'roundtrip: cropped width preserved');

console.log('\n9) Reset filters:');
img.filters = [];
img.applyFilters();
expect(img.filters?.length === 0, 'filters cleared');

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All checks passed\n');
