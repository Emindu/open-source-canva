export type ScriptTag = 'latin' | 'sinhala';
export type FontCategory = 'sans' | 'serif' | 'display' | 'script' | 'mono' | 'sinhala';

export interface FontEntry {
  family: string;
  script: ScriptTag;
  category: FontCategory;
  label: string;
  sample?: string;
}

export const FONT_CATEGORIES: { id: FontCategory; label: string }[] = [
  { id: 'sans', label: 'Sans Serif' },
  { id: 'serif', label: 'Serif' },
  { id: 'display', label: 'Display' },
  { id: 'script', label: 'Script & Handwriting' },
  { id: 'mono', label: 'Monospace' },
  { id: 'sinhala', label: 'සිංහල · Sinhala' },
];

export const FONTS: FontEntry[] = [
  // --- Sans serif ---
  { family: 'Inter', script: 'latin', category: 'sans', label: 'Inter' },
  { family: 'Roboto', script: 'latin', category: 'sans', label: 'Roboto' },
  { family: 'Open Sans', script: 'latin', category: 'sans', label: 'Open Sans' },
  { family: 'Montserrat', script: 'latin', category: 'sans', label: 'Montserrat' },
  { family: 'Poppins', script: 'latin', category: 'sans', label: 'Poppins' },
  { family: 'Lato', script: 'latin', category: 'sans', label: 'Lato' },
  { family: 'Nunito', script: 'latin', category: 'sans', label: 'Nunito' },
  { family: 'Raleway', script: 'latin', category: 'sans', label: 'Raleway' },
  { family: 'Work Sans', script: 'latin', category: 'sans', label: 'Work Sans' },
  { family: 'Rubik', script: 'latin', category: 'sans', label: 'Rubik' },
  { family: 'Barlow', script: 'latin', category: 'sans', label: 'Barlow' },

  // --- Serif ---
  { family: 'Playfair Display', script: 'latin', category: 'serif', label: 'Playfair Display' },
  { family: 'Merriweather', script: 'latin', category: 'serif', label: 'Merriweather' },
  { family: 'Lora', script: 'latin', category: 'serif', label: 'Lora' },
  { family: 'EB Garamond', script: 'latin', category: 'serif', label: 'EB Garamond' },
  { family: 'Cormorant Garamond', script: 'latin', category: 'serif', label: 'Cormorant Garamond' },
  { family: 'DM Serif Display', script: 'latin', category: 'serif', label: 'DM Serif Display' },
  { family: 'Georgia', script: 'latin', category: 'serif', label: 'Georgia' },
  { family: 'Times New Roman', script: 'latin', category: 'serif', label: 'Times New Roman' },

  // --- Display ---
  { family: 'Oswald', script: 'latin', category: 'display', label: 'Oswald' },
  { family: 'Bebas Neue', script: 'latin', category: 'display', label: 'Bebas Neue' },
  { family: 'Anton', script: 'latin', category: 'display', label: 'Anton' },
  { family: 'Archivo Black', script: 'latin', category: 'display', label: 'Archivo Black' },
  { family: 'Alfa Slab One', script: 'latin', category: 'display', label: 'Alfa Slab One' },
  { family: 'Abril Fatface', script: 'latin', category: 'display', label: 'Abril Fatface' },
  { family: 'Righteous', script: 'latin', category: 'display', label: 'Righteous' },
  { family: 'Bangers', script: 'latin', category: 'display', label: 'Bangers' },
  { family: 'Luckiest Guy', script: 'latin', category: 'display', label: 'Luckiest Guy' },
  { family: 'Lobster', script: 'latin', category: 'display', label: 'Lobster' },
  { family: 'Fredoka', script: 'latin', category: 'display', label: 'Fredoka' },

  // --- Script & handwriting ---
  { family: 'Pacifico', script: 'latin', category: 'script', label: 'Pacifico' },
  { family: 'Dancing Script', script: 'latin', category: 'script', label: 'Dancing Script' },
  { family: 'Great Vibes', script: 'latin', category: 'script', label: 'Great Vibes' },
  { family: 'Caveat', script: 'latin', category: 'script', label: 'Caveat' },
  { family: 'Satisfy', script: 'latin', category: 'script', label: 'Satisfy' },
  { family: 'Sacramento', script: 'latin', category: 'script', label: 'Sacramento' },
  { family: 'Shadows Into Light', script: 'latin', category: 'script', label: 'Shadows Into Light' },
  { family: 'Permanent Marker', script: 'latin', category: 'script', label: 'Permanent Marker' },
  { family: 'Amatic SC', script: 'latin', category: 'script', label: 'Amatic SC' },
  { family: 'Kalam', script: 'latin', category: 'script', label: 'Kalam' },
  { family: 'Courgette', script: 'latin', category: 'script', label: 'Courgette' },

  // --- Monospace ---
  { family: 'JetBrains Mono', script: 'latin', category: 'mono', label: 'JetBrains Mono' },
  { family: 'IBM Plex Mono', script: 'latin', category: 'mono', label: 'IBM Plex Mono' },
  { family: 'Space Mono', script: 'latin', category: 'mono', label: 'Space Mono' },
  { family: 'Courier New', script: 'latin', category: 'mono', label: 'Courier New' },

  // --- Google Fonts Sinhala ---
  { family: 'Noto Sans Sinhala', script: 'sinhala', category: 'sinhala', label: 'Noto Sans Sinhala', sample: 'නෝටෝ සිංහල' },
  { family: 'Noto Serif Sinhala', script: 'sinhala', category: 'sinhala', label: 'Noto Serif Sinhala', sample: 'නෝටෝ සෙරිෆ්' },
  { family: 'Abhaya Libre', script: 'sinhala', category: 'sinhala', label: 'Abhaya Libre', sample: 'අභය ලිබ්‍රේ' },
  { family: 'Gemunu Libre', script: 'sinhala', category: 'sinhala', label: 'Gemunu Libre', sample: 'ගැමුණු ලිබ්‍රේ' },
  { family: 'Post No Bills Colombo', script: 'sinhala', category: 'sinhala', label: 'Post No Bills Colombo', sample: 'කොළඹ' },
  { family: 'Stick No Bills', script: 'sinhala', category: 'sinhala', label: 'Stick No Bills', sample: 'ස්ටීක්' },
  { family: 'Anek Sinhala', script: 'sinhala', category: 'sinhala', label: 'Anek Sinhala', sample: 'අනෙක් සිංහල' },

  // --- Standard/System Unicode Sinhala Fonts ---
  { family: 'Iskoola Pota', script: 'sinhala', category: 'sinhala', label: 'Iskoola Pota', sample: 'ඉස්කෝල පොත' },
  { family: 'Nirmala UI', script: 'sinhala', category: 'sinhala', label: 'Nirmala UI', sample: 'නිර්මලා' },
  { family: 'Bhashita', script: 'sinhala', category: 'sinhala', label: 'Bhashita', sample: 'භාෂිත' },
  { family: 'Dinamina', script: 'sinhala', category: 'sinhala', label: 'Dinamina', sample: 'දිනමිණ' },
  { family: 'Amalee', script: 'sinhala', category: 'sinhala', label: 'Amalee', sample: 'අමලී' },
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
    // Also warm bold + italic variants so those toggles render correctly on
    // first click (fonts without the variant resolve with a synthetic face).
    await document.fonts.load(`bold ${spec}`, probe);
    await document.fonts.load(`italic ${spec}`, probe);
  } catch (e) {
    console.warn('Font load failed:', family, e);
  }
};

/**
 * Warm all Sinhala fonts on app boot so first render uses the real font,
 * not the fallback. Fires and forgets — we don't block app startup.
 * Latin fonts load lazily: when picked, or when previewed in the font picker.
 */
export const preloadFonts = () => {
  if (typeof document === 'undefined' || !document.fonts) return;
  FONTS.filter((f) => f.script === 'sinhala').forEach((f) => {
    ensureFontLoaded(f.family);
  });
  // Also preload Inter so the UI doesn't flash system font.
  ensureFontLoaded('Inter');
};
