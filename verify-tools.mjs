// Verifies fabric v6 tool primitives work: PencilBrush setup, sticky-note group,
// table geometry.

import { StaticCanvas, PencilBrush, Rect, Textbox, Group, Shadow } from 'fabric/node';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

console.log('\n== 1) Draw tool — PencilBrush ==\n');
{
  const canvas = new StaticCanvas(null, { width: 400, height: 300 });
  // Simulate what the store does when entering draw mode
  const brush = new PencilBrush(canvas);
  brush.color = '#7c5cff';
  brush.width = 6;
  canvas.freeDrawingBrush = brush;
  canvas.isDrawingMode = true;

  expect(canvas.isDrawingMode === true, 'isDrawingMode is true');
  expect(canvas.freeDrawingBrush instanceof PencilBrush, 'freeDrawingBrush is a PencilBrush');
  expect(canvas.freeDrawingBrush?.color === '#7c5cff', 'brush color applied');
  expect(canvas.freeDrawingBrush?.width === 6, 'brush width applied');

  // Adjust color mid-session
  canvas.freeDrawingBrush.color = '#ef4444';
  expect(canvas.freeDrawingBrush.color === '#ef4444', 'color can change while active');

  // Exit
  canvas.isDrawingMode = false;
  expect(canvas.isDrawingMode === false, 'exit mode works');
}

console.log('\n== 2) Sticky note — Group of yellow rect + editable text ==\n');
{
  const size = 200;
  const rect = new Rect({
    left: 0, top: 0, width: size, height: size,
    fill: '#fef08a', stroke: '#facc15', strokeWidth: 1,
    rx: 6, ry: 6,
    shadow: new Shadow({ color: 'rgba(0,0,0,0.25)', blur: 12, offsetX: 2, offsetY: 4 }),
  });
  const text = new Textbox('Add a note...', {
    left: 16, top: 20, width: size - 32,
    fontSize: 18, fontFamily: 'Inter', fill: '#111827',
  });
  const group = new Group([rect, text], {
    left: 220, top: 220,
    subTargetCheck: true,
    interactive: true,
  });

  expect(group.type === 'group', 'sticky note is a group');
  expect(group.getObjects().length === 2, 'group contains rect + text');
  expect(group.subTargetCheck === true, 'subTargetCheck enables inner double-click');
  const inner = group.getObjects();
  expect(inner[0].fill === '#fef08a', 'yellow background');
  expect(inner[1].text === 'Add a note...', 'placeholder text present');
  expect(!!inner[0].shadow, 'shadow attached to rect');
}

console.log('\n== 3) Table geometry — 3x3 grid, cells 100×40 ==\n');
{
  const rows = 3, cols = 3, cellW = 100, cellH = 40;
  const objs = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      objs.push(
        new Rect({
          left: c * cellW, top: r * cellH,
          width: cellW, height: cellH,
          fill: 'transparent', stroke: '#cbd5e1', strokeWidth: 1,
        })
      );
      objs.push(
        new Textbox('Text', {
          left: c * cellW + 10, top: r * cellH + 10,
          width: cellW - 20, fontSize: 16, fill: '#0f172a',
        })
      );
    }
  }
  const group = new Group(objs, { left: 100, top: 100, subTargetCheck: true, interactive: true });

  expect(group.getObjects().length === rows * cols * 2, `9 cells × 2 objects = 18 (got ${group.getObjects().length})`);
  // Text in cell (0,0) sits at x=10, y=10 with 16px font → text bottom ≈ 28 < cellH=40 ✓
  const firstText = group.getObjects()[1];
  const textBottom = (firstText.top || 0) + (firstText.fontSize || 0) * 1.16;
  expect(textBottom < cellH, `text height ${textBottom.toFixed(1)}px stays inside cell height ${cellH}`);
  // Text width 80 fits horizontally in cell 100 with 10+10 padding
  expect((firstText.width || 0) + 20 === cellW, 'text width 80 + 20 padding = cell 100');
}

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All tools verified\n');
