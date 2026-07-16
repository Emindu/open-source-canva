import * as fabric from 'fabric';
import { jsPDF } from 'jspdf';
import { documentCurrent, documentPages } from './document';

const download = (url: string, filename: string) => {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

export const exportPng = (canvas: fabric.Canvas, scale = 2, name = 'design') => {
  const url = canvas.toDataURL({ format: 'png', multiplier: scale });
  download(url, `${name}.png`);
};

export const exportJpg = (canvas: fabric.Canvas, scale = 2, name = 'design') => {
  const url = canvas.toDataURL({ format: 'jpeg', quality: 0.92, multiplier: scale });
  download(url, `${name}.jpg`);
};

const PX_TO_MM = 25.4 / 96;

/**
 * Overlay each text object as an invisible PDF text run at its canvas
 * position. The visible page stays the pixel-perfect raster; the invisible
 * layer makes the PDF selectable, searchable, and parseable by ATS systems.
 */
const addInvisibleTextLayer = (doc: jsPDF, objects: fabric.Object[]) => {
  const walk = (objs: any[]) => {
    for (const o of objs) {
      if (!o || o.visible === false) continue;
      if (typeof o.getObjects === 'function') {
        walk(o.getObjects());
        continue;
      }
      if (typeof o.text !== 'string' || !Array.isArray(o._textLines)) continue;
      // Absolute placement including any parent group transforms.
      const dec = fabric.util.qrDecompose(o.calcTransformMatrix());
      const left = dec.translateX - (o.width * dec.scaleX) / 2;
      let y = dec.translateY - (o.height * dec.scaleY) / 2;
      doc.setFontSize(Math.max(4, (o.fontSize || 16) * dec.scaleY * 0.75)); // px → pt
      for (let li = 0; li < o._textLines.length; li++) {
        const lineH = (o.getHeightOfLine?.(li) ?? (o.fontSize || 16) * (o.lineHeight || 1.16)) * dec.scaleY;
        const raw = o._textLines[li];
        const lineText = Array.isArray(raw) ? raw.join('') : String(raw);
        if (lineText.trim()) {
          doc.text(lineText, left * PX_TO_MM, (y + lineH * 0.85) * PX_TO_MM, {
            renderingMode: 'invisible',
          });
        }
        y += lineH;
      }
    }
  };
  walk(objects as any[]);
};

const rasterizePage = (
  source: fabric.Canvas | fabric.StaticCanvas,
  multiplier: number
): { dataUrl: string; kind: 'JPEG' | 'PNG' } => {
  // JPEG keeps files ~10x smaller; PNG only when the page has no solid
  // background (JPEG would render transparency as black).
  const opaque = typeof source.backgroundColor === 'string' && source.backgroundColor !== '';
  return opaque
    ? { dataUrl: source.toDataURL({ format: 'jpeg', quality: 0.92, multiplier }), kind: 'JPEG' }
    : { dataUrl: source.toDataURL({ format: 'png', multiplier }), kind: 'PNG' };
};

/**
 * Export the whole document (all pages) as a PDF. Pages match the design's
 * physical size (canvas px at 96 dpi); rendering is zoom-independent. The
 * live canvas renders the current page; other pages render offscreen.
 */
export const exportPdf = async (
  docData: unknown,
  liveCanvas: fabric.Canvas,
  scale = 2,
  name = 'design'
) => {
  const zoom = liveCanvas.getZoom() || 1;
  const w = liveCanvas.getWidth() / zoom;
  const h = liveCanvas.getHeight() / zoom;
  const wMm = w * PX_TO_MM;
  const hMm = h * PX_TO_MM;
  const orientation = w >= h ? 'landscape' : 'portrait';

  const pages = documentPages(docData);
  const current = documentCurrent(docData);

  const doc = new jsPDF({ orientation, unit: 'mm', format: [wMm, hMm] });

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) doc.addPage([wMm, hMm], orientation);

    if (i === current) {
      const { dataUrl, kind } = rasterizePage(liveCanvas, scale / zoom);
      doc.addImage(dataUrl, kind, 0, 0, wMm, hMm);
      addInvisibleTextLayer(doc, liveCanvas.getObjects());
    } else {
      const off = new fabric.StaticCanvas(undefined, { width: w, height: h });
      try {
        const pageData = pages[i];
        if (pageData) {
          await off.loadFromJSON(pageData);
          off.setDimensions({ width: w, height: h });
        }
        if (!off.backgroundColor) off.backgroundColor = '#ffffff';
        off.renderAll();
        const { dataUrl, kind } = rasterizePage(off, scale);
        doc.addImage(dataUrl, kind, 0, 0, wMm, hMm);
        addInvisibleTextLayer(doc, off.getObjects());
      } finally {
        off.dispose();
      }
    }
  }

  doc.save(`${name}.pdf`);
};

export const exportJson = (docData: unknown, name = 'design') => {
  const json = JSON.stringify(docData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  download(url, `${name}.json`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
