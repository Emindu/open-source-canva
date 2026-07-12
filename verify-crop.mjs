// Verifies PowerPoint-style crop math:
//   - Enter crop mode: un-crops image, positions crop rect at current visible area
//   - Apply: computes cropX/cropY/width/height + repositions image correctly
//   - Cancel: restores snapshot
//   - Re-crop: math still works on an already-cropped image
//   - Reset: restores full source

import { StaticCanvas, FabricImage, Rect } from 'fabric/node';
import { createCanvas } from 'canvas';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const near = (a, b, eps = 0.5) => Math.abs(a - b) < eps;
const expect = (c, m) => (c ? pass(m) : fail(m));

// Build a test 800×600 image
const buildImg = async () => {
  const c = createCanvas(800, 600);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#7c5cff';
  ctx.fillRect(0, 0, 800, 600);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(100, 100, 200, 200);
  const url = c.toDataURL('image/png');
  const img = await FabricImage.fromURL(url);
  // Fake the naturalWidth/Height since Node fabric may not populate it
  const el = img._element;
  Object.defineProperty(el, 'naturalWidth', { value: 800, configurable: true });
  Object.defineProperty(el, 'naturalHeight', { value: 600, configurable: true });
  return img;
};

// --- Reimplement the store's crop math, isolated for testing ---

const startCropMode = (img) => {
  const snapshot = {
    cropX: img.cropX ?? 0,
    cropY: img.cropY ?? 0,
    width: img.width,
    height: img.height,
    left: img.left ?? 0,
    top: img.top ?? 0,
    scaleX: img.scaleX ?? 1,
    scaleY: img.scaleY ?? 1,
  };
  const el = img._element;
  const nW = el.naturalWidth;
  const nH = el.naturalHeight;

  const visLeft = snapshot.left;
  const visTop = snapshot.top;
  const visW = img.getScaledWidth();
  const visH = img.getScaledHeight();

  img.set({
    cropX: 0,
    cropY: 0,
    width: nW,
    height: nH,
    left: visLeft - snapshot.cropX * snapshot.scaleX,
    top: visTop - snapshot.cropY * snapshot.scaleY,
  });
  img.setCoords();

  const cropRect = new Rect({
    left: visLeft, top: visTop, width: visW, height: visH,
    fill: 'transparent', stroke: '#000',
  });

  return { snapshot, cropRect };
};

const applyCrop = (img, cropRect) => {
  const sx = img.scaleX || 1;
  const sy = img.scaleY || 1;
  const iL = img.left ?? 0;
  const iT = img.top ?? 0;
  const cL = cropRect.left ?? 0;
  const cT = cropRect.top ?? 0;
  const cW = (cropRect.width || 0) * (cropRect.scaleX || 1);
  const cH = (cropRect.height || 0) * (cropRect.scaleY || 1);

  let cropX = (cL - iL) / sx;
  let cropY = (cT - iT) / sy;
  let width = cW / sx;
  let height = cH / sy;

  const nW = img.width;
  const nH = img.height;
  if (cropX < 0) { width += cropX; cropX = 0; }
  if (cropY < 0) { height += cropY; cropY = 0; }
  if (cropX + width > nW) width = nW - cropX;
  if (cropY + height > nH) height = nH - cropY;
  width = Math.max(1, width);
  height = Math.max(1, height);

  img.set({
    cropX, cropY, width, height,
    left: iL + cropX * sx,
    top: iT + cropY * sy,
  });
  img.setCoords();
};

const cancelCrop = (img, snapshot) => img.set(snapshot);

const resetCrop = (img) => {
  const el = img._element;
  const nW = el.naturalWidth;
  const nH = el.naturalHeight;
  const sx = img.scaleX || 1;
  const sy = img.scaleY || 1;
  img.set({
    cropX: 0, cropY: 0, width: nW, height: nH,
    left: (img.left ?? 0) - (img.cropX ?? 0) * sx,
    top: (img.top ?? 0) - (img.cropY ?? 0) * sy,
  });
};

// -------------------- tests --------------------

console.log('\n== 1) Fresh crop: image at (100,100) scale 0.5, crop to inner half ==\n');
{
  const img = await buildImg();
  img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5 });
  // Displayed as 400×300 at (100,100)

  const { snapshot, cropRect } = startCropMode(img);
  expect(img.width === 800 && img.height === 600, 'after enter: image un-cropped to 800×600');
  expect(near(img.left, 100) && near(img.top, 100), 'image position unchanged (no prior crop offset)');
  expect(cropRect.left === 100 && cropRect.top === 100, 'crop rect at same top-left as image');
  expect(cropRect.width === 400 && cropRect.height === 300, 'crop rect covers full visible area');

  // Simulate shrinking crop to inner half: (150,130) size 200×150 on canvas
  cropRect.set({ left: 150, top: 130, width: 200, height: 150 });
  applyCrop(img, cropRect);

  // Expected: cropX=(150-100)/0.5=100, cropY=(130-100)/0.5=60
  // width=200/0.5=400, height=150/0.5=300
  expect(near(img.cropX, 100), `cropX = 100 (got ${img.cropX})`);
  expect(near(img.cropY, 60), `cropY = 60 (got ${img.cropY})`);
  expect(near(img.width, 400), `width = 400 (got ${img.width})`);
  expect(near(img.height, 300), `height = 300 (got ${img.height})`);
  // Image repositions so cropped area is at (150,130)
  expect(near(img.left, 150), `left = 150 (got ${img.left})`);
  expect(near(img.top, 130), `top = 130 (got ${img.top})`);
  expect(near(img.getScaledWidth(), 200), 'visible width = 200');
  expect(near(img.getScaledHeight(), 150), 'visible height = 150');

  // Sanity: snapshot untouched
  expect(snapshot.cropX === 0 && snapshot.width === 800, 'snapshot preserved');
}

console.log('\n== 2) Re-crop already-cropped image ==\n');
{
  // Start with an image that was cropped in test 1: cropX=100, cropY=60, width=400, height=300 at (150,130) scale 0.5
  const img = await buildImg();
  img.set({
    left: 150, top: 130,
    scaleX: 0.5, scaleY: 0.5,
    cropX: 100, cropY: 60,
    width: 400, height: 300,
  });

  const { cropRect } = startCropMode(img);
  // After un-crop: image reverts to 800×600, positioned at (150 - 100*0.5, 130 - 60*0.5) = (100, 100)
  expect(near(img.left, 100), `after re-enter: left = 100 (got ${img.left})`);
  expect(near(img.top, 100), `after re-enter: top = 100 (got ${img.top})`);
  expect(img.width === 800 && img.height === 600, 'width/height back to natural');
  // Crop rect at the currently-visible (previously cropped) area
  expect(cropRect.left === 150 && cropRect.top === 130, 'crop rect at last cropped area');
  expect(cropRect.width === 200 && cropRect.height === 150, 'crop rect matches last visible size');

  // Now shrink even further
  cropRect.set({ left: 200, top: 160, width: 100, height: 90 });
  applyCrop(img, cropRect);
  // cropX = (200 - 100) / 0.5 = 200
  // cropY = (160 - 100) / 0.5 = 120
  expect(near(img.cropX, 200), `re-crop cropX = 200 (got ${img.cropX})`);
  expect(near(img.cropY, 120), `re-crop cropY = 120 (got ${img.cropY})`);
  expect(near(img.width, 200), `re-crop width = 200 (got ${img.width})`);
  expect(near(img.height, 180), `re-crop height = 180 (got ${img.height})`);
}

console.log('\n== 3) Cancel restores original state ==\n');
{
  const img = await buildImg();
  img.set({ left: 100, top: 100, scaleX: 0.5, scaleY: 0.5, cropX: 50, cropY: 30, width: 400, height: 300 });
  const before = {
    cropX: img.cropX, cropY: img.cropY,
    width: img.width, height: img.height,
    left: img.left, top: img.top,
  };
  const { snapshot, cropRect } = startCropMode(img);
  // Muck around
  cropRect.set({ left: 200, top: 200, width: 50, height: 50 });
  cancelCrop(img, snapshot);
  expect(img.cropX === before.cropX && img.cropY === before.cropY, 'crop offsets restored');
  expect(img.width === before.width && img.height === before.height, 'width/height restored');
  expect(img.left === before.left && img.top === before.top, 'position restored');
}

console.log('\n== 4) Reset restores full source ==\n');
{
  const img = await buildImg();
  img.set({ left: 150, top: 130, scaleX: 0.5, scaleY: 0.5, cropX: 100, cropY: 60, width: 400, height: 300 });
  resetCrop(img);
  expect(img.width === 800 && img.height === 600, 'width/height = natural 800×600');
  expect(img.cropX === 0 && img.cropY === 0, 'cropX/Y = 0');
  // Image top-left should shift back so the un-cropped source occupies from (100, 100) upward
  expect(near(img.left, 100), `after reset: left = 100 (got ${img.left})`);
  expect(near(img.top, 100), `after reset: top = 100 (got ${img.top})`);
}

console.log('\n== 5) Clamp: crop rect outside image is clipped ==\n');
{
  const img = await buildImg();
  img.set({ left: 100, top: 100, scaleX: 1, scaleY: 1 });
  const { cropRect } = startCropMode(img);
  // Drag crop rect to a position where it extends past image right AND bottom
  cropRect.set({ left: 200, top: 200, width: 900, height: 700 });
  applyCrop(img, cropRect);
  // cropX = 100, cropY = 100. Requested 900×700, image 800×600.
  // Clamped: width = 800 - 100 = 700; height = 600 - 100 = 500.
  expect(near(img.cropX, 100), `cropX = 100 (got ${img.cropX})`);
  expect(near(img.width, 700), `width clamped to 700 (got ${img.width})`);
  expect(near(img.height, 500), `height clamped to 500 (got ${img.height})`);
}

console.log('\n== 6) JSON roundtrip: cropped image survives save + load ==\n');
{
  const canvas = new StaticCanvas(null, { width: 800, height: 600 });
  const img = await buildImg();
  img.set({ left: 150, top: 130, scaleX: 0.5, scaleY: 0.5, cropX: 100, cropY: 60, width: 400, height: 300 });
  canvas.add(img);
  const json = JSON.stringify(canvas.toObject());
  const c2 = new StaticCanvas(null, { width: 800, height: 600 });
  await c2.loadFromJSON(JSON.parse(json));
  const r = c2.getObjects()[0];
  expect(r.cropX === 100 && r.cropY === 60, 'roundtripped cropX/cropY');
  expect(r.width === 400 && r.height === 300, 'roundtripped cropped dimensions');
  expect(r.left === 150 && r.top === 130, 'roundtripped position');
}

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> Crop math verified\n');
