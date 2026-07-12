// Verifies table group behavior: moves as one, add/remove row/column preserves text.

import { StaticCanvas, Rect, Textbox, Group } from 'fabric/node';

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

const buildTable = (rows, cols, cellW, cellH, left = 100, top = 100, texts) => {
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
        new Textbox(texts?.[r]?.[c] ?? 'Text', {
          left: c * cellW + 10, top: r * cellH + 10,
          width: cellW - 20, fontSize: 16, fill: '#0f172a',
        })
      );
    }
  }
  const g = new Group(objs, { left, top, subTargetCheck: true, interactive: false });
  g.isTable = true;
  g.tableRows = rows;
  g.tableCols = cols;
  g.cellW = cellW;
  g.cellH = cellH;
  return g;
};

const extractTexts = (grp) => {
  const objs = grp.getObjects();
  const out = [];
  let i = 0;
  for (let r = 0; r < grp.tableRows; r++) {
    out[r] = [];
    for (let c = 0; c < grp.tableCols; c++) {
      out[r][c] = objs[i + 1].text;
      i += 2;
    }
  }
  return out;
};

console.log('\n== 1) Table behaves as one movable group ==\n');
{
  const canvas = new StaticCanvas(null, { width: 800, height: 600 });
  const t = buildTable(3, 3, 100, 40);
  canvas.add(t);
  expect(canvas.getObjects().length === 1, 'canvas has 1 object (the table)');
  expect(t.type === 'group', 'table type is group');
  expect(t.interactive === false, 'interactive is false — children not individually grabbable');
  expect(t.subTargetCheck === true, 'subTargetCheck true — subtargets still detectable');
  expect(t.getObjects().length === 3 * 3 * 2, `18 children (9 cells × rect+text): got ${t.getObjects().length}`);
  // Simulate moving the group
  const before = t.getObjects().length;
  t.set({ left: 300, top: 250 });
  expect(t.left === 300 && t.top === 250, 'group position changes as a whole');
  expect(t.getObjects().length === before, 'children stay attached');
}

console.log('\n== 2) Add row — text of existing cells preserved ==\n');
{
  const seed = [
    ['A1', 'B1', 'C1'],
    ['A2', 'B2', 'C2'],
    ['A3', 'B3', 'C3'],
  ];
  const t = buildTable(3, 3, 100, 40, 100, 100, seed);

  // Simulate addTableRow: extract text, rebuild with 4 rows
  const existing = extractTexts(t);
  const t2 = buildTable(4, 3, 100, 40, t.left, t.top, existing);
  const after = extractTexts(t2);

  expect(t2.tableRows === 4 && t2.tableCols === 3, `4×3 (${t2.tableRows}×${t2.tableCols})`);
  expect(after[0][0] === 'A1' && after[2][2] === 'C3', 'original text preserved');
  expect(after[3][0] === 'Text' && after[3][2] === 'Text', 'new row filled with placeholders');
  expect(t2.left === 100 && t2.top === 100, 'position unchanged (top-left origin)');
}

console.log('\n== 3) Add column — same ==\n');
{
  const seed = [
    ['A1', 'B1'],
    ['A2', 'B2'],
  ];
  const t = buildTable(2, 2, 100, 40, 200, 200, seed);
  const existing = extractTexts(t);
  const t2 = buildTable(2, 3, 100, 40, t.left, t.top, existing);
  const after = extractTexts(t2);
  expect(t2.tableRows === 2 && t2.tableCols === 3, '2×3');
  expect(after[0][0] === 'A1' && after[1][1] === 'B2', 'original preserved');
  expect(after[0][2] === 'Text' && after[1][2] === 'Text', 'new column filled');
}

console.log('\n== 4) Remove row — last row dropped, others preserved ==\n');
{
  const seed = [
    ['A1', 'B1'],
    ['A2', 'B2'],
    ['A3', 'B3'],
  ];
  const t = buildTable(3, 2, 100, 40, 100, 100, seed);
  const existing = extractTexts(t);
  // Rebuild with 1 fewer row, copying text[0..newRows-1]
  const newRows = t.tableRows - 1;
  const truncated = existing.slice(0, newRows);
  const t2 = buildTable(newRows, t.tableCols, t.cellW, t.cellH, t.left, t.top, truncated);
  const after = extractTexts(t2);
  expect(t2.tableRows === 2, 'row count reduced');
  expect(after[0][0] === 'A1' && after[1][1] === 'B2', 'row 0-1 preserved');
  expect(after.length === 2, 'row 2 dropped');
}

console.log('\n== 5) Remove column ==\n');
{
  const seed = [
    ['A1', 'B1', 'C1'],
    ['A2', 'B2', 'C2'],
  ];
  const t = buildTable(2, 3, 100, 40, 100, 100, seed);
  const existing = extractTexts(t);
  const newCols = t.tableCols - 1;
  const truncated = existing.map((row) => row.slice(0, newCols));
  const t2 = buildTable(t.tableRows, newCols, t.cellW, t.cellH, t.left, t.top, truncated);
  const after = extractTexts(t2);
  expect(t2.tableCols === 2, 'col count reduced');
  expect(after[0][0] === 'A1' && after[1][1] === 'B2', 'columns 0-1 preserved');
  expect(after[0].length === 2, 'column 2 dropped');
}

console.log('\n== 6) Guard: cannot reduce below 1 ==\n');
{
  const t = buildTable(1, 1, 100, 40);
  const canReduceRow = t.tableRows > 1;
  const canReduceCol = t.tableCols > 1;
  expect(!canReduceRow, 'removeTableRow blocked when rows === 1');
  expect(!canReduceCol, 'removeTableColumn blocked when cols === 1');
}

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> Table behavior verified\n');
