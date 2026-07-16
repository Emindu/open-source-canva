/**
 * Accent color themes for the Aurora chrome. The chrome-side colors live in
 * CSS custom properties (see index.css, keyed off data-accent on <html>);
 * this module carries the one hex value that must exist outside CSS — the
 * color given to Fabric objects (selection handles, default shape fills),
 * which can't read CSS variables.
 */
export type AccentName = 'indigo' | 'violet' | 'emerald' | 'rose' | 'cyan';

export const ACCENTS: Record<AccentName, { label: string; hex: string }> = {
  indigo: { label: 'Indigo', hex: '#4f46e5' },
  violet: { label: 'Violet', hex: '#7c3aed' },
  emerald: { label: 'Emerald', hex: '#059669' },
  rose: { label: 'Rose', hex: '#e11d48' },
  cyan: { label: 'Cyan', hex: '#0891b2' },
};

const STORAGE_KEY = 'canvawasm.accent';

export const loadAccentName = (): AccentName => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in ACCENTS) return stored as AccentName;
  } catch {
    /* storage unavailable */
  }
  return 'indigo';
};

export const saveAccentName = (name: AccentName) => {
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch {
    /* storage unavailable */
  }
};

let activeAccent: AccentName = loadAccentName();

export const setActiveAccent = (name: AccentName) => {
  activeAccent = name;
};

/** Hex of the currently selected accent — for Fabric handles and default fills. */
export const getAccentHex = () => ACCENTS[activeAccent].hex;
