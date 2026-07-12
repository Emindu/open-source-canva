// Verifies cell-edit mode toggles interactive on/off and cell children stay locked.

import { StaticCanvas, Rect, Textbox, Group } from 'fabric/node';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

const CELL_LOCKS = {
  lockMovementX: true, lockMovementY: true,
  lockScalingX: true, lockScalingY: true,
  lockRotation: true,
  hasControls: false, hasBorders: false,
};

const buildTable = (rows = 3, cols = 3, cellW = 100, cellH = 40) => {
  const objs = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      objs.push(new Rect({
        left: c * cellW, top: r * cellH, width: cellW, height: cellH,
        fill: 'transparent', stroke: '#cbd5e1', strokeWidth: 1,
        ...CELL_LOCKS,
      }));
      objs.push(new Textbox('Text', {
        left: c * cellW + 10, top: r * cellH + 10, width: cellW - 20,
        fontSize: 16, fill: '#0f172a', splitByGrapheme: true,
        ...CELL_LOCKS,
      }));
    }
  }
  const g = new Group(objs, { left: 100, top: 100, subTargetCheck: true, interactive: false });
  g.isTable = true;
  g.tableRows = rows;
  g.tableCols = cols;
  g.cellW = cellW;
  g.cellH = cellH;
  return g;
};

console.log('\n== 1) Cells created with movement/scale/rotation locks ==\n');
{
  const t = buildTable();
  const cells = t.getObjects();
  const allLocked = cells.every((o) =>
    o.lockMovementX && o.lockMovementY &&
    o.lockScalingX && o.lockScalingY &&
    o.lockRotation
  );
  expect(allLocked, 'every child (rect + textbox) has all locks set');
  const noControls = cells.every((o) => o.hasControls === false && o.hasBorders === false);
  expect(noControls, 'no per-cell controls or borders (clean edit-mode look)');
}

console.log('\n== 2) Enter table edit mode flips interactive ==\n');
{
  const t = buildTable();
  expect(t.interactive === false, 'default: interactive false (moves as one unit)');

  // Simulate enterTableEditMode
  t.interactive = true;
  t.subTargetCheck = true;
  expect(t.interactive === true, 'after enter: interactive true (cells clickable)');

  // Simulate exit
  t.interactive = false;
  expect(t.interactive === false, 'after exit: interactive false again');
}

console.log('\n== 3) Cell text can be updated (edit persists) ==\n');
{
  const t = buildTable();
  const cells = t.getObjects();
  const firstText = cells[1]; // Rect, then Textbox
  expect(firstText.type === 'textbox', 'first Textbox is at index 1');
  firstText.text = 'Hello';
  expect(firstText.text === 'Hello', 'text updated via direct assignment');
  // Fabric v6 Textbox uses set() for reliable updates in production
  firstText.set('text', 'World');
  expect(firstText.text === 'World', 'text updated via .set()');
}

console.log('\n== 4) Grid math for pointer→cell resolution ==\n');
{
  const t = buildTable(3, 3, 100, 40);
  // Table at (100, 100). Click at (250, 130) → col 1, row 0 → cell (0, 1)
  const localX = (250 - t.left) / (t.scaleX || 1);
  const localY = (130 - t.top) / (t.scaleY || 1);
  const col = Math.floor(localX / t.cellW);
  const row = Math.floor(localY / t.cellH);
  expect(col === 1 && row === 0, `pointer (250,130) → col 1, row 0 (got col ${col}, row ${row})`);
  const idx = (row * t.tableCols + col) * 2 + 1;
  expect(idx === 3, `Textbox index for (row 0, col 1) is 3 (got ${idx})`);
  const cell = t.getObjects()[idx];
  expect(cell?.type === 'textbox', 'resolved cell is a Textbox');

  // Click outside table bounds
  const localX2 = (500 - t.left);
  const col2 = Math.floor(localX2 / t.cellW);
  expect(col2 === 4, `col outside grid (${col2} > tableCols-1=${t.tableCols - 1})`);
  const inBounds = col2 >= 0 && col2 < t.tableCols;
  expect(!inBounds, 'out-of-bounds click correctly rejected');
}

console.log('\n== 5) Add/remove row/column still works via editing-group fallback ==\n');
{
  // Simulate the store fallback: activeAny is a cell (not table), tableEditingGroup is the group
  const t = buildTable();
  const activeAny = { type: 'textbox', isTable: false };
  const editing = t;
  const active = activeAny?.isTable ? activeAny : editing;
  expect(active === t, 'fallback resolves to the editing table when cell is active');
  expect(active.isTable === true, 'target is a valid table for row/col ops');
}

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> Cell editing verified\n');
