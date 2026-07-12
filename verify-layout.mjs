// Verifies distribute-evenly math and snap logic.

const pass = (m) => console.log(`  ✓ ${m}`);
const fail = (m) => { console.log(`  ✗ ${m}`); process.exitCode = 1; };
const expect = (c, m) => (c ? pass(m) : fail(m));

console.log('\n== Distribute evenly (horizontal) ==\n');
{
  // Three rects: leftmost at x=0 w=100, right at x=500 w=100, middle at x=200 w=100
  // After distribute: gap should be equal. Total span = 600. Objs width = 300. Gap = (600-300)/2 = 150.
  // So middle should sit at 0 + 100 + 150 = 250.
  const objects = [
    { left: 0, width: 100, scaleX: 1, id: 'A' },
    { left: 200, width: 100, scaleX: 1, id: 'B' },
    { left: 500, width: 100, scaleX: 1, id: 'C' },
  ];
  const getScaledWidth = (o) => o.width * (o.scaleX ?? 1);

  const sorted = [...objects].sort((a, b) => a.left - b.left);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalSpan = last.left + getScaledWidth(last) - first.left;
  const objsWidth = sorted.reduce((s, o) => s + getScaledWidth(o), 0);
  const gap = (totalSpan - objsWidth) / (sorted.length - 1);
  let cursor = first.left + getScaledWidth(first) + gap;
  for (let i = 1; i < sorted.length - 1; i++) {
    sorted[i].left = cursor;
    cursor += getScaledWidth(sorted[i]) + gap;
  }

  expect(sorted[0].left === 0, 'A stays at 0 (leftmost fixed)');
  expect(sorted[1].left === 250, `B lands at 250 (got ${sorted[1].left})`);
  expect(sorted[2].left === 500, 'C stays at 500 (rightmost fixed)');
  // Gaps between should be equal
  const gap1 = sorted[1].left - (sorted[0].left + getScaledWidth(sorted[0]));
  const gap2 = sorted[2].left - (sorted[1].left + getScaledWidth(sorted[1]));
  expect(gap1 === gap2, `equal gaps (${gap1} === ${gap2})`);
}

console.log('\n== Distribute evenly (vertical) ==\n');
{
  const objects = [
    { top: 0, height: 100, scaleY: 1 },
    { top: 50, height: 80, scaleY: 1 },
    { top: 150, height: 120, scaleY: 1 },
    { top: 400, height: 100, scaleY: 1 },
  ];
  const getH = (o) => o.height * (o.scaleY ?? 1);
  const sorted = [...objects].sort((a, b) => a.top - b.top);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const totalSpan = last.top + getH(last) - first.top;
  const objsHeight = sorted.reduce((s, o) => s + getH(o), 0);
  const gap = (totalSpan - objsHeight) / (sorted.length - 1);
  let cursor = first.top + getH(first) + gap;
  for (let i = 1; i < sorted.length - 1; i++) {
    sorted[i].top = cursor;
    cursor += getH(sorted[i]) + gap;
  }
  // Verify equal spacing between all pairs
  const gaps = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    gaps.push(sorted[i + 1].top - (sorted[i].top + getH(sorted[i])));
  }
  const uniform = gaps.every((g) => Math.abs(g - gaps[0]) < 0.001);
  expect(uniform, `4 objects → 3 equal gaps: [${gaps.join(', ')}]`);
  expect(sorted[0].top === 0, 'first stays put');
  expect(sorted[sorted.length - 1].top === 400, 'last stays put');
}

console.log('\n== Snap threshold logic ==\n');
{
  // Simulates snapAndComputeGuides core: find best snap within threshold
  const SNAP_THRESHOLD = 6;
  const scenario = (movingPoints, targets) => {
    let best = null;
    for (const t of targets) {
      for (const p of movingPoints) {
        const d = t - p;
        if (Math.abs(d) < SNAP_THRESHOLD && (!best || Math.abs(d) < Math.abs(best.delta))) {
          best = { delta: d, target: t };
        }
      }
    }
    return best;
  };

  // Moving obj left=95, width=100 → points 95, 145, 195
  // Canvas center at 200 → should snap right edge (195) to 200 by delta +5
  const s1 = scenario([95, 145, 195], [0, 200, 400]);
  expect(s1 && s1.target === 200 && s1.delta === 5, `snap right→center: delta ${s1?.delta}, target ${s1?.target}`);

  // Moving obj left=101, w=100 → points 101, 151, 201. Threshold 6.
  // Canvas center 200 → right edge 201 within threshold (delta -1). Should snap.
  const s2 = scenario([101, 151, 201], [0, 200, 400]);
  expect(s2 && s2.target === 200 && s2.delta === -1, `snap right→center delta -1: got ${s2?.delta}`);

  // Moving obj far from any target → no snap
  const s3 = scenario([100, 150, 200], [500, 600, 700]);
  expect(s3 === null, 'no snap when out of threshold');

  // Multiple candidates within threshold → picks closest
  // Points [100, 150, 200], targets [104, 105, 195].
  // 104 - 100 = 4; 105 - 100 = 5; 195 - 200 = -5. Best is 4 (target 104).
  const s4 = scenario([100, 150, 200], [104, 105, 195]);
  expect(s4 && s4.target === 104, `closest wins: target ${s4?.target} delta ${s4?.delta}`);
}

console.log(process.exitCode ? '\n=> FAILURES\n' : '\n=> All checks passed\n');
