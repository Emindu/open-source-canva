// Verifies brush type math: hexToRgba, width/opacity per brush.

import { StaticCanvas, PencilBrush } from 'fabric/node';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

const hexToRgba = (hex, alpha) => {
  const h = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!h) return hex;
  const r = parseInt(h[1].slice(0, 2), 16);
  const g = parseInt(h[1].slice(2, 4), 16);
  const b = parseInt(h[1].slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
};

console.log('\n== hexToRgba ==\n');
expect(hexToRgba('#7c5cff', 1) === 'rgba(124,92,255,1)', 'purple full alpha');
expect(hexToRgba('#000000', 0.5) === 'rgba(0,0,0,0.5)', 'black half alpha');
expect(hexToRgba('#ffffff', 0) === 'rgba(255,255,255,0)', 'white zero alpha');
expect(hexToRgba('bad', 1) === 'bad', 'invalid hex passes through');
expect(hexToRgba('#ff0000', 1.5) === 'rgba(255,0,0,1)', 'alpha clamped to 1');
expect(hexToRgba('#00ff00', -0.5) === 'rgba(0,255,0,0)', 'alpha clamped to 0');

console.log('\n== Brush configuration per type ==\n');
const applyBrush = (canvas, state) => {
  const brush = new PencilBrush(canvas);
  const { brushType, drawingColor, drawingWidth, drawingOpacity } = state;
  switch (brushType) {
    case 'pen':
      brush.width = drawingWidth;
      brush.color = hexToRgba(drawingColor, drawingOpacity);
      break;
    case 'marker':
      brush.width = drawingWidth * 1.6;
      brush.color = hexToRgba(drawingColor, Math.min(0.9, drawingOpacity));
      break;
    case 'highlighter':
      brush.width = drawingWidth * 3;
      brush.color = hexToRgba(drawingColor, Math.min(0.35, drawingOpacity * 0.4 + 0.05));
      break;
    case 'eraser':
      brush.width = drawingWidth * 2;
      brush.color = 'rgba(0,0,0,1)';
      break;
  }
  canvas.freeDrawingBrush = brush;
  return brush;
};

const canvas = new StaticCanvas(null, { width: 400, height: 300 });
const base = { drawingColor: '#7c5cff', drawingWidth: 10, drawingOpacity: 1 };

const pen = applyBrush(canvas, { ...base, brushType: 'pen' });
expect(pen.width === 10, `pen width preserved (${pen.width})`);
expect(pen.color === 'rgba(124,92,255,1)', `pen color at full opacity (${pen.color})`);

const marker = applyBrush(canvas, { ...base, brushType: 'marker' });
expect(marker.width === 16, `marker width 1.6× (${marker.width})`);
expect(marker.color === 'rgba(124,92,255,0.9)', `marker alpha capped at 0.9 (${marker.color})`);

const highlighter = applyBrush(canvas, { ...base, brushType: 'highlighter' });
expect(highlighter.width === 30, `highlighter width 3× (${highlighter.width})`);
// opacity * 0.4 + 0.05 = 0.45, capped at 0.35
expect(highlighter.color === 'rgba(124,92,255,0.35)', `highlighter alpha capped at 0.35 (${highlighter.color})`);

const eraser = applyBrush(canvas, { ...base, brushType: 'eraser' });
expect(eraser.width === 20, `eraser width 2× (${eraser.width})`);
expect(eraser.color === 'rgba(0,0,0,1)', `eraser color irrelevant, uses opaque black (${eraser.color})`);

console.log('\n== Opacity slider variation ==\n');
const pen50 = applyBrush(canvas, { ...base, brushType: 'pen', drawingOpacity: 0.5 });
expect(pen50.color === 'rgba(124,92,255,0.5)', `pen at 50% opacity → alpha 0.5 (${pen50.color})`);

const marker50 = applyBrush(canvas, { ...base, brushType: 'marker', drawingOpacity: 0.5 });
expect(marker50.color === 'rgba(124,92,255,0.5)', `marker at 50% → alpha 0.5 (below 0.9 cap) (${marker50.color})`);

const hi0 = applyBrush(canvas, { ...base, brushType: 'highlighter', drawingOpacity: 0 });
// 0 * 0.4 + 0.05 = 0.05, below 0.35 cap
expect(hi0.color === 'rgba(124,92,255,0.05)', `highlighter at 0% still visible faint (${hi0.color})`);

console.log('\n== Eraser via destination-out (path composite) ==\n');
// Simulate what path:created hook does
const fakePath = { globalCompositeOperation: 'source-over', selectable: true, evented: true };
const setPathComposite = (path) => {
  path.globalCompositeOperation = 'destination-out';
  path.selectable = false;
  path.evented = false;
};
setPathComposite(fakePath);
expect(fakePath.globalCompositeOperation === 'destination-out', 'eraser path uses destination-out');
expect(fakePath.selectable === false, 'eraser path not selectable');
expect(fakePath.evented === false, 'eraser path not evented');

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All brush behavior verified\n');
