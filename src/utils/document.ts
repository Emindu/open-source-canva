/**
 * Multi-page document format. A saved document is either:
 *  - legacy: a bare Fabric canvas JSON object (single page), or
 *  - v2: { __doc: 'canvawasm/v2', pages: [...canvas JSON or null...], current }
 * `null` entries are blank pages (white background, no objects).
 */
export interface DocumentData {
  __doc: 'canvawasm/v2';
  pages: (Record<string, unknown> | null)[];
  current: number;
}

export const isMultiPageDoc = (d: unknown): d is DocumentData =>
  !!d &&
  typeof d === 'object' &&
  (d as DocumentData).__doc === 'canvawasm/v2' &&
  Array.isArray((d as DocumentData).pages);

export const documentPages = (d: unknown): (Record<string, unknown> | null)[] =>
  isMultiPageDoc(d) ? d.pages : [d as Record<string, unknown>];

export const documentCurrent = (d: unknown): number => {
  if (!isMultiPageDoc(d)) return 0;
  const n = d.pages.length;
  return Math.max(0, Math.min(d.current ?? 0, n - 1));
};
