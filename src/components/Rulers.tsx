import React from 'react';

const RULER_SIZE = 20; // px thickness of the ruler track
const GRID_SPACING = 50; // canvas-space pixels between grid lines
const MAJOR_TICK = 100; // canvas-space pixels between labeled ticks

const RULER_BG = 'rgba(23, 23, 27, 0.92)';
const RULER_FG = 'rgba(200, 200, 210, 0.85)';
const RULER_FG_DIM = 'rgba(150, 150, 160, 0.55)';
const GRID_COLOR = 'rgba(255, 255, 255, 0.06)';
const GRID_COLOR_MAJOR = 'rgba(255, 255, 255, 0.12)';

interface Props {
  width: number; // canvas width (unzoomed)
  height: number; // canvas height (unzoomed)
  zoom: number;
  showRulers: boolean;
  showGrid: boolean;
}

const Rulers: React.FC<Props> = ({ width, height, zoom, showRulers, showGrid }) => {
  const w = width * zoom;
  const h = height * zoom;

  // Choose a tick spacing that stays legible when zoomed out.
  let tickStep = 10; // canvas-space
  if (zoom < 0.35) tickStep = 100;
  else if (zoom < 0.6) tickStep = 50;
  else if (zoom < 1.2) tickStep = 20;

  const horizontalTicks: React.ReactNode[] = [];
  const verticalTicks: React.ReactNode[] = [];

  if (showRulers) {
    for (let x = 0; x <= width; x += tickStep) {
      const px = x * zoom;
      const isMajor = x % MAJOR_TICK === 0;
      horizontalTicks.push(
        <line
          key={`hx-${x}`}
          x1={px}
          y1={isMajor ? 8 : 13}
          x2={px}
          y2={RULER_SIZE}
          stroke={isMajor ? RULER_FG : RULER_FG_DIM}
          strokeWidth={1}
        />
      );
      if (isMajor && x > 0) {
        horizontalTicks.push(
          <text
            key={`ht-${x}`}
            x={px + 3}
            y={9}
            fontSize={9}
            fill={RULER_FG}
            style={{ fontFamily: 'ui-monospace, monospace' }}
          >
            {x}
          </text>
        );
      }
    }
    for (let y = 0; y <= height; y += tickStep) {
      const py = y * zoom;
      const isMajor = y % MAJOR_TICK === 0;
      verticalTicks.push(
        <line
          key={`vy-${y}`}
          x1={isMajor ? 8 : 13}
          y1={py}
          x2={RULER_SIZE}
          y2={py}
          stroke={isMajor ? RULER_FG : RULER_FG_DIM}
          strokeWidth={1}
        />
      );
      if (isMajor && y > 0) {
        verticalTicks.push(
          <text
            key={`vt-${y}`}
            x={2}
            y={py - 2}
            fontSize={9}
            fill={RULER_FG}
            style={{ fontFamily: 'ui-monospace, monospace' }}
          >
            {y}
          </text>
        );
      }
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block', pointerEvents: 'none' }}>
      {/* Corner block */}
      {showRulers && (
        <div
          style={{
            position: 'absolute',
            top: -RULER_SIZE,
            left: -RULER_SIZE,
            width: RULER_SIZE,
            height: RULER_SIZE,
            background: RULER_BG,
            borderRight: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        />
      )}

      {/* Top ruler */}
      {showRulers && (
        <svg
          width={w}
          height={RULER_SIZE}
          style={{
            position: 'absolute',
            top: -RULER_SIZE,
            left: 0,
            background: RULER_BG,
            borderBottom: '1px solid var(--border)',
          }}
        >
          {horizontalTicks}
        </svg>
      )}

      {/* Left ruler */}
      {showRulers && (
        <svg
          width={RULER_SIZE}
          height={h}
          style={{
            position: 'absolute',
            top: 0,
            left: -RULER_SIZE,
            background: RULER_BG,
            borderRight: '1px solid var(--border)',
          }}
        >
          {verticalTicks}
        </svg>
      )}

      {/* Grid overlay (positioned over canvas area) */}
      {showGrid && (
        <svg
          width={w}
          height={h}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}
        >
          <defs>
            <pattern
              id="editor-grid-minor"
              width={GRID_SPACING * zoom}
              height={GRID_SPACING * zoom}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${GRID_SPACING * zoom} 0 L 0 0 0 ${GRID_SPACING * zoom}`}
                fill="none"
                stroke={GRID_COLOR}
                strokeWidth={1}
              />
            </pattern>
            <pattern
              id="editor-grid-major"
              width={MAJOR_TICK * zoom}
              height={MAJOR_TICK * zoom}
              patternUnits="userSpaceOnUse"
            >
              <path
                d={`M ${MAJOR_TICK * zoom} 0 L 0 0 0 ${MAJOR_TICK * zoom}`}
                fill="none"
                stroke={GRID_COLOR_MAJOR}
                strokeWidth={1}
              />
            </pattern>
          </defs>
          <rect width={w} height={h} fill="url(#editor-grid-minor)" />
          <rect width={w} height={h} fill="url(#editor-grid-major)" />
        </svg>
      )}
    </div>
  );
};

export default Rulers;
