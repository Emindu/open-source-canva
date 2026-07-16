import * as fabric from 'fabric';
import { jsPDF } from 'jspdf';
import { EXTRA_PROPS } from './projectSerialization';

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

/**
 * Export the design as a single-page PDF whose page matches the design's
 * physical size (canvas px interpreted at 96 dpi). The canvas is rasterized
 * at `scale`× the logical design size — independent of the current viewport
 * zoom — and embedded full-bleed.
 */
export const exportPdf = (canvas: fabric.Canvas, scale = 2, name = 'design') => {
  const zoom = canvas.getZoom() || 1;
  const w = canvas.getWidth() / zoom;
  const h = canvas.getHeight() / zoom;
  // JPEG keeps the file ~10x smaller; fall back to PNG only when the canvas
  // has no solid background (JPEG would render transparency as black).
  const opaque = typeof canvas.backgroundColor === 'string' && canvas.backgroundColor !== '';
  const dataUrl = opaque
    ? canvas.toDataURL({ format: 'jpeg', quality: 0.92, multiplier: scale / zoom })
    : canvas.toDataURL({ format: 'png', multiplier: scale / zoom });

  const PX_TO_MM = 25.4 / 96;
  const wMm = w * PX_TO_MM;
  const hMm = h * PX_TO_MM;
  const doc = new jsPDF({
    orientation: w >= h ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [wMm, hMm],
  });
  doc.addImage(dataUrl, opaque ? 'JPEG' : 'PNG', 0, 0, wMm, hMm);
  doc.save(`${name}.pdf`);
};

export const exportJson = (canvas: fabric.Canvas, name = 'design') => {
  const json = JSON.stringify(canvas.toObject(EXTRA_PROPS), null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  download(url, `${name}.json`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
