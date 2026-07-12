import * as fabric from 'fabric';

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
}

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
