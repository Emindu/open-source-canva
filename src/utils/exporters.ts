import * as fabric from 'fabric';
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

export const exportJson = (canvas: fabric.Canvas, name = 'design') => {
  const json = JSON.stringify(canvas.toObject(EXTRA_PROPS), null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  download(url, `${name}.json`);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
