import { get, set } from 'idb-keyval';

const KEY = 'canvawasm.brandKit.v1';

export interface BrandLogo {
  id: string;
  name: string;
  dataUrl: string; // small enough to keep inline; for larger, blob later
}

export interface BrandKit {
  colors: string[];
  fonts: string[];
  logos: BrandLogo[];
}

const emptyKit = (): BrandKit => ({ colors: [], fonts: [], logos: [] });

export const loadBrandKit = async (): Promise<BrandKit> => {
  try {
    const stored = (await get<BrandKit>(KEY)) as BrandKit | undefined;
    if (!stored) return emptyKit();
    return {
      colors: Array.isArray(stored.colors) ? stored.colors : [],
      fonts: Array.isArray(stored.fonts) ? stored.fonts : [],
      logos: Array.isArray(stored.logos) ? stored.logos : [],
    };
  } catch {
    return emptyKit();
  }
};

export const saveBrandKit = async (kit: BrandKit): Promise<void> => {
  try {
    await set(KEY, kit);
  } catch (e) {
    console.warn('Brand kit save failed', e);
  }
};

export const newLogoId = (): string =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `logo_${Date.now()}_${Math.random().toString(36).slice(2)}`;
