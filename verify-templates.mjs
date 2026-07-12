// Verifies that no template has vertically overlapping text/shape blocks
// (based on their declared top + estimated rendered height) and that all
// content stays within the canvas bounds.

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

// Rough text height = fontSize * lineHeight * lineCount + a safety pad.
const textH = (fontSize, lineHeight, lineCount) =>
  fontSize * lineHeight * lineCount + 4;

console.log('\n== Template layout math (no overlaps, within bounds) ==\n');

// Each entry: { name, W, H, blocks: [{ id, top, height }] }
const layouts = [
  {
    name: 'IG Post — Modern',
    W: 1080, H: 1080,
    blocks: [
      { id: 'accent',  top: 140, height: 6 },
      { id: 'heading', top: 170, height: textH(92, 1.08, 2) },   // 'Big Bold\nHeading' → 2 lines
      { id: 'sub',     top: 430, height: textH(30, 1.4, 2) },    // may wrap 1-2 lines
      { id: 'cta',     top: 900, height: textH(28, 1.16, 1) },
    ],
  },
  {
    name: 'IG Story — Sale',
    W: 1080, H: 1920,
    blocks: [
      { id: 'badge',        top: 220, height: 64 },
      // badgeText is centered on badge — treated as inside badge for overlap
      { id: 'heading', top: 360, height: textH(200, 1.05, 2) }, // MEGA / SALE
      { id: 'sub',     top: 900, height: textH(40, 1.4, 2) },
      { id: 'cta',     top: 1120, height: textH(36, 1.16, 1) },
    ],
  },
  {
    name: 'YouTube Thumbnail',
    W: 1280, H: 720,
    blocks: [
      { id: 'badge',   top: 60,  height: 52 },
      { id: 'heading', top: 160, height: textH(80, 1.08, 2) }, // 2 lines
      { id: 'sub',     top: 420, height: textH(36, 1.4, 1) },
    ],
  },
  {
    name: 'Facebook Cover',
    W: 820, H: 312,
    blocks: [
      { id: 'bar',     top: 100, height: 100 },
      // Heading is intentionally positioned to visually align with the bar.
      { id: 'heading', top: 96,  height: textH(44, 1.08, 1) },
      { id: 'sub',     top: 168, height: textH(22, 1.4, 1) },
    ],
    allowOverlaps: [['bar', 'heading'], ['bar', 'sub']], // bar is a design accent, may share rows
  },
  {
    name: 'A4 Event Poster',
    W: 794, H: 1123,
    blocks: [
      { id: 'tag',     top: 80,   height: textH(22, 1.4, 1) },
      { id: 'heading', top: 150,  height: textH(104, 1.05, 2) }, // DESIGN / SHOWCASE
      { id: 'sub',     top: 480,  height: textH(26, 1.4, 2) },
      { id: 'cta',     top: 1000, height: textH(22, 1.16, 1) },
    ],
  },
];

const isAllowed = (a, b, allowed) =>
  !!allowed?.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

for (const layout of layouts) {
  console.log(`\n${layout.name} (${layout.W}×${layout.H}):`);
  const blocks = layout.blocks;

  // 1) All blocks within vertical canvas bounds
  let allInside = true;
  for (const b of blocks) {
    const end = b.top + b.height;
    if (end > layout.H) {
      fail(`  block "${b.id}" ends at ${end.toFixed(0)}, past H=${layout.H}`);
      allInside = false;
    }
  }
  if (allInside) pass(`  all blocks fit vertically (max end ≤ ${layout.H})`);

  // 2) No two blocks overlap vertically (unless explicitly allowed)
  let anyOverlap = false;
  for (let i = 0; i < blocks.length; i++) {
    for (let j = i + 1; j < blocks.length; j++) {
      const a = blocks[i];
      const b = blocks[j];
      const aEnd = a.top + a.height;
      const bEnd = b.top + b.height;
      const overlap = a.top < bEnd && b.top < aEnd;
      if (overlap && !isAllowed(a.id, b.id, layout.allowOverlaps)) {
        fail(`  "${a.id}" (${a.top}-${aEnd.toFixed(0)}) overlaps "${b.id}" (${b.top}-${bEnd.toFixed(0)})`);
        anyOverlap = true;
      }
    }
  }
  if (!anyOverlap) pass('  no unexpected vertical overlaps');

  // 3) Gaps between adjacent blocks are reasonable (>= 20px)
  const sorted = [...blocks].sort((a, b) => a.top - b.top);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    const gap = cur.top - (prev.top + prev.height);
    if (gap < 20 && !isAllowed(prev.id, cur.id, layout.allowOverlaps)) {
      fail(`  gap between "${prev.id}" and "${cur.id}" is only ${gap.toFixed(0)}px (< 20px)`);
    }
  }
}

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All templates lay out cleanly\n');
