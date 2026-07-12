import * as fabric from 'fabric';

export type FillMode = 'solid' | 'linear' | 'radial' | 'pattern';

export interface GradientPreset {
  name: string;
  from: string;
  to: string;
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  { name: 'Sunset', from: '#ff6b6b', to: '#feca57' },
  { name: 'Ocean', from: '#667eea', to: '#764ba2' },
  { name: 'Neon', from: '#f093fb', to: '#f5576c' },
  { name: 'Purple', from: '#7c5cff', to: '#4f46e5' },
  { name: 'Green', from: '#06b6d4', to: '#10b981' },
  { name: 'Gold', from: '#ffd700', to: '#ffa500' },
  { name: 'Fire', from: '#ee0979', to: '#ff6a00' },
  { name: 'Sky', from: '#56ccf2', to: '#2f80ed' },
];

/**
 * Detect what kind of fill an object currently has.
 */
export const getFillMode = (fill: any): FillMode => {
  if (!fill || typeof fill === 'string') return 'solid';
  if (fill.type === 'linear') return 'linear';
  if (fill.type === 'radial') return 'radial';
  if (fill.source || fill.repeat) return 'pattern';
  return 'solid';
};

/**
 * Read the two representative colors from a fill (for the color pickers).
 * Falls back to sensible defaults.
 */
export const readFillColors = (fill: any): { from: string; to: string } => {
  if (!fill || typeof fill === 'string') {
    const s = typeof fill === 'string' ? fill : '#7c5cff';
    return { from: s, to: s };
  }
  const stops = fill.colorStops || [];
  return {
    from: stops[0]?.color || '#7c5cff',
    to: stops[stops.length - 1]?.color || '#4f46e5',
  };
};

/**
 * Convert an angle in degrees to normalized (0-1) coords describing
 * a line across a unit box. 0° = left→right, 90° = top→bottom, etc.
 */
const angleToCoords = (deg: number) => {
  const rad = (deg * Math.PI) / 180;
  const dx = Math.cos(rad) * 0.5;
  const dy = Math.sin(rad) * 0.5;
  return {
    x1: 0.5 - dx,
    y1: 0.5 - dy,
    x2: 0.5 + dx,
    y2: 0.5 + dy,
  };
};

export const createLinearGradient = (from: string, to: string, angleDeg = 0): fabric.Gradient<'linear'> =>
  new fabric.Gradient({
    type: 'linear',
    gradientUnits: 'percentage',
    coords: angleToCoords(angleDeg),
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  });

export const createRadialGradient = (from: string, to: string): fabric.Gradient<'radial'> =>
  new fabric.Gradient({
    type: 'radial',
    gradientUnits: 'percentage',
    coords: { x1: 0.5, y1: 0.5, r1: 0, x2: 0.5, y2: 0.5, r2: 0.5 },
    colorStops: [
      { offset: 0, color: from },
      { offset: 1, color: to },
    ],
  });

/* -------------------- Patterns -------------------- */

export interface PatternDef {
  name: string;
  svg: (color: string) => string;
}

export const PATTERNS: PatternDef[] = [
  {
    name: 'Dots',
    svg: (c) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='2.5' fill='${c}'/></svg>`,
  },
  {
    name: 'Grid',
    svg: (c) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M24 0H0v24' fill='none' stroke='${c}' stroke-width='1'/></svg>`,
  },
  {
    name: 'Diagonal',
    svg: (c) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><path d='M-2 6L6 -2M0 16L16 0M10 18L18 10' stroke='${c}' stroke-width='2'/></svg>`,
  },
  {
    name: 'Stripes',
    svg: (c) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect x='0' y='0' width='8' height='16' fill='${c}'/></svg>`,
  },
  {
    name: 'Chevron',
    svg: (c) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><path d='M0 8L12 0L24 8M0 20L12 12L24 20' fill='none' stroke='${c}' stroke-width='2'/></svg>`,
  },
  {
    name: 'Waves',
    svg: (c) =>
      `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='16'><path d='M0 8 Q10 0 20 8 T40 8' fill='none' stroke='${c}' stroke-width='2'/></svg>`,
  },
];

const dataUrlFromSvg = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

/**
 * Loads an SVG pattern into a Pattern instance suitable for fabric fill.
 * Returns a Promise resolving to the Pattern (or null on failure).
 */
export const createSvgPattern = (svg: string): Promise<fabric.Pattern | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve(new fabric.Pattern({ source: img, repeat: 'repeat' }));
    };
    img.onerror = () => resolve(null);
    img.src = dataUrlFromSvg(svg);
  });

/* -------------------- Blend modes -------------------- */

export const BLEND_MODES: { value: GlobalCompositeOperation; label: string }[] = [
  { value: 'source-over', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'color-dodge', label: 'Color dodge' },
  { value: 'color-burn', label: 'Color burn' },
  { value: 'hard-light', label: 'Hard light' },
  { value: 'soft-light', label: 'Soft light' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
];
