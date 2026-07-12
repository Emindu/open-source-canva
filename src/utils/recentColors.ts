const KEY = 'canvawasm.recentColors.v1';
const MAX = 12;

export const loadRecentColors = (): string[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
  } catch {
    return [];
  }
};

export const saveRecentColors = (colors: string[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(colors.slice(0, MAX)));
  } catch {
    // swallow — quota exceeded or private mode
  }
};

export const pushRecent = (current: string[], color: string): string[] => {
  if (!color || typeof color !== 'string') return current;
  const norm = color.toLowerCase();
  const filtered = current.filter((c) => c.toLowerCase() !== norm);
  return [color, ...filtered].slice(0, MAX);
};

/**
 * Runtime feature check for the browser EyeDropper API (Chromium-based only).
 */
export const eyedropperSupported = (): boolean =>
  typeof window !== 'undefined' && 'EyeDropper' in window;

export const pickWithEyedropper = async (): Promise<string | null> => {
  if (!eyedropperSupported()) return null;
  try {
    const dropper = new (window as any).EyeDropper();
    const result = await dropper.open();
    return result?.sRGBHex ?? null;
  } catch {
    // User aborted the picker
    return null;
  }
};
