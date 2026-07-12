export type ScriptTag = 'latin' | 'sinhala';

export interface FontEntry {
  family: string;
  script: ScriptTag;
  label: string;
  sample?: string;
}

export const FONTS: FontEntry[] = [
  { family: 'Inter', script: 'latin', label: 'Inter' },
  { family: 'Roboto', script: 'latin', label: 'Roboto' },
  { family: 'Open Sans', script: 'latin', label: 'Open Sans' },
  { family: 'Montserrat', script: 'latin', label: 'Montserrat' },
  { family: 'Oswald', script: 'latin', label: 'Oswald' },
  { family: 'Playfair Display', script: 'latin', label: 'Playfair Display' },
  { family: 'Poppins', script: 'latin', label: 'Poppins' },
  { family: 'Georgia', script: 'latin', label: 'Georgia' },
  { family: 'Times New Roman', script: 'latin', label: 'Times New Roman' },
  { family: 'Courier New', script: 'latin', label: 'Courier New' },
  
  // Google Fonts Sinhala
  { family: 'Noto Sans Sinhala', script: 'sinhala', label: 'Noto Sans Sinhala', sample: 'නෝටෝ සිංහල' },
  { family: 'Noto Serif Sinhala', script: 'sinhala', label: 'Noto Serif Sinhala', sample: 'නෝටෝ සෙරිෆ්' },
  { family: 'Abhaya Libre', script: 'sinhala', label: 'Abhaya Libre', sample: 'අභය ලිබ්‍රේ' },
  { family: 'Gemunu Libre', script: 'sinhala', label: 'Gemunu Libre', sample: 'ගැමුණු ලිබ්‍රේ' },
  { family: 'Post No Bills Colombo', script: 'sinhala', label: 'Post No Bills Colombo', sample: 'කොළඹ' },
  { family: 'Stick No Bills', script: 'sinhala', label: 'Stick No Bills', sample: 'ස්ටීක්' },
  { family: 'Anek Sinhala', script: 'sinhala', label: 'Anek Sinhala', sample: 'අනෙක් සිංහල' },
  
  // Standard/System Unicode Sinhala Fonts
  { family: 'Iskoola Pota', script: 'sinhala', label: 'Iskoola Pota', sample: 'ඉස්කෝල පොත' },
  { family: 'Nirmala UI', script: 'sinhala', label: 'Nirmala UI', sample: 'නිර්මලා' },
  { family: 'Bhashita', script: 'sinhala', label: 'Bhashita', sample: 'භාෂිත' },
  { family: 'Dinamina', script: 'sinhala', label: 'Dinamina', sample: 'දිනමිණ' },
  { family: 'Amalee', script: 'sinhala', label: 'Amalee', sample: 'අමලී' },
];

const SINHALA_PROBE = 'ආයුබෝවන්';

/**
 * Waits for a font family to be available in the browser's FontFaceSet.
 * For Sinhala (complex script), we probe with a real grapheme cluster so the
 * browser knows exactly which glyphs to load.
 */
export const ensureFontLoaded = async (family: string, size = 24): Promise<void> => {
  if (typeof document === 'undefined' || !document.fonts) return;
  const entry = FONTS.find((f) => f.family === family);
  const probe = entry?.script === 'sinhala' ? SINHALA_PROBE : 'Ag';
  const spec = `${size}px "${family}"`;
  try {
    await document.fonts.load(spec, probe);
    // Also warm bold variant so Bold toggle renders correctly on first click.
    await document.fonts.load(`bold ${spec}`, probe);
  } catch (e) {
    console.warn('Font load failed:', family, e);
  }
};

/**
 * Warm all Sinhala fonts on app boot so first render uses the real font,
 * not the fallback. Fires and forgets — we don't block app startup.
 */
export const preloadFonts = () => {
  if (typeof document === 'undefined' || !document.fonts) return;
  FONTS.filter((f) => f.script === 'sinhala').forEach((f) => {
    ensureFontLoaded(f.family);
  });
  // Also preload Inter so the UI doesn't flash system font.
  ensureFontLoaded('Inter');
};
