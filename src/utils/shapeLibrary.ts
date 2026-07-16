import React from 'react';
import * as fabric from 'fabric';

export type ShapeCategory =
  | 'basic'
  | 'lines'
  | 'polygons'
  | 'flowchart'
  | 'symbols'
  | 'badges'
  | 'organic';

export interface ShapeEntry {
  id: string;
  label: string;
  category: ShapeCategory;
  keywords: string;
  preview: React.ReactNode;
  build: () => fabric.Object;
}

/* -------------------- helpers -------------------- */

const ACCENT = '#3b82f6';
const LEFT = 200;
const TOP = 200;

const previewCommon = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinejoin: 'round' as const,
  strokeLinecap: 'round' as const,
};
const svg = (children: React.ReactNode): React.ReactNode =>
  React.createElement('svg', { width: 28, height: 28, viewBox: '0 0 24 24' }, children);

const el = (tag: string, attrs: Record<string, any>, children?: React.ReactNode) =>
  React.createElement(tag, { ...previewCommon, ...attrs }, children);

const regularPolygonPoints = (sides: number, r = 60) => {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < sides; i++) {
    const a = (i * 2 * Math.PI) / sides - Math.PI / 2;
    pts.push({ x: r + Math.cos(a) * r, y: r + Math.sin(a) * r });
  }
  return pts;
};

const starPoints = (points: number, outerR: number, innerR: number) => {
  const step = Math.PI / points;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = i * step - Math.PI / 2;
    pts.push({ x: outerR + Math.cos(a) * r, y: outerR + Math.sin(a) * r });
  }
  return pts;
};

const withStyle = <T extends fabric.Object>(obj: T, extra?: Partial<fabric.Object>): T => {
  obj.set({ fill: ACCENT, left: LEFT, top: TOP, ...(extra as any) });
  return obj;
};

/* -------------------- library entries -------------------- */

export const SHAPE_LIB: ShapeEntry[] = [
  /* ============ BASIC ============ */
  {
    id: 'square', label: 'Square', category: 'basic', keywords: 'box',
    preview: svg(el('rect', { x: 5, y: 5, width: 14, height: 14, rx: 1 })),
    build: () => withStyle(new fabric.Rect({ width: 140, height: 140, rx: 0, ry: 0 })),
  },
  {
    id: 'rectangle', label: 'Rectangle', category: 'basic', keywords: 'box rect',
    preview: svg(el('rect', { x: 3, y: 7, width: 18, height: 10, rx: 1 })),
    build: () => withStyle(new fabric.Rect({ width: 180, height: 110, rx: 0, ry: 0 })),
  },
  {
    id: 'rounded-rect', label: 'Rounded', category: 'basic', keywords: 'rectangle rounded corners',
    preview: svg(el('rect', { x: 3, y: 7, width: 18, height: 10, rx: 4 })),
    build: () => withStyle(new fabric.Rect({ width: 180, height: 110, rx: 24, ry: 24 })),
  },
  {
    id: 'circle', label: 'Circle', category: 'basic', keywords: 'round dot',
    preview: svg(el('circle', { cx: 12, cy: 12, r: 8 })),
    build: () => withStyle(new fabric.Circle({ radius: 70 })),
  },
  {
    id: 'ellipse', label: 'Ellipse', category: 'basic', keywords: 'oval',
    preview: svg(el('ellipse', { cx: 12, cy: 12, rx: 9, ry: 6 })),
    build: () => withStyle(new fabric.Ellipse({ rx: 90, ry: 60 })),
  },
  {
    id: 'triangle', label: 'Triangle', category: 'basic', keywords: 'equilateral',
    preview: svg(el('polygon', { points: '12,4 21,20 3,20' })),
    build: () => withStyle(new fabric.Triangle({ width: 140, height: 140 })),
  },
  {
    id: 'right-triangle', label: 'Right', category: 'basic', keywords: 'triangle 90 degree',
    preview: svg(el('polygon', { points: '4,4 4,20 20,20' })),
    build: () =>
      withStyle(
        new fabric.Polygon(
          [{ x: 0, y: 0 }, { x: 0, y: 140 }, { x: 140, y: 140 }],
          {}
        )
      ),
  },
  {
    id: 'inverted-triangle', label: 'Inverted', category: 'basic', keywords: 'triangle down',
    preview: svg(el('polygon', { points: '3,4 21,4 12,20' })),
    build: () =>
      withStyle(
        new fabric.Polygon(
          [{ x: 0, y: 0 }, { x: 140, y: 0 }, { x: 70, y: 140 }],
          {}
        )
      ),
  },

  /* ============ LINES & ARROWS ============ */
  {
    id: 'line-solid', label: 'Solid', category: 'lines', keywords: 'line',
    preview: svg(el('line', { x1: 3, y1: 12, x2: 21, y2: 12, strokeWidth: 2 })),
    build: () =>
      withStyle(
        new fabric.Line([0, 0, 220, 0], { stroke: ACCENT, strokeWidth: 4, strokeLineCap: 'round' } as any),
        { fill: '' }
      ),
  },
  {
    id: 'line-dashed', label: 'Dashed', category: 'lines', keywords: 'line',
    preview: svg(el('line', { x1: 3, y1: 12, x2: 21, y2: 12, strokeWidth: 2, strokeDasharray: '4 3' })),
    build: () =>
      withStyle(
        new fabric.Line([0, 0, 220, 0], {
          stroke: ACCENT, strokeWidth: 4, strokeDashArray: [10, 6], strokeLineCap: 'butt',
        } as any),
        { fill: '' }
      ),
  },
  {
    id: 'line-dotted', label: 'Dotted', category: 'lines', keywords: 'line',
    preview: svg(el('line', { x1: 3, y1: 12, x2: 21, y2: 12, strokeWidth: 2, strokeDasharray: '1 3' })),
    build: () =>
      withStyle(
        new fabric.Line([0, 0, 220, 0], {
          stroke: ACCENT, strokeWidth: 4, strokeDashArray: [2, 8], strokeLineCap: 'round',
        } as any),
        { fill: '' }
      ),
  },
  {
    id: 'line-curved', label: 'Curved', category: 'lines', keywords: 'line curve wave',
    preview: svg(el('path', { d: 'M 3 16 Q 12 4 21 16' })),
    build: () =>
      withStyle(
        new fabric.Path('M 0 60 Q 100 -20 200 60', { fill: '', stroke: ACCENT, strokeWidth: 4 } as any)
      ),
  },
  {
    id: 'arrow-block', label: 'Block arrow', category: 'lines', keywords: 'arrow right',
    preview: svg(el('polygon', { points: '2,10 12,10 12,6 22,12 12,18 12,14 2,14' })),
    build: () =>
      withStyle(
        new fabric.Polygon(
          [
            { x: 0, y: 20 }, { x: 60, y: 20 }, { x: 60, y: 0 }, { x: 100, y: 40 },
            { x: 60, y: 80 }, { x: 60, y: 60 }, { x: 0, y: 60 },
          ],
          {}
        )
      ),
  },
  {
    id: 'arrow-line', label: 'Arrow', category: 'lines', keywords: 'arrow thin',
    preview: svg(el('path', { d: 'M 3 12 L 19 12 M 15 8 L 21 12 L 15 16' })),
    build: () =>
      withStyle(
        new fabric.Path('M 0 20 L 180 20 M 160 0 L 200 20 L 160 40', {
          fill: '', stroke: ACCENT, strokeWidth: 4, strokeLineJoin: 'round',
        } as any)
      ),
  },
  {
    id: 'arrow-double', label: 'Double', category: 'lines', keywords: 'arrow bidirectional',
    preview: svg(
      el('path', { d: 'M 3 12 L 21 12 M 3 12 L 7 8 M 3 12 L 7 16 M 21 12 L 17 8 M 21 12 L 17 16' })
    ),
    build: () =>
      withStyle(
        new fabric.Path(
          'M 0 20 L 200 20 M 0 20 L 30 0 M 0 20 L 30 40 M 200 20 L 170 0 M 200 20 L 170 40',
          { fill: '', stroke: ACCENT, strokeWidth: 4, strokeLineJoin: 'round' } as any
        )
      ),
  },
  {
    id: 'arrow-curved', label: 'Curved arrow', category: 'lines', keywords: 'arrow',
    preview: svg(el('path', { d: 'M 3 18 Q 12 3 21 18 M 21 18 L 17 14 M 21 18 L 17 16' })),
    build: () =>
      withStyle(
        new fabric.Path('M 0 120 Q 100 -20 200 120 L 175 100 M 200 120 L 175 110', {
          fill: '', stroke: ACCENT, strokeWidth: 4, strokeLineJoin: 'round',
        } as any)
      ),
  },
  {
    id: 'flowchart-connector', label: 'Connector', category: 'lines', keywords: 'flowchart line dot',
    preview: svg([
      el('circle', { cx: 4, cy: 12, r: 1.5, fill: 'currentColor', stroke: 'none' }),
      el('line', { x1: 4, y1: 12, x2: 20, y2: 12, strokeWidth: 2 }),
      el('circle', { cx: 20, cy: 12, r: 1.5, fill: 'currentColor', stroke: 'none' }),
    ]),
    build: () => {
      const line = new fabric.Line([10, 20, 190, 20], { stroke: ACCENT, strokeWidth: 4 } as any);
      const a = new fabric.Circle({ radius: 8, left: 0, top: 12, fill: ACCENT });
      const b = new fabric.Circle({ radius: 8, left: 184, top: 12, fill: ACCENT });
      return withStyle(new fabric.Group([line, a, b] as any), { fill: '' });
    },
  },

  /* ============ POLYGONS ============ */
  {
    id: 'diamond', label: 'Diamond', category: 'polygons', keywords: 'square rotated',
    preview: svg(el('polygon', { points: '12,3 21,12 12,21 3,12' })),
    build: () =>
      withStyle(
        new fabric.Polygon(
          [
            { x: 70, y: 0 }, { x: 140, y: 70 }, { x: 70, y: 140 }, { x: 0, y: 70 },
          ],
          {}
        )
      ),
  },
  {
    id: 'rhombus', label: 'Rhombus', category: 'polygons', keywords: 'slanted diamond',
    preview: svg(el('polygon', { points: '9,4 21,4 15,20 3,20' })),
    build: () =>
      withStyle(
        new fabric.Polygon(
          [
            { x: 60, y: 0 }, { x: 160, y: 0 }, { x: 100, y: 140 }, { x: 0, y: 140 },
          ],
          {}
        )
      ),
  },
  {
    id: 'trapezoid', label: 'Trapezoid', category: 'polygons', keywords: 'polygon',
    preview: svg(el('polygon', { points: '7,4 17,4 21,20 3,20' })),
    build: () =>
      withStyle(
        new fabric.Polygon(
          [
            { x: 40, y: 0 }, { x: 120, y: 0 }, { x: 160, y: 120 }, { x: 0, y: 120 },
          ],
          {}
        )
      ),
  },
  {
    id: 'parallelogram', label: 'Parallelogram', category: 'polygons', keywords: 'skewed',
    preview: svg(el('polygon', { points: '7,4 21,4 17,20 3,20' })),
    build: () =>
      withStyle(
        new fabric.Polygon(
          [
            { x: 40, y: 0 }, { x: 180, y: 0 }, { x: 140, y: 120 }, { x: 0, y: 120 },
          ],
          {}
        )
      ),
  },
  {
    id: 'pentagon', label: 'Pentagon', category: 'polygons', keywords: '5 sides',
    preview: svg(el('polygon', { points: '12,3 22,10 18,21 6,21 2,10' })),
    build: () => withStyle(new fabric.Polygon(regularPolygonPoints(5), {})),
  },
  {
    id: 'hexagon', label: 'Hexagon', category: 'polygons', keywords: '6 sides',
    preview: svg(el('polygon', { points: '7,3 17,3 22,12 17,21 7,21 2,12' })),
    build: () => withStyle(new fabric.Polygon(regularPolygonPoints(6), {})),
  },
  {
    id: 'octagon', label: 'Octagon', category: 'polygons', keywords: '8 sides stop',
    preview: svg(el('polygon', { points: '8,3 16,3 21,8 21,16 16,21 8,21 3,16 3,8' })),
    build: () => withStyle(new fabric.Polygon(regularPolygonPoints(8), {})),
  },

  /* ============ FLOWCHART ============ */
  {
    id: 'fc-process', label: 'Process', category: 'flowchart', keywords: 'block rectangle',
    preview: svg(el('rect', { x: 3, y: 7, width: 18, height: 10, rx: 1 })),
    build: () => withStyle(new fabric.Rect({ width: 200, height: 100, rx: 4, ry: 4 })),
  },
  {
    id: 'fc-decision', label: 'Decision', category: 'flowchart', keywords: 'diamond if',
    preview: svg(el('polygon', { points: '12,4 20,12 12,20 4,12' })),
    build: () =>
      withStyle(
        new fabric.Polygon(
          [
            { x: 90, y: 0 }, { x: 180, y: 60 }, { x: 90, y: 120 }, { x: 0, y: 60 },
          ],
          {}
        )
      ),
  },
  {
    id: 'fc-document', label: 'Document', category: 'flowchart', keywords: 'paper page',
    preview: svg(
      el('path', { d: 'M 3 5 L 21 5 L 21 17 Q 15 20 12 17 Q 9 14 3 17 Z' })
    ),
    build: () =>
      withStyle(
        new fabric.Path('M 0 0 L 200 0 L 200 90 Q 150 110 100 90 Q 50 70 0 90 Z', {} as any)
      ),
  },
  {
    id: 'fc-data', label: 'Data I/O', category: 'flowchart', keywords: 'parallelogram input',
    preview: svg(el('polygon', { points: '7,5 21,5 17,19 3,19' })),
    build: () =>
      withStyle(
        new fabric.Polygon(
          [
            { x: 40, y: 0 }, { x: 200, y: 0 }, { x: 160, y: 100 }, { x: 0, y: 100 },
          ],
          {}
        )
      ),
  },
  {
    id: 'fc-terminal', label: 'Terminal', category: 'flowchart', keywords: 'capsule pill start',
    preview: svg(el('rect', { x: 3, y: 8, width: 18, height: 8, rx: 4 })),
    build: () => withStyle(new fabric.Rect({ width: 200, height: 80, rx: 40, ry: 40 })),
  },
  {
    id: 'fc-cylinder', label: 'Data store', category: 'flowchart', keywords: 'database cylinder',
    preview: svg(
      el('path', {
        d: 'M 5 6 A 7 2 0 0 1 19 6 L 19 18 A 7 2 0 0 1 5 18 Z M 5 6 A 7 2 0 0 0 19 6',
      })
    ),
    build: () =>
      withStyle(
        new fabric.Path(
          'M 0 20 A 100 20 0 0 1 200 20 L 200 120 A 100 20 0 0 1 0 120 Z M 0 20 A 100 20 0 0 0 200 20',
          {} as any
        )
      ),
  },

  /* ============ SYMBOLS ============ */
  {
    id: 'star-4', label: '4-star', category: 'symbols', keywords: 'star sparkle',
    preview: svg(el('polygon', { points: '12,2 14,10 22,12 14,14 12,22 10,14 2,12 10,10' })),
    build: () => {
      const pts = starPoints(4, 70, 22);
      return withStyle(new fabric.Polygon(pts, {}), { fill: '#facc15' });
    },
  },
  {
    id: 'star-5', label: '5-star', category: 'symbols', keywords: 'star',
    preview: svg(el('polygon', { points: '12,3 14.6,9.3 21,10 16,14.5 17.6,21 12,17.6 6.4,21 8,14.5 3,10 9.4,9.3' })),
    build: () => {
      const pts = starPoints(5, 70, 30);
      return withStyle(new fabric.Polygon(pts, {}), { fill: '#facc15' });
    },
  },
  {
    id: 'star-6', label: '6-star', category: 'symbols', keywords: 'star',
    preview: svg(el('polygon', { points: '12,2 14,9 21,9 15.5,13 17.5,20 12,16 6.5,20 8.5,13 3,9 10,9' })),
    build: () => {
      const pts = starPoints(6, 70, 40);
      return withStyle(new fabric.Polygon(pts, {}), { fill: '#facc15' });
    },
  },
  {
    id: 'starburst', label: 'Starburst', category: 'symbols', keywords: 'star burst rays',
    preview: svg(el('polygon', {
      points: '12,2 13,8 18,4 15,10 21,10 16,13 21,18 15,16 18,21 13,17 12,22 11,17 6,21 9,16 3,18 8,13 3,10 9,10 6,4 11,8',
    })),
    build: () => {
      const pts = starPoints(12, 70, 45);
      return withStyle(new fabric.Polygon(pts, {}), { fill: '#facc15' });
    },
  },
  {
    id: 'square-star', label: 'Square star', category: 'symbols', keywords: 'star square',
    preview: svg(el('polygon', { points: '12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9' })),
    build: () => {
      // 4-point star with squared inner corners
      const outer = 70;
      const inner = 40;
      const pts = [
        { x: outer, y: 0 }, { x: outer + inner, y: outer - inner },
        { x: 2 * outer, y: outer }, { x: outer + inner, y: outer + inner },
        { x: outer, y: 2 * outer }, { x: outer - inner, y: outer + inner },
        { x: 0, y: outer }, { x: outer - inner, y: outer - inner },
      ];
      return withStyle(new fabric.Polygon(pts, {}), { fill: '#facc15' });
    },
  },
  {
    id: 'heart', label: 'Heart', category: 'symbols', keywords: 'love',
    preview: svg(el('path', {
      d: 'M12 20 C5 14 3 11 3 8.5 A4.5 4.5 0 0 1 12 7 A4.5 4.5 0 0 1 21 8.5 C21 11 19 14 12 20 Z',
    })),
    build: () =>
      withStyle(
        new fabric.Path(
          'M75,40 C75,10 30,10 30,40 C30,70 75,110 75,110 C75,110 120,70 120,40 C120,10 75,10 75,40 Z',
          {} as any
        ),
        { fill: '#ef4444' }
      ),
  },
  {
    id: 'cross-plus', label: 'Plus', category: 'symbols', keywords: 'cross medical add',
    preview: svg(el('polygon', { points: '10,3 14,3 14,10 21,10 21,14 14,14 14,21 10,21 10,14 3,14 3,10 10,10' })),
    build: () => {
      const total = 120;
      const arm = 40;
      const off = (total - arm) / 2;
      const pts = [
        { x: off, y: 0 }, { x: off + arm, y: 0 },
        { x: off + arm, y: off }, { x: total, y: off },
        { x: total, y: off + arm }, { x: off + arm, y: off + arm },
        { x: off + arm, y: total }, { x: off, y: total },
        { x: off, y: off + arm }, { x: 0, y: off + arm },
        { x: 0, y: off }, { x: off, y: off },
      ];
      return withStyle(new fabric.Polygon(pts, {}), { fill: '#ef4444' });
    },
  },
  {
    id: 'bubble-round', label: 'Bubble', category: 'symbols', keywords: 'speech chat comment',
    preview: svg(el('path', {
      d: 'M4 4 h13 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -2 2 h-7 l-3 3 v-3 h-3 a2 2 0 0 1 -2 -2 v-8 a2 2 0 0 1 2 -2 z',
    })),
    build: () =>
      withStyle(
        new fabric.Path(
          'M20,0 L140,0 Q160,0 160,20 L160,80 Q160,100 140,100 L60,100 L40,130 L48,100 L20,100 Q0,100 0,80 L0,20 Q0,0 20,0 Z',
          {} as any
        )
      ),
  },
  {
    id: 'bubble-square', label: 'Bubble sq.', category: 'symbols', keywords: 'speech square comment',
    preview: svg(el('path', {
      d: 'M3 4 h18 v11 h-9 l-4 4 v-4 h-5 z',
    })),
    build: () =>
      withStyle(
        new fabric.Path(
          'M0,0 L200,0 L200,100 L80,100 L40,140 L45,100 L0,100 Z',
          {} as any
        )
      ),
  },
  {
    id: 'bubble-pill', label: 'Bubble pill', category: 'symbols', keywords: 'speech pill',
    preview: svg(el('path', {
      d: 'M6 4 h12 a5 5 0 0 1 0 10 h-5 l-4 4 v-4 h-3 a5 5 0 0 1 0 -10 z',
    })),
    build: () =>
      withStyle(
        new fabric.Path(
          'M40,0 L160,0 Q210,0 210,50 Q210,100 160,100 L80,100 L40,140 L48,100 Q0,100 0,50 Q0,0 40,0 Z',
          {} as any
        )
      ),
  },
  {
    id: 'cloud', label: 'Cloud', category: 'symbols', keywords: 'weather',
    preview: svg(el('path', {
      d: 'M6 17 Q2 17 3 13 Q3 10 7 10 Q8 6 12 7 Q16 5 18 9 Q22 10 20 14 Q19 17 15 17 Z',
    })),
    build: () =>
      withStyle(
        new fabric.Path(
          'M40,120 Q0,120 20,80 Q20,40 60,50 Q80,10 120,30 Q160,10 170,60 Q200,80 170,120 Q160,140 120,130 L80,130 Q50,140 40,120 Z',
          {} as any
        ),
        { fill: '#e0f2fe' }
      ),
  },
  {
    id: 'teardrop', label: 'Teardrop', category: 'symbols', keywords: 'drop water',
    preview: svg(el('path', {
      d: 'M12 3 Q19 12 19 16 A7 7 0 1 1 5 16 Q5 12 12 3 Z',
    })),
    build: () =>
      withStyle(
        new fabric.Path(
          'M70 0 Q140 80 140 110 A70 70 0 1 1 0 110 Q0 80 70 0 Z',
          {} as any
        ),
        { fill: '#0ea5e9' }
      ),
  },
  {
    id: 'cog', label: 'Cog', category: 'symbols', keywords: 'gear settings',
    preview: svg([
      el('circle', { cx: 12, cy: 12, r: 3 }),
      el('polygon', {
        points: '12,2 13.5,5 16.5,4 16,7 19,7 18,10 21,12 18,14 19,17 16,17 16.5,20 13.5,19 12,22 10.5,19 7.5,20 8,17 5,17 6,14 3,12 6,10 5,7 8,7 7.5,4 10.5,5',
      }),
    ]),
    build: () => {
      // Simplified gear: 12-point star + inner circle would need evenodd fill.
      // We approximate with a bumpy polygon.
      const teeth = 12;
      const outerR = 70;
      const innerR = 50;
      const pts: { x: number; y: number }[] = [];
      const total = teeth * 4;
      for (let i = 0; i < total; i++) {
        const phase = i % 4;
        const r = phase < 2 ? outerR : innerR;
        const a = (i * 2 * Math.PI) / total - Math.PI / 2;
        pts.push({ x: outerR + Math.cos(a) * r, y: outerR + Math.sin(a) * r });
      }
      return withStyle(new fabric.Polygon(pts, {}), { fill: '#64748b' });
    },
  },

  /* ============ BADGES & BANNERS ============ */
  {
    id: 'ribbon', label: 'Ribbon', category: 'badges', keywords: 'banner',
    preview: svg(el('path', {
      d: 'M3 8 L6 5 L18 5 L21 8 L18 11 L6 11 Z',
    })),
    build: () =>
      withStyle(
        new fabric.Polygon(
          [
            { x: 0, y: 40 }, { x: 30, y: 0 }, { x: 30, y: 20 },
            { x: 170, y: 20 }, { x: 170, y: 0 }, { x: 200, y: 40 },
            { x: 170, y: 80 }, { x: 170, y: 60 }, { x: 30, y: 60 }, { x: 30, y: 80 },
          ],
          {}
        )
      ),
  },
  {
    id: 'banner-arched', label: 'Banner', category: 'badges', keywords: 'arch ribbon banner',
    preview: svg(el('path', {
      d: 'M3 8 Q12 3 21 8 L21 18 Q12 13 3 18 Z',
    })),
    build: () =>
      withStyle(
        new fabric.Path(
          'M 0 40 Q 100 -10 200 40 L 200 100 Q 100 50 0 100 Z',
          {} as any
        )
      ),
  },
  {
    id: 'pennant', label: 'Pennant', category: 'badges', keywords: 'flag triangle',
    preview: svg(el('polygon', { points: '4,4 20,12 4,20' })),
    build: () =>
      withStyle(
        new fabric.Polygon(
          [{ x: 0, y: 0 }, { x: 200, y: 60 }, { x: 0, y: 120 }],
          {}
        )
      ),
  },
  {
    id: 'shield', label: 'Shield', category: 'badges', keywords: 'crest',
    preview: svg(el('path', {
      d: 'M12 3 L20 6 L20 12 Q20 18 12 21 Q4 18 4 12 L4 6 Z',
    })),
    build: () =>
      withStyle(
        new fabric.Path(
          'M 70 0 L 140 20 L 140 80 Q 140 130 70 150 Q 0 130 0 80 L 0 20 Z',
          {} as any
        )
      ),
  },
  {
    id: 'badge-seal', label: 'Seal', category: 'badges', keywords: 'badge award scallop',
    preview: svg(el('polygon', {
      points: '12,2 13.4,4.6 16,3.4 16,6.4 18.6,7 17.4,9.6 20,10 18.4,12 20,14 17.4,14.4 18.6,17 16,17.6 16,20.6 13.4,19.4 12,22 10.6,19.4 8,20.6 8,17.6 5.4,17 6.6,14.4 4,14 5.6,12 4,10 6.6,9.6 5.4,7 8,6.4 8,3.4 10.6,4.6',
    })),
    build: () => {
      // Scalloped disc: 16 gentle bumps
      const teeth = 16;
      const outerR = 70;
      const innerR = 60;
      const pts: { x: number; y: number }[] = [];
      for (let i = 0; i < teeth * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (i * Math.PI) / teeth - Math.PI / 2;
        pts.push({ x: outerR + Math.cos(a) * r, y: outerR + Math.sin(a) * r });
      }
      return withStyle(new fabric.Polygon(pts, {}), { fill: '#f59e0b' });
    },
  },

  /* ============ ORGANIC / ABSTRACT ============ */
  {
    id: 'blob-1', label: 'Blob 1', category: 'organic', keywords: 'organic shape',
    preview: svg(el('path', {
      d: 'M17 3 Q22 7 20 12 Q23 17 17 20 Q11 22 7 18 Q2 15 4 10 Q2 5 8 4 Q13 2 17 3 Z',
    })),
    build: () =>
      withStyle(
        new fabric.Path(
          'M170 30 Q220 70 200 120 Q230 170 170 200 Q110 220 70 180 Q20 150 40 100 Q20 50 80 40 Q130 20 170 30 Z',
          {} as any
        ),
        { fill: '#a78bfa' }
      ),
  },
  {
    id: 'blob-2', label: 'Blob 2', category: 'organic', keywords: 'organic wave',
    preview: svg(el('path', {
      d: 'M13 3 Q20 5 20 11 Q23 15 19 19 Q13 22 8 20 Q3 17 4 12 Q3 6 9 4 Q11 3 13 3 Z',
    })),
    build: () =>
      withStyle(
        new fabric.Path(
          'M130 30 Q200 50 200 110 Q230 150 190 190 Q130 220 80 200 Q30 170 40 120 Q30 60 90 40 Q110 30 130 30 Z',
          {} as any
        ),
        { fill: '#f0abfc' }
      ),
  },
  {
    id: 'wave', label: 'Wave', category: 'organic', keywords: 'water fluid',
    preview: svg(el('path', {
      d: 'M2 10 Q7 4 12 10 T22 10 L22 20 L2 20 Z',
    })),
    build: () =>
      withStyle(
        new fabric.Path(
          'M 0 80 Q 50 0 100 80 T 200 80 L 200 200 L 0 200 Z',
          {} as any
        ),
        { fill: '#38bdf8' }
      ),
  },
  {
    id: 'abstract-blob', label: 'Abstract', category: 'organic', keywords: 'irregular',
    preview: svg(el('path', {
      d: 'M12 2 Q19 4 20 10 Q23 14 20 18 Q16 22 12 20 Q6 21 4 16 Q1 12 4 8 Q6 3 12 2 Z',
    })),
    build: () =>
      withStyle(
        new fabric.Path(
          'M120 20 Q190 40 200 100 Q230 140 200 180 Q160 220 120 200 Q60 210 40 160 Q10 120 40 80 Q60 30 120 20 Z',
          {} as any
        ),
        { fill: '#fb7185' }
      ),
  },
];

export const SHAPE_CATEGORIES: { id: ShapeCategory; label: string }[] = [
  { id: 'basic', label: 'Basic Shapes' },
  { id: 'lines', label: 'Lines & Arrows' },
  { id: 'polygons', label: 'Geometric Polygons' },
  { id: 'flowchart', label: 'Flowchart Shapes' },
  { id: 'symbols', label: 'Symbols & Icons' },
  { id: 'badges', label: 'Badges & Banners' },
  { id: 'organic', label: 'Organic & Abstract' },
];
