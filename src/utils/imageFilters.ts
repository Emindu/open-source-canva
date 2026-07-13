import * as fabric from 'fabric';
import { SplitTone, hexToRgb01 } from './splitToneFilter';

export type FilterKind =
  | 'brightness'
  | 'contrast'
  | 'saturation'
  | 'blur'
  | 'hue'
  | 'noise'
  | 'pixelate'
  | 'grayscale'
  | 'invert'
  | 'sepia'
  | 'blend';

export interface FilterState {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  hue: number;
  noise: number;
  pixelate: number;
  grayscale: boolean;
  invert: boolean;
  sepia: boolean;
  blendColor?: string;
  blendAlpha: number;
  blendMode: 'multiply' | 'add' | 'difference' | 'screen' | 'subtract' | 'darken' | 'lighten' | 'overlay' | 'exclusion' | 'tint';
  // ---- Color grading ----
  temperature: number; // -1 (cool) .. 1 (warm)
  tint: number; // -1 (green) .. 1 (magenta)
  vibrance: number; // -1 .. 1
  exposure: number; // -1 .. 1 (gamma-based)
  shadowsColor?: string;
  shadowsAmount: number; // 0 .. 1
  highlightsColor?: string;
  highlightsAmount: number; // 0 .. 1
}

/** The keys a grade preset resets before applying its own look. */
export const GRADING_KEYS = [
  'temperature',
  'tint',
  'vibrance',
  'exposure',
  'shadowsAmount',
  'highlightsAmount',
] as const;

export const defaultFilterState = (): FilterState => ({
  brightness: 0,
  contrast: 0,
  saturation: 0,
  blur: 0,
  hue: 0,
  noise: 0,
  pixelate: 0,
  grayscale: false,
  invert: false,
  sepia: false,
  blendColor: undefined,
  blendAlpha: 0.5,
  blendMode: 'tint',
  temperature: 0,
  tint: 0,
  vibrance: 0,
  exposure: 0,
  shadowsColor: '#1d4ed8',
  shadowsAmount: 0,
  highlightsColor: '#f59e0b',
  highlightsAmount: 0,
});

const f = fabric.filters;

/**
 * Read the current filter state from a Fabric image. Uses the persisted metadata
 * we tuck onto the image so slider positions round-trip through save/load.
 */
export const readFilterState = (image: any): FilterState => {
  const stored = (image as any)._filterState as FilterState | undefined;
  if (stored) return { ...defaultFilterState(), ...stored };
  return defaultFilterState();
};

/**
 * Build the filter array from state and apply it to the image.
 */
export const applyFilterState = (image: any, state: FilterState) => {
  const filters: any[] = [];
  // ---- Color grading stage (runs first: white balance → exposure → color) ----
  if (state.temperature || state.tint) {
    // Diagonal color matrix: warm boosts R / cuts B, magenta cuts G.
    const rMul = 1 + 0.3 * state.temperature;
    const gMul = 1 - 0.3 * state.tint;
    const bMul = 1 - 0.3 * state.temperature;
    filters.push(
      new f.ColorMatrix({
        matrix: [rMul, 0, 0, 0, 0, 0, gMul, 0, 0, 0, 0, 0, bMul, 0, 0, 0, 0, 0, 1, 0],
      })
    );
  }
  if (state.exposure) {
    // Gamma > 1 lifts the image, < 1 darkens; ±1 exposure maps to 0.25..1.75.
    const g = 1 + state.exposure * 0.75;
    filters.push(new f.Gamma({ gamma: [g, g, g] }));
  }
  if (state.vibrance) filters.push(new f.Vibrance({ vibrance: state.vibrance }));
  if (
    (state.shadowsAmount > 0 && state.shadowsColor) ||
    (state.highlightsAmount > 0 && state.highlightsColor)
  ) {
    filters.push(
      new SplitTone({
        shadows: hexToRgb01(state.shadowsColor ?? '#000000'),
        highlights: hexToRgb01(state.highlightsColor ?? '#ffffff'),
        shadowsAmount: state.shadowsAmount,
        highlightsAmount: state.highlightsAmount,
      })
    );
  }
  // ---- Basic adjustments ----
  if (state.brightness) filters.push(new f.Brightness({ brightness: state.brightness }));
  if (state.contrast) filters.push(new f.Contrast({ contrast: state.contrast }));
  if (state.saturation) filters.push(new f.Saturation({ saturation: state.saturation }));
  if (state.blur) filters.push(new f.Blur({ blur: state.blur }));
  if (state.hue) filters.push(new f.HueRotation({ rotation: state.hue }));
  if (state.noise) filters.push(new f.Noise({ noise: state.noise }));
  if (state.pixelate && state.pixelate > 1) filters.push(new f.Pixelate({ blocksize: state.pixelate }));
  if (state.grayscale) filters.push(new f.Grayscale());
  if (state.invert) filters.push(new f.Invert());
  if (state.sepia) filters.push(new f.Sepia());
  if (state.blendColor && state.blendAlpha > 0) {
    filters.push(
      new f.BlendColor({
        color: state.blendColor,
        mode: state.blendMode,
        alpha: state.blendAlpha,
      })
    );
  }
  image.filters = filters;
  image._filterState = state;
  image.applyFilters();
};

export interface FilterPreset {
  id: string;
  label: string;
  state: Partial<FilterState>;
}

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'none', label: 'Original', state: {} },
  { id: 'vivid', label: 'Vivid', state: { saturation: 0.4, contrast: 0.15, brightness: 0.05 } },
  { id: 'warm', label: 'Warm', state: { blendColor: '#ff9966', blendMode: 'tint', blendAlpha: 0.25, saturation: 0.15 } },
  { id: 'cool', label: 'Cool', state: { blendColor: '#66a3ff', blendMode: 'tint', blendAlpha: 0.25 } },
  { id: 'vintage', label: 'Vintage', state: { saturation: -0.3, contrast: 0.1, blendColor: '#c8a97e', blendMode: 'tint', blendAlpha: 0.3 } },
  { id: 'bw', label: 'B&W', state: { grayscale: true, contrast: 0.15 } },
  { id: 'sepia', label: 'Sepia', state: { sepia: true } },
  { id: 'noir', label: 'Noir', state: { grayscale: true, contrast: 0.35, brightness: -0.05 } },
];

/**
 * Cinematic color-grade looks. Unlike FILTER_PRESETS these merge over the
 * image's current adjustments — they only reset the grading keys — so a
 * user's brightness/contrast tweaks survive switching looks. `from`/`to`
 * drive the swatch preview in the panel.
 */
export interface GradePreset {
  id: string;
  label: string;
  from: string;
  to: string;
  state: Partial<FilterState>;
}

export const GRADE_PRESETS: GradePreset[] = [
  { id: 'grade-none', label: 'None', from: '#6b7280', to: '#d1d5db', state: {} },
  {
    id: 'teal-orange',
    label: 'Teal & Orange',
    from: '#0e7490',
    to: '#f59e0b',
    state: {
      temperature: 0.12,
      vibrance: 0.25,
      shadowsColor: '#0e7490',
      shadowsAmount: 0.5,
      highlightsColor: '#f59e0b',
      highlightsAmount: 0.4,
    },
  },
  {
    id: 'golden-hour',
    label: 'Golden Hour',
    from: '#f59e0b',
    to: '#fde68a',
    state: {
      temperature: 0.45,
      exposure: 0.12,
      vibrance: 0.2,
      highlightsColor: '#fbbf24',
      highlightsAmount: 0.5,
    },
  },
  {
    id: 'moody-blue',
    label: 'Moody Blue',
    from: '#1e3a8a',
    to: '#475569',
    state: {
      temperature: -0.3,
      exposure: -0.15,
      vibrance: -0.15,
      shadowsColor: '#1e3a8a',
      shadowsAmount: 0.45,
    },
  },
  {
    id: 'faded-film',
    label: 'Faded Film',
    from: '#9ca3af',
    to: '#e7e5e4',
    state: {
      exposure: 0.12,
      vibrance: -0.35,
      temperature: 0.08,
      shadowsColor: '#9ca3af',
      shadowsAmount: 0.5,
    },
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    from: '#7c3aed',
    to: '#06b6d4',
    state: {
      tint: 0.3,
      vibrance: 0.35,
      shadowsColor: '#7c3aed',
      shadowsAmount: 0.5,
      highlightsColor: '#06b6d4',
      highlightsAmount: 0.4,
    },
  },
  {
    id: 'forest',
    label: 'Forest',
    from: '#14532d',
    to: '#84cc16',
    state: {
      temperature: -0.08,
      tint: -0.25,
      vibrance: 0.15,
      shadowsColor: '#14532d',
      shadowsAmount: 0.4,
    },
  },
  {
    id: 'arctic',
    label: 'Arctic',
    from: '#0ea5e9',
    to: '#e0f2fe',
    state: {
      temperature: -0.4,
      exposure: 0.1,
      shadowsColor: '#0c4a6e',
      shadowsAmount: 0.35,
      highlightsColor: '#e0f2fe',
      highlightsAmount: 0.45,
    },
  },
];
