import { create } from 'zustand';
import * as fabric from 'fabric';
import { ensureFontLoaded } from '../utils/fonts';
import {
  applyFilterState,
  defaultFilterState,
  readFilterState,
  FILTER_PRESETS,
} from '../utils/imageFilters';
import type { FilterState } from '../utils/imageFilters';
import { loadRecentColors, pushRecent, saveRecentColors } from '../utils/recentColors';
import { loadBrandKit, newLogoId, saveBrandKit } from '../utils/brandKit';
import type { BrandKit, BrandLogo } from '../utils/brandKit';
import { EXTRA_PROPS } from '../utils/projectSerialization';
import { SHAPE_LIB } from '../utils/shapeLibrary';

const CORNER_COLOR = '#7c5cff';
const CORNER_STROKE = '#ffffff';
const MAX_HISTORY = 50;

export type AlignDir = 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom';
export type DistributeAxis = 'h' | 'v';
export type CurveKind = 'none' | 'arc-up' | 'arc-down' | 'wave' | 'circle';
export type TextEffect = 'none' | 'neon' | 'echo' | 'splice' | '3d' | 'outline' | 'hollow' | 'shadow';

interface EditorState {
  canvas: fabric.Canvas | null;
  activeObject: fabric.Object | null;
  objectsRev: number;
  canUndo: boolean;
  canRedo: boolean;
  bgColor: string;
  canvasSize: { width: number; height: number };
  fileHandle: FileSystemFileHandle | null;
  projectName: string;
  projectId: string;

  setCanvas: (canvas: fabric.Canvas) => void;
  setActiveObject: (obj: fabric.Object | null) => void;
  bumpObjectsRev: () => void;
  setFileHandle: (handle: FileSystemFileHandle | null) => void;
  setProjectName: (name: string) => void;
  setProjectId: (id: string) => void;
  autosave: () => void;

  addRect: () => void;
  addRoundedRect: () => void;
  addCircle: () => void;
  addEllipse: () => void;
  addTriangle: () => void;
  addDiamond: () => void;
  addPentagon: () => void;
  addHexagon: () => void;
  addStar: (points?: 5 | 6) => void;
  addHeart: () => void;
  addPlus: () => void;
  addSpeechBubble: () => void;
  addEmoji: (emoji: string) => void;
  addBlob: (type: number) => void;
  addArrow: () => void;
  addLine: () => void;
  addText: (variant?: 'heading' | 'subheading' | 'body' | 'sinhala-heading' | 'sinhala-body') => Promise<void>;
  addImage: (url: string) => void;
  addIconSvg: (svg: string) => Promise<void>;
  loadTemplate: (id: string) => Promise<void>;
  addTable: () => void;
  addTableRow: () => void;
  addTableColumn: () => void;
  removeTableRow: () => void;
  removeTableColumn: () => void;
  tableEditingGroup: fabric.Object | null;
  enterTableEditMode: (group: fabric.Object, cell?: fabric.Object | null) => void;
  exitTableEditMode: () => void;
  addStickyNote: () => void;
  addShape: (id: string) => void;

  // Drawing mode
  drawingMode: boolean;
  drawingColor: string;
  drawingWidth: number;
  drawingOpacity: number; // 0..1
  brushType: 'pen' | 'marker' | 'highlighter' | 'eraser';
  setDrawingMode: (on: boolean) => void;
  setDrawingColor: (color: string) => void;
  setDrawingWidth: (width: number) => void;
  setDrawingOpacity: (opacity: number) => void;
  setBrushType: (type: 'pen' | 'marker' | 'highlighter' | 'eraser') => void;

  deleteSelected: () => void;
  duplicateSelected: () => Promise<void>;
  copySelected: () => Promise<void>;
  paste: () => Promise<void>;

  updateSelectedProperty: (key: string, value: any) => Promise<void> | void;
  applyCurve: (kind: CurveKind) => void;
  applyTextEffect: (preset: TextEffect) => void;
  toggleSuperscript: () => void;
  toggleSubscript: () => void;

  // Image editing
  cropModeActive: boolean;
  bgRemovalBusy: boolean;
  resetCrop: () => void;

  // Recent colors
  recentColors: string[];
  pushRecentColor: (color: string) => void;

  // Brand kit
  brandKit: BrandKit;
  reloadBrandKit: () => Promise<void>;
  addBrandColor: (color: string) => Promise<void>;
  removeBrandColor: (color: string) => Promise<void>;
  addBrandFont: (family: string) => Promise<void>;
  removeBrandFont: (family: string) => Promise<void>;
  addBrandLogo: (name: string, dataUrl: string) => Promise<void>;
  removeBrandLogo: (id: string) => Promise<void>;
  applyBrandLogo: (logo: BrandLogo) => Promise<void>;

  // Comments
  setObjectComment: (obj: fabric.Object, text: string) => void;

  // Context menu
  contextMenu: { x: number; y: number } | null;
  showContextMenu: (x: number, y: number) => void;
  hideContextMenu: () => void;
  setImageFilter: (kind: keyof FilterState, value: any) => void;
  applyImagePreset: (id: string) => void;
  resetImageFilters: () => void;
  startCropMode: () => void;
  applyCrop: () => void;
  cancelCrop: () => void;
  removeBackground: () => Promise<void>;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;

  align: (dir: AlignDir) => void;
  flip: (axis: 'h' | 'v') => void;
  nudge: (dx: number, dy: number) => void;
  selectAll: () => void;
  discardSelection: () => void;
  group: () => void;
  ungroup: () => void;
  distribute: (axis: DistributeAxis) => void;

  setBgColor: (color: string) => void;
  resizeCanvas: (w: number, h: number) => void;

  // View toggles
  showGrid: boolean;
  showRulers: boolean;
  snapEnabled: boolean;
  theme: 'dark' | 'light';
  toggleGrid: () => void;
  toggleRulers: () => void;
  toggleSnap: () => void;
  toggleTheme: () => void;

  saveHistory: () => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  initHistory: () => void;
  clearHistory: () => void;
}

const applyCornerStyle = (obj: fabric.Object) => {
  obj.set({
    cornerColor: CORNER_COLOR,
    cornerStrokeColor: CORNER_STROKE,
    cornerStyle: 'circle',
    transparentCorners: false,
    borderColor: CORNER_COLOR,
    borderScaleFactor: 1.5,
    padding: 4,
  });
};

/**
 * Cell child locks — used for both the border Rect and the inner Textbox of
 * every table cell. Keeps cells anchored to their grid position even when the
 * user enters cell-edit mode (which sets group.interactive = true).
 */
const CELL_LOCKS = {
  lockMovementX: true,
  lockMovementY: true,
  lockScalingX: true,
  lockScalingY: true,
  lockRotation: true,
  hasControls: false,
  hasBorders: false,
};

const hexToRgba = (hex: string, alpha: number): string => {
  const h = /^#?([0-9a-fA-F]{6})$/.exec(hex);
  if (!h) return hex;
  const r = parseInt(h[1].slice(0, 2), 16);
  const g = parseInt(h[1].slice(2, 4), 16);
  const b = parseInt(h[1].slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
};

/**
 * Configure the canvas's free-drawing brush for the current tool.
 * - Pen: crisp opaque strokes
 * - Marker: thicker, slight transparency
 * - Highlighter: very wide, translucent, multiply-like feel via low alpha
 * - Eraser: thick opaque strokes; the actual erase happens via a
 *   destination-out composite applied to the created path in setDrawingMode
 */
const applyBrushToCanvas = (
  canvas: fabric.Canvas,
  state: {
    brushType: 'pen' | 'marker' | 'highlighter' | 'eraser';
    drawingColor: string;
    drawingWidth: number;
    drawingOpacity: number;
  }
) => {
  const brush = new fabric.PencilBrush(canvas);
  const { brushType, drawingColor, drawingWidth, drawingOpacity } = state;

  switch (brushType) {
    case 'pen':
      brush.width = drawingWidth;
      brush.color = hexToRgba(drawingColor, drawingOpacity);
      break;
    case 'marker':
      brush.width = drawingWidth * 1.6;
      brush.color = hexToRgba(drawingColor, Math.min(0.9, drawingOpacity));
      break;
    case 'highlighter':
      brush.width = drawingWidth * 3;
      // Cap alpha at 0.35 so overlapping strokes still layer visibly.
      brush.color = hexToRgba(drawingColor, Math.min(0.35, drawingOpacity * 0.4 + 0.05));
      break;
    case 'eraser':
      brush.width = drawingWidth * 2;
      // Any color works — destination-out ignores the color, using only alpha.
      brush.color = 'rgba(0,0,0,1)';
      break;
  }
  canvas.freeDrawingBrush = brush;
};

const addRegularPolygon = (canvas: fabric.Canvas | null, sides: number, color: string) => {
  if (!canvas) return;
  const r = 70;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    pts.push({ x: r + Math.cos(angle) * r, y: r + Math.sin(angle) * r });
  }
  const p = new fabric.Polygon(pts, { left: 200, top: 150, fill: color });
  applyCornerStyle(p);
  canvas.add(p);
  canvas.setActiveObject(p);
  canvas.requestRenderAll();
};

/* -------------------- History & clipboard (module scope) -------------------- */
let historyStack: string[] = [];
let historyIndex = -1;
let isRestoring = false;
let clipboard: fabric.Object | null = null;

const pushHistory = (canvas: fabric.Canvas, setState: (partial: Partial<EditorState>) => void) => {
  if (isRestoring) return;
  const snapshot = JSON.stringify(canvas.toObject(EXTRA_PROPS));
  historyStack = historyStack.slice(0, historyIndex + 1);
  historyStack.push(snapshot);
  if (historyStack.length > MAX_HISTORY) {
    historyStack.shift();
  } else {
    historyIndex++;
  }
  setState({ canUndo: historyIndex > 0, canRedo: false });
};

export const useEditorStore = create<EditorState>((set, get) => ({
  canvas: null,
  activeObject: null,
  objectsRev: 0,
  canUndo: false,
  canRedo: false,
  bgColor: '#ffffff',
  canvasSize: { width: 900, height: 600 },
  fileHandle: null,
  projectName: 'Untitled design',
  projectId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),

  showGrid: false,
  showRulers: false,
  snapEnabled: true,
  theme: 'dark' as 'dark' | 'light',
  cropModeActive: false,
  bgRemovalBusy: false,
  drawingMode: false,
  drawingColor: '#111827',
  drawingWidth: 4,
  drawingOpacity: 1,
  brushType: 'pen' as 'pen' | 'marker' | 'highlighter' | 'eraser',
  tableEditingGroup: null,
  recentColors: loadRecentColors(),
  brandKit: { colors: [], fonts: [], logos: [] },
  contextMenu: null,
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleRulers: () => set((s) => ({ showRulers: !s.showRulers })),
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

  setCanvas: (canvas) => set({ canvas }),
  setActiveObject: (activeObject) => set({ activeObject }),
  bumpObjectsRev: () => set((s) => ({ objectsRev: s.objectsRev + 1 })),
  setFileHandle: (handle) => set({ fileHandle: handle }),
  setProjectName: (name) => set({ projectName: name }),
  setProjectId: (id) => set({ projectId: id }),

  autosave: async () => {
    const { canvas, projectId, projectName, cropModeActive } = get();
    if (!canvas) return;
    // Never autosave while cropping: the image is temporarily in its
    // un-cropped state to render the crop UI. Persisting that would revert
    // any prior crop the user had already applied.
    if (cropModeActive) return;
    try {
      const data = canvas.toObject(EXTRA_PROPS);
      const thumbnail = canvas.toDataURL({ format: 'jpeg', quality: 0.5, multiplier: 0.2 });
      const { saveProjectDb } = await import('../utils/db');
      await saveProjectDb({
        id: projectId,
        name: projectName || 'Untitled design',
        thumbnail,
        updatedAt: Date.now(),
        data,
      });
      // Also remember last opened project in localStorage so Workspace restores it on reload
      localStorage.setItem('canvawasm.lastProjectId', projectId);
    } catch (e) {
      console.warn('DB autosave failed', e);
    }
  },

  /* ---------- Add primitives ---------- */
  addRect: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 120,
      top: 120,
      fill: '#7c5cff',
      width: 160,
      height: 120,
      rx: 8,
      ry: 8,
    });
    applyCornerStyle(rect);
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  },
  addCircle: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const circle = new fabric.Circle({ left: 160, top: 160, fill: '#10b981', radius: 70 });
    applyCornerStyle(circle);
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.requestRenderAll();
  },
  addTriangle: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const tri = new fabric.Triangle({ left: 200, top: 140, fill: '#f59e0b', width: 140, height: 140 });
    applyCornerStyle(tri);
    canvas.add(tri);
    canvas.setActiveObject(tri);
    canvas.requestRenderAll();
  },
  addRoundedRect: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 120,
      top: 120,
      fill: '#7c5cff',
      width: 160,
      height: 120,
      rx: 28,
      ry: 28,
    });
    applyCornerStyle(rect);
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  },
  addEllipse: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const el = new fabric.Ellipse({ left: 150, top: 150, fill: '#10b981', rx: 90, ry: 60 });
    applyCornerStyle(el);
    canvas.add(el);
    canvas.setActiveObject(el);
    canvas.requestRenderAll();
  },
  addDiamond: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const s = 140;
    const p = new fabric.Polygon(
      [
        { x: s / 2, y: 0 },
        { x: s, y: s / 2 },
        { x: s / 2, y: s },
        { x: 0, y: s / 2 },
      ],
      { left: 200, top: 150, fill: '#f59e0b' }
    );
    applyCornerStyle(p);
    canvas.add(p);
    canvas.setActiveObject(p);
    canvas.requestRenderAll();
  },
  addPentagon: () => {
    addRegularPolygon(get().canvas, 5, '#6366f1');
  },
  addHexagon: () => {
    addRegularPolygon(get().canvas, 6, '#06b6d4');
  },
  addStar: (points = 5) => {
    const canvas = get().canvas;
    if (!canvas) return;
    const outerR = 70;
    const innerR = points === 5 ? 30 : 40;
    const step = Math.PI / points;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = i * step - Math.PI / 2;
      pts.push({ x: outerR + Math.cos(angle) * r, y: outerR + Math.sin(angle) * r });
    }
    const p = new fabric.Polygon(pts, { left: 200, top: 150, fill: '#facc15' });
    applyCornerStyle(p);
    canvas.add(p);
    canvas.setActiveObject(p);
    canvas.requestRenderAll();
  },
  addHeart: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const path =
      'M75,40 C75,10 30,10 30,40 C30,70 75,110 75,110 C75,110 120,70 120,40 C120,10 75,10 75,40 Z';
    const p = new fabric.Path(path, { left: 200, top: 150, fill: '#ef4444' });
    applyCornerStyle(p);
    canvas.add(p);
    canvas.setActiveObject(p);
    canvas.requestRenderAll();
  },
  addEmoji: (emoji: string) => {
    const canvas = get().canvas;
    if (!canvas) return;
    const text = new fabric.Textbox(emoji, {
      left: 200,
      top: 150,
      fontSize: 100,
      fontFamily: 'Inter',
      textAlign: 'center',
      originX: 'left',
      originY: 'top',
    });
    applyCornerStyle(text);
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  },
  addBlob: (type: number) => {
    const canvas = get().canvas;
    if (!canvas) return;
    const paths = {
      1: 'M45.7,-76.3C58.6,-69.3,68,-54.6,73.8,-39.7C79.7,-24.8,82,-9.6,79.5,4.7C76.9,19,69.5,32.3,60.2,44.7C50.9,57.1,39.6,68.6,25.8,75.1C11.9,81.6,-4.6,83,-20.9,79.4C-37.2,75.8,-53.4,67.1,-65.4,54.2C-77.4,41.3,-85.2,24.2,-87.3,6.3C-89.4,-11.6,-85.8,-30.2,-75,-44.6C-64.2,-59,-46.3,-69.3,-30,-75.7C-13.8,-82.1,0.7,-84.6,16,-81.8C31.3,-79,47.8,-70.9,45.7,-76.3Z',
      2: 'M38.1,-63.9C51.5,-59.4,65.8,-53.7,73.5,-42.6C81.2,-31.6,82.3,-15.8,81.3,-0.6C80.3,14.6,77.3,29.3,69.5,40.8C61.7,52.3,49.1,60.7,35.6,66.3C22,71.9,7.5,74.7,-6.2,72.4C-19.9,70.1,-32.8,62.7,-45.3,53.8C-57.8,44.9,-69.9,34.4,-77.2,20.8C-84.5,7.2,-87,-9.6,-82.2,-23.5C-77.4,-37.4,-65.3,-48.5,-52.1,-53.4C-38.9,-58.3,-24.5,-56.9,-11.6,-57C1.4,-57.1,14.4,-58.6,24.7,-68.4C35.1,-78.3,42.8,-76.5,38.1,-63.9Z',
      3: 'M57.4,-67.2C71.3,-58.6,77.3,-37.8,77.9,-19.3C78.6,-0.8,73.9,15.5,65.2,30.3C56.6,45.1,43.9,58.4,28.4,65.5C12.8,72.6,-5.7,73.5,-23.4,69C-41.1,64.6,-58,54.8,-68.5,40C-79,25.3,-83.1,5.6,-79.8,-11.6C-76.5,-28.8,-65.7,-43.5,-51.9,-52.4C-38.1,-61.3,-21.3,-64.4,0.4,-64.9C22,-65.4,43.6,-75.7,57.4,-67.2Z'
    };
    const path = paths[type as keyof typeof paths] || paths[1];
    const p = new fabric.Path(path, { left: 200, top: 200, fill: '#6366f1' });
    applyCornerStyle(p);
    canvas.add(p);
    canvas.setActiveObject(p);
    canvas.requestRenderAll();
  },
  addPlus: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const total = 120;
    const arm = 40;
    const off = (total - arm) / 2;
    const pts = [
      { x: off, y: 0 },
      { x: off + arm, y: 0 },
      { x: off + arm, y: off },
      { x: total, y: off },
      { x: total, y: off + arm },
      { x: off + arm, y: off + arm },
      { x: off + arm, y: total },
      { x: off, y: total },
      { x: off, y: off + arm },
      { x: 0, y: off + arm },
      { x: 0, y: off },
      { x: off, y: off },
    ];
    const p = new fabric.Polygon(pts, { left: 200, top: 150, fill: '#ef4444' });
    applyCornerStyle(p);
    canvas.add(p);
    canvas.setActiveObject(p);
    canvas.requestRenderAll();
  },
  addSpeechBubble: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const path =
      'M20,0 L140,0 Q160,0 160,20 L160,80 Q160,100 140,100 L60,100 L40,130 L48,100 L20,100 Q0,100 0,80 L0,20 Q0,0 20,0 Z';
    const p = new fabric.Path(path, { left: 200, top: 150, fill: '#7c5cff' });
    applyCornerStyle(p);
    canvas.add(p);
    canvas.setActiveObject(p);
    canvas.requestRenderAll();
  },
  addArrow: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const pts = [
      { x: 0, y: 20 },
      { x: 60, y: 20 },
      { x: 60, y: 0 },
      { x: 100, y: 40 },
      { x: 60, y: 80 },
      { x: 60, y: 60 },
      { x: 0, y: 60 },
    ];
    const p = new fabric.Polygon(pts, { left: 200, top: 200, fill: '#7c5cff' });
    applyCornerStyle(p);
    canvas.add(p);
    canvas.setActiveObject(p);
    canvas.requestRenderAll();
  },
  addLine: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const line = new fabric.Line([0, 0, 220, 0], {
      left: 200,
      top: 240,
      stroke: '#7c5cff',
      strokeWidth: 4,
      strokeLineCap: 'round',
    });
    applyCornerStyle(line);
    canvas.add(line);
    canvas.setActiveObject(line);
    canvas.requestRenderAll();
  },
  addText: async (variant = 'heading') => {
    const canvas = get().canvas;
    if (!canvas) return;
    const presets = {
      heading: { text: 'Add a heading', fontSize: 44, fontWeight: '700', width: 360, fontFamily: 'Inter' },
      subheading: { text: 'Add a subheading', fontSize: 28, fontWeight: '600', width: 320, fontFamily: 'Inter' },
      body: { text: 'Add a little bit of body text', fontSize: 18, fontWeight: '400', width: 280, fontFamily: 'Inter' },
      'sinhala-heading': { text: 'ආයුබෝවන්', fontSize: 52, fontWeight: '700', width: 420, fontFamily: 'Noto Sans Sinhala' },
      'sinhala-body': { text: 'ඔබට සාදරයෙන් පිළිගනිමු', fontSize: 22, fontWeight: '400', width: 360, fontFamily: 'Noto Sans Sinhala' },
    } as const;
    const preset = presets[variant];
    // Make sure the font is available before Fabric measures/renders the text,
    // otherwise it will paint in the fallback font on first frame.
    await ensureFontLoaded(preset.fontFamily, preset.fontSize);
    const text = new fabric.Textbox(preset.text, {
      left: 200,
      top: 200,
      width: preset.width,
      fontFamily: preset.fontFamily,
      fill: '#111827',
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
    });
    applyCornerStyle(text);
    canvas.add(text);
    canvas.setActiveObject(text);
    // Re-measure now that font is loaded, in case the object was constructed
    // before the font metrics were available.
    if (typeof (text as any).initDimensions === 'function') {
      (text as any)._forceClearCache = true;
      (text as any).initDimensions();
      text.setCoords();
    }
    canvas.renderAll();
  },
  addImage: async (url) => {
    const canvas = get().canvas;
    if (!canvas) return;
    try {
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      const maxDim = 500;
      const scale = Math.min(1, maxDim / Math.max(img.width || maxDim, img.height || maxDim));
      img.set({ left: 100, top: 100, scaleX: scale, scaleY: scale });
      applyCornerStyle(img);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    } catch (error) {
      console.error('Failed to load image', error);
    }
  },



  addTable: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const rows = 3;
    const cols = 3;
    const cellW = 100;
    const cellH = 40;
    const objs: fabric.Object[] = [];
    
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const rect = new fabric.Rect({
          left: c * cellW,
          top: r * cellH,
          width: cellW,
          height: cellH,
          fill: 'transparent',
          stroke: '#cbd5e1',
          strokeWidth: 1,
          ...CELL_LOCKS,
        });
        const text = new fabric.Textbox('Text', {
          left: c * cellW + 10,
          top: r * cellH + 10,
          width: cellW - 20,
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#0f172a',
          splitByGrapheme: true,
          ...CELL_LOCKS,
        });
        objs.push(rect, text);
      }
    }
    
    const group = new fabric.Group(objs, {
      left: 100,
      top: 100,
      // subTargetCheck: true still lets us know which cell is under the cursor
      // (useful for future double-click-to-edit); interactive: false makes the
      // group behave as one draggable unit rather than letting children be
      // individually grabbed, which is what breaks group movement.
      subTargetCheck: true,
      interactive: false,
    }) as any;
    
    group.isTable = true;
    group.tableRows = rows;
    group.tableCols = cols;
    group.cellW = cellW;
    group.cellH = cellH;
    
    applyCornerStyle(group);
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
  },

  addTableRow: () => {
    const canvas = get().canvas;
    // Resolve target: prefer the active object if it's a table, otherwise fall
    // back to the currently-editing table (so add/remove row/col work even
    // when the user has a cell selected in edit mode).
    const activeAny = canvas?.getActiveObject() as any;
    const editing = get().tableEditingGroup as any;
    const active = activeAny?.isTable ? activeAny : editing;
    if (!canvas || !active || !active.isTable) return;
    // If we're in edit mode, exit before rebuilding so the new group is clean.
    if (editing && active === editing) {
      get().exitTableEditMode();
    }
    
    const { tableRows, tableCols, cellW, cellH, left, top } = active;
    const newRows = tableRows + 1;
    
    // Extract existing text
    const objects = active.getObjects();
    const cellTexts: string[][] = [];
    let objIdx = 0;
    for (let r = 0; r < tableRows; r++) {
      cellTexts[r] = [];
      for (let c = 0; c < tableCols; c++) {
        // The pattern is: Rect, Textbox, Rect, Textbox...
        const textObj = objects[objIdx + 1] as fabric.Textbox;
        cellTexts[r][c] = textObj.text || '';
        objIdx += 2;
      }
    }
    
    // Rebuild table
    const newObjs: fabric.Object[] = [];
    for (let r = 0; r < newRows; r++) {
      for (let c = 0; c < tableCols; c++) {
        const rect = new fabric.Rect({
          left: c * cellW,
          top: r * cellH,
          width: cellW,
          height: cellH,
          fill: 'transparent',
          stroke: '#cbd5e1',
          strokeWidth: 1,
          ...CELL_LOCKS,
        });
        const textStr = (r < tableRows && c < tableCols) ? cellTexts[r][c] : 'Text';
        const text = new fabric.Textbox(textStr, {
          left: c * cellW + 10,
          top: r * cellH + 10,
          width: cellW - 20,
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#0f172a',
          splitByGrapheme: true,
          ...CELL_LOCKS,
        });
        newObjs.push(rect, text);
      }
    }
    
    const newGroup = new fabric.Group(newObjs, {
      left, top, subTargetCheck: true, interactive: false
    }) as any;
    newGroup.isTable = true;
    newGroup.tableRows = newRows;
    newGroup.tableCols = tableCols;
    newGroup.cellW = cellW;
    newGroup.cellH = cellH;
    
    applyCornerStyle(newGroup);
    canvas.remove(active);
    canvas.add(newGroup);
    canvas.setActiveObject(newGroup);
    canvas.requestRenderAll();
  },

  addTableColumn: () => {
    const canvas = get().canvas;
    // Resolve target: prefer the active object if it's a table, otherwise fall
    // back to the currently-editing table (so add/remove row/col work even
    // when the user has a cell selected in edit mode).
    const activeAny = canvas?.getActiveObject() as any;
    const editing = get().tableEditingGroup as any;
    const active = activeAny?.isTable ? activeAny : editing;
    if (!canvas || !active || !active.isTable) return;
    // If we're in edit mode, exit before rebuilding so the new group is clean.
    if (editing && active === editing) {
      get().exitTableEditMode();
    }
    
    const { tableRows, tableCols, cellW, cellH, left, top } = active;
    const newCols = tableCols + 1;
    
    // Extract existing text
    const objects = active.getObjects();
    const cellTexts: string[][] = [];
    let objIdx = 0;
    for (let r = 0; r < tableRows; r++) {
      cellTexts[r] = [];
      for (let c = 0; c < tableCols; c++) {
        const textObj = objects[objIdx + 1] as fabric.Textbox;
        cellTexts[r][c] = textObj.text || '';
        objIdx += 2;
      }
    }
    
    // Rebuild table
    const newObjs: fabric.Object[] = [];
    for (let r = 0; r < tableRows; r++) {
      for (let c = 0; c < newCols; c++) {
        const rect = new fabric.Rect({
          left: c * cellW,
          top: r * cellH,
          width: cellW,
          height: cellH,
          fill: 'transparent',
          stroke: '#cbd5e1',
          strokeWidth: 1,
          ...CELL_LOCKS,
        });
        const textStr = (r < tableRows && c < tableCols) ? cellTexts[r][c] : 'Text';
        const text = new fabric.Textbox(textStr, {
          left: c * cellW + 10,
          top: r * cellH + 10,
          width: cellW - 20,
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#0f172a',
          splitByGrapheme: true,
          ...CELL_LOCKS,
        });
        newObjs.push(rect, text);
      }
    }
    
    const newGroup = new fabric.Group(newObjs, {
      left, top, subTargetCheck: true, interactive: false
    }) as any;
    newGroup.isTable = true;
    newGroup.tableRows = tableRows;
    newGroup.tableCols = newCols;
    newGroup.cellW = cellW;
    newGroup.cellH = cellH;

    applyCornerStyle(newGroup);
    canvas.remove(active);
    canvas.add(newGroup);
    canvas.setActiveObject(newGroup);
    canvas.requestRenderAll();
  },

  removeTableRow: () => {
    const canvas = get().canvas;
    // Resolve target: prefer the active object if it's a table, otherwise fall
    // back to the currently-editing table (so add/remove row/col work even
    // when the user has a cell selected in edit mode).
    const activeAny = canvas?.getActiveObject() as any;
    const editing = get().tableEditingGroup as any;
    const active = activeAny?.isTable ? activeAny : editing;
    if (!canvas || !active || !active.isTable) return;
    // If we're in edit mode, exit before rebuilding so the new group is clean.
    if (editing && active === editing) {
      get().exitTableEditMode();
    }
    const { tableRows, tableCols, cellW, cellH, left, top } = active;
    if (tableRows <= 1) return;
    const newRows = tableRows - 1;

    // Preserve text of surviving rows.
    const objects = active.getObjects();
    const cellTexts: string[][] = [];
    let objIdx = 0;
    for (let r = 0; r < tableRows; r++) {
      cellTexts[r] = [];
      for (let c = 0; c < tableCols; c++) {
        const textObj = objects[objIdx + 1] as fabric.Textbox;
        cellTexts[r][c] = textObj.text || '';
        objIdx += 2;
      }
    }

    const newObjs: fabric.Object[] = [];
    for (let r = 0; r < newRows; r++) {
      for (let c = 0; c < tableCols; c++) {
        const rect = new fabric.Rect({
          left: c * cellW, top: r * cellH,
          width: cellW, height: cellH,
          fill: 'transparent', stroke: '#cbd5e1', strokeWidth: 1,
          ...CELL_LOCKS,
        });
        const text = new fabric.Textbox(cellTexts[r][c], {
          left: c * cellW + 10, top: r * cellH + 10,
          width: cellW - 20, fontSize: 16, fontFamily: 'Inter',
          fill: '#0f172a', splitByGrapheme: true,
          ...CELL_LOCKS,
        });
        newObjs.push(rect, text);
      }
    }

    const newGroup = new fabric.Group(newObjs, {
      left, top, subTargetCheck: true, interactive: false,
    }) as any;
    newGroup.isTable = true;
    newGroup.tableRows = newRows;
    newGroup.tableCols = tableCols;
    newGroup.cellW = cellW;
    newGroup.cellH = cellH;

    applyCornerStyle(newGroup);
    canvas.remove(active);
    canvas.add(newGroup);
    canvas.setActiveObject(newGroup);
    canvas.requestRenderAll();
  },

  removeTableColumn: () => {
    const canvas = get().canvas;
    // Resolve target: prefer the active object if it's a table, otherwise fall
    // back to the currently-editing table (so add/remove row/col work even
    // when the user has a cell selected in edit mode).
    const activeAny = canvas?.getActiveObject() as any;
    const editing = get().tableEditingGroup as any;
    const active = activeAny?.isTable ? activeAny : editing;
    if (!canvas || !active || !active.isTable) return;
    // If we're in edit mode, exit before rebuilding so the new group is clean.
    if (editing && active === editing) {
      get().exitTableEditMode();
    }
    const { tableRows, tableCols, cellW, cellH, left, top } = active;
    if (tableCols <= 1) return;
    const newCols = tableCols - 1;

    const objects = active.getObjects();
    const cellTexts: string[][] = [];
    let objIdx = 0;
    for (let r = 0; r < tableRows; r++) {
      cellTexts[r] = [];
      for (let c = 0; c < tableCols; c++) {
        const textObj = objects[objIdx + 1] as fabric.Textbox;
        cellTexts[r][c] = textObj.text || '';
        objIdx += 2;
      }
    }

    const newObjs: fabric.Object[] = [];
    for (let r = 0; r < tableRows; r++) {
      for (let c = 0; c < newCols; c++) {
        const rect = new fabric.Rect({
          left: c * cellW, top: r * cellH,
          width: cellW, height: cellH,
          fill: 'transparent', stroke: '#cbd5e1', strokeWidth: 1,
          ...CELL_LOCKS,
        });
        const text = new fabric.Textbox(cellTexts[r][c], {
          left: c * cellW + 10, top: r * cellH + 10,
          width: cellW - 20, fontSize: 16, fontFamily: 'Inter',
          fill: '#0f172a', splitByGrapheme: true,
          ...CELL_LOCKS,
        });
        newObjs.push(rect, text);
      }
    }

    const newGroup = new fabric.Group(newObjs, {
      left, top, subTargetCheck: true, interactive: false,
    }) as any;
    newGroup.isTable = true;
    newGroup.tableRows = tableRows;
    newGroup.tableCols = newCols;
    newGroup.cellW = cellW;
    newGroup.cellH = cellH;

    applyCornerStyle(newGroup);
    canvas.remove(active);
    canvas.add(newGroup);
    canvas.setActiveObject(newGroup);
    canvas.requestRenderAll();
  },

  /* ---------- Table cell edit mode ---------- */
  enterTableEditMode: (group, cell) => {
    const canvas = get().canvas;
    if (!canvas || !group) return;
    // Flip the group into "interactive" so children (cells) become individually
    // clickable and editable. The whole-group drag is disabled while in this
    // mode; user exits with Escape or the "Exit cell edit" button.
    (group as any).interactive = true;
    (group as any).subTargetCheck = true;
    canvas.discardActiveObject();
    if (cell) {
      canvas.setActiveObject(cell as any);
      if ((cell as any).type === 'textbox' && typeof (cell as any).enterEditing === 'function') {
        (cell as any).enterEditing();
        (cell as any).selectAll?.();
      }
    }
    canvas.requestRenderAll();
    set({ tableEditingGroup: group });
  },
  exitTableEditMode: () => {
    const canvas = get().canvas;
    const grp = get().tableEditingGroup;
    if (!canvas || !grp) return;
    // If a cell text is being edited, exit editing first so the change persists.
    const active = canvas.getActiveObject() as any;
    if (active && active.isEditing && typeof active.exitEditing === 'function') {
      active.exitEditing();
    }
    (grp as any).interactive = false;
    canvas.setActiveObject(grp as any);
    canvas.requestRenderAll();
    set({ tableEditingGroup: null });
  },

  /* ---------- Shape library ---------- */
  addShape: (id) => {
    const canvas = get().canvas;
    if (!canvas) return;
    const entry = SHAPE_LIB.find((s) => s.id === id);
    if (!entry) return;
    const obj = entry.build();
    applyCornerStyle(obj);
    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
  },

  /* ---------- Sticky Note ---------- */
  addStickyNote: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const size = 200;
    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: size,
      height: size,
      fill: '#fef08a',
      stroke: '#facc15',
      strokeWidth: 1,
      rx: 6,
      ry: 6,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.25)',
        blur: 12,
        offsetX: 2,
        offsetY: 4,
      }),
      ...CELL_LOCKS,
    });
    const text = new fabric.Textbox('Add a note...', {
      left: 16,
      top: 20,
      width: size - 32,
      fontSize: 18,
      fontFamily: 'Inter',
      fill: '#111827',
      textAlign: 'left',
      lineHeight: 1.35,
      ...CELL_LOCKS,
    });
    // interactive: false keeps the note as one draggable unit and lets Delete
    // remove the whole group; double-clicking enters text-edit mode on the
    // inner Textbox (handled in Workspace's mouse:dblclick).
    const group = new fabric.Group([rect, text], {
      left: 220,
      top: 220,
      subTargetCheck: true,
      interactive: false,
    }) as any;
    group.isStickyNote = true;
    applyCornerStyle(group);
    canvas.add(group);
    canvas.setActiveObject(group);
    canvas.requestRenderAll();
  },

  /* ---------- Drawing mode (PencilBrush + brush types) ---------- */
  setDrawingMode: (on) => {
    const canvas = get().canvas;
    if (!canvas) {
      set({ drawingMode: on });
      return;
    }
    if (on) {
      applyBrushToCanvas(canvas, get());
      canvas.isDrawingMode = true;
      canvas.discardActiveObject();
      // Attach path:created listener once — for eraser strokes, flip the drawn
      // path to destination-out so it visually cuts through content underneath.
      if (!(canvas as any).__eraserHookAttached) {
        canvas.on('path:created', (e: any) => {
          if (useEditorStore.getState().brushType === 'eraser' && e?.path) {
            e.path.set('globalCompositeOperation', 'destination-out');
            e.path.set('selectable', false);
            e.path.set('evented', false);
            canvas.requestRenderAll();
          }
        });
        (canvas as any).__eraserHookAttached = true;
      }
    } else {
      canvas.isDrawingMode = false;
    }
    canvas.requestRenderAll();
    set({ drawingMode: on });
  },
  setDrawingColor: (color) => {
    set({ drawingColor: color });
    const canvas = get().canvas;
    if (canvas && get().drawingMode) applyBrushToCanvas(canvas, get());
  },
  setDrawingWidth: (width) => {
    set({ drawingWidth: width });
    const canvas = get().canvas;
    if (canvas && get().drawingMode) applyBrushToCanvas(canvas, get());
  },
  setDrawingOpacity: (opacity) => {
    set({ drawingOpacity: Math.max(0, Math.min(1, opacity)) });
    const canvas = get().canvas;
    if (canvas && get().drawingMode) applyBrushToCanvas(canvas, get());
  },
  setBrushType: (type) => {
    set({ brushType: type });
    const canvas = get().canvas;
    if (canvas && get().drawingMode) applyBrushToCanvas(canvas, get());
  },

  addIconSvg: async (svg) => {
    const canvas = get().canvas;
    if (!canvas) return;
    try {
      const parsed = await fabric.loadSVGFromString(svg);
      const objects = (parsed.objects || []).filter(Boolean) as fabric.Object[];
      if (!objects.length) return;
      const group = fabric.util.groupSVGElements(objects, parsed.options);
      const size = 120;
      const scale = size / Math.max(group.width || size, group.height || size);
      group.set({ left: 200, top: 200, scaleX: scale, scaleY: scale });
      applyCornerStyle(group);
      canvas.add(group);
      canvas.setActiveObject(group);
      canvas.requestRenderAll();
    } catch (e) {
      console.error('Failed to add icon:', e);
    }
  },

  loadTemplate: async (id) => {
    const canvas = get().canvas;
    if (!canvas) return;
    const { TEMPLATES } = await import('../utils/templates');
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    canvas.clear();
    canvas.backgroundColor = t.background;
    canvas.setDimensions({ width: t.width, height: t.height });
    set({
      canvasSize: { width: t.width, height: t.height },
      bgColor: t.background,
    });
    await t.build(canvas, fabric, applyCornerStyle);
    canvas.renderAll();
    get().initHistory();
  },

  /* ---------- Deletion / cloning ---------- */
  deleteSelected: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const targets = canvas.getActiveObjects();
    if (!targets.length) return;
    targets.forEach((o) => canvas.remove(o));
    canvas.discardActiveObject();
    set({ activeObject: null });
    canvas.requestRenderAll();
  },
  duplicateSelected: async () => {
    const canvas = get().canvas;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;
    const cloned = await active.clone();
    cloned.set({ left: (active.left ?? 0) + 20, top: (active.top ?? 0) + 20 });
    applyCornerStyle(cloned);
    if (cloned instanceof fabric.ActiveSelection) {
      cloned.canvas = canvas;
      cloned.forEachObject((o) => canvas.add(o));
      cloned.setCoords();
    } else {
      canvas.add(cloned);
    }
    canvas.setActiveObject(cloned);
    canvas.requestRenderAll();
  },
  copySelected: async () => {
    const canvas = get().canvas;
    const active = canvas?.getActiveObject();
    if (!active) return;
    clipboard = await active.clone();
  },
  paste: async () => {
    const canvas = get().canvas;
    if (!canvas || !clipboard) return;
    const cloned = await clipboard.clone();
    cloned.set({ left: (clipboard.left ?? 0) + 20, top: (clipboard.top ?? 0) + 20 });
    applyCornerStyle(cloned);
    if (cloned instanceof fabric.ActiveSelection) {
      cloned.canvas = canvas;
      cloned.forEachObject((o) => canvas.add(o));
      cloned.setCoords();
    } else {
      canvas.add(cloned);
    }
    clipboard.set({ left: (clipboard.left ?? 0) + 20, top: (clipboard.top ?? 0) + 20 });
    canvas.setActiveObject(cloned);
    canvas.requestRenderAll();
  },

  updateSelectedProperty: async (key, value) => {
    const canvas = get().canvas;
    if (!canvas) return;
    const target = canvas.getActiveObject();
    if (!target) return;

    const any = target as any;
    const ctor = any.constructor;
    const isTextLike = typeof any.removeStyle === 'function';

    // Font-family: wait for the font before applying so metrics are correct.
    if (isTextLike && key === 'fontFamily' && typeof value === 'string') {
      await ensureFontLoaded(value, any.fontSize ?? 24);
    }

    // ---- Rich per-character formatting ----
    // If the text is being edited AND the user has an active selection range,
    // apply the style ONLY to that range via setSelectionStyles. Bold on a
    // selected word only bolds that word, etc.
    const styleProps: string[] | undefined = ctor?._styleProperties;
    const isStyleProp = styleProps?.includes(key);
    const inEditSelection =
      isTextLike &&
      isStyleProp &&
      any.isEditing === true &&
      typeof any.selectionStart === 'number' &&
      typeof any.selectionEnd === 'number' &&
      any.selectionStart !== any.selectionEnd;

    if (inEditSelection) {
      any.setSelectionStyles(
        { [key]: value },
        any.selectionStart,
        any.selectionEnd
      );
      any._forceClearCache = true;
      if (typeof any.initDimensions === 'function') any.initDimensions();
      any.dirty = true;
      canvas.renderAll();
      set({
        activeObject: Object.assign(Object.create(Object.getPrototypeOf(target)), target),
      });
      get().saveHistory();
      return;
    }

    // ---- Whole-object path ----
    // Strip per-char overrides for character-level style keys so the top-level
    // value actually wins across the whole text.
    if (isTextLike && isStyleProp) {
      any.removeStyle(key);
    }

    target.set(key as keyof fabric.Object, value);
    target.setCoords();

    if (isTextLike) {
      const layoutProps: string[] | undefined = ctor?.textLayoutProperties;
      if (layoutProps?.includes(key) && typeof any.initDimensions === 'function') {
        any._forceClearCache = true;
        any.initDimensions();
        target.setCoords();
      }
      any.dirty = true;
    }

    canvas.renderAll();

    set({
      activeObject: Object.assign(
        Object.create(Object.getPrototypeOf(target)),
        target
      ),
    });
    get().saveHistory();
  },

  /* ---------- Advanced text: curves, effects, sup/sub ---------- */
  applyCurve: (kind) => {
    const canvas = get().canvas;
    if (!canvas) return;
    const target = canvas.getActiveObject() as any;
    if (!target || typeof target.removeStyle !== 'function') return;

    if (kind === 'none') {
      target.set('path', null);
    } else {
      const w = Math.max(200, target.getScaledWidth?.() ?? 400);
      const amp = Math.max(60, w * 0.2);
      let d = '';
      if (kind === 'arc-up') {
        d = `M 0 ${amp} Q ${w / 2} ${-amp} ${w} ${amp}`;
      } else if (kind === 'arc-down') {
        d = `M 0 0 Q ${w / 2} ${amp * 1.5} ${w} 0`;
      } else if (kind === 'wave') {
        const q = w / 4;
        d = `M 0 ${amp / 2} Q ${q / 2} 0 ${q} ${amp / 2} T ${w / 2} ${amp / 2} T ${w * 3 / 4} ${amp / 2} T ${w} ${amp / 2}`;
      } else if (kind === 'circle') {
        const r = w / (2 * Math.PI); // circumference matches text width
        d = `M ${r} 0 A ${r} ${r} 0 1 1 ${r} ${2 * r} A ${r} ${r} 0 1 1 ${r} 0`;
      }
      const path = new fabric.Path(d, { fill: '', stroke: '', selectable: false, evented: false });
      target.set('path', path);
    }
    target._forceClearCache = true;
    if (typeof target.initDimensions === 'function') target.initDimensions();
    target.setCoords();
    target.dirty = true;
    canvas.renderAll();
    set({
      activeObject: Object.assign(Object.create(Object.getPrototypeOf(target)), target),
    });
    get().saveHistory();
  },

  applyTextEffect: (preset) => {
    const canvas = get().canvas;
    if (!canvas) return;
    const target = canvas.getActiveObject() as any;
    if (!target || typeof target.removeStyle !== 'function') return;

    // Clear any per-char overrides so effects apply uniformly.
    ['fill', 'stroke', 'strokeWidth', 'shadow'].forEach((k) => {
      if (typeof target.removeStyle === 'function') target.removeStyle(k);
    });

    const currentFill =
      typeof target.fill === 'string' && /^#[0-9a-fA-F]{6}$/.test(target.fill) ? target.fill : '#7c5cff';

    const setEffect = (props: Record<string, any>) => {
      Object.entries(props).forEach(([k, v]) => target.set(k, v));
    };

    switch (preset) {
      case 'none':
        setEffect({ stroke: null, strokeWidth: 0, shadow: null });
        break;
      case 'neon':
        setEffect({
          fill: '#ffffff',
          stroke: null,
          strokeWidth: 0,
          shadow: { color: currentFill, blur: 30, offsetX: 0, offsetY: 0 },
        });
        break;
      case 'echo':
        setEffect({
          stroke: null,
          strokeWidth: 0,
          shadow: { color: currentFill, blur: 0, offsetX: 8, offsetY: 8 },
        });
        break;
      case 'splice':
        setEffect({
          stroke: currentFill,
          strokeWidth: 3,
          shadow: { color: '#facc15', blur: 0, offsetX: 6, offsetY: 6 },
        });
        break;
      case '3d':
        setEffect({
          stroke: '#000000',
          strokeWidth: 1,
          shadow: { color: '#0f172a', blur: 0, offsetX: 6, offsetY: 6 },
        });
        break;
      case 'outline':
        setEffect({
          fill: 'transparent',
          stroke: currentFill,
          strokeWidth: 2,
          shadow: null,
        });
        break;
      case 'hollow':
        setEffect({
          fill: 'transparent',
          stroke: '#111827',
          strokeWidth: 2,
          shadow: null,
        });
        break;
      case 'shadow':
        setEffect({
          shadow: { color: 'rgba(0,0,0,0.4)', blur: 12, offsetX: 4, offsetY: 6 },
        });
        break;
    }
    target._forceClearCache = true;
    if (typeof target.initDimensions === 'function') target.initDimensions();
    target.setCoords();
    target.dirty = true;
    canvas.renderAll();
    set({
      activeObject: Object.assign(Object.create(Object.getPrototypeOf(target)), target),
    });
    get().saveHistory();
  },

  toggleSuperscript: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const target = canvas.getActiveObject() as any;
    if (!target || typeof target.setSuperscript !== 'function') return;
    const start = target.isEditing ? target.selectionStart ?? 0 : 0;
    const rawEnd = target.isEditing ? target.selectionEnd ?? start : (target.text?.length ?? 0);
    const end = rawEnd === start ? (target.text?.length ?? 0) : rawEnd;
    if (start === end) return;
    target.setSuperscript(start, end);
    target._forceClearCache = true;
    if (typeof target.initDimensions === 'function') target.initDimensions();
    target.dirty = true;
    canvas.renderAll();
    get().saveHistory();
  },

  toggleSubscript: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const target = canvas.getActiveObject() as any;
    if (!target || typeof target.setSubscript !== 'function') return;
    const start = target.isEditing ? target.selectionStart ?? 0 : 0;
    const rawEnd = target.isEditing ? target.selectionEnd ?? start : (target.text?.length ?? 0);
    const end = rawEnd === start ? (target.text?.length ?? 0) : rawEnd;
    if (start === end) return;
    target.setSubscript(start, end);
    target._forceClearCache = true;
    if (typeof target.initDimensions === 'function') target.initDimensions();
    target.dirty = true;
    canvas.renderAll();
    get().saveHistory();
  },

  /* ---------- Image editing: filters, crop, background removal ---------- */
  setImageFilter: (kind, value) => {
    const canvas = get().canvas;
    if (!canvas) return;
    const target = canvas.getActiveObject() as any;
    if (!target || target.type !== 'image') return;
    const state = readFilterState(target);
    (state as any)[kind] = value;
    applyFilterState(target, state);
    canvas.renderAll();
    set({
      activeObject: Object.assign(Object.create(Object.getPrototypeOf(target)), target),
    });
    get().saveHistory();
  },
  applyImagePreset: (id) => {
    const canvas = get().canvas;
    if (!canvas) return;
    const target = canvas.getActiveObject() as any;
    if (!target || target.type !== 'image') return;
    const preset = FILTER_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    const state = { ...defaultFilterState(), ...preset.state };
    applyFilterState(target, state);
    canvas.renderAll();
    set({
      activeObject: Object.assign(Object.create(Object.getPrototypeOf(target)), target),
    });
    get().saveHistory();
  },
  resetImageFilters: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const target = canvas.getActiveObject() as any;
    if (!target || target.type !== 'image') return;
    applyFilterState(target, defaultFilterState());
    canvas.renderAll();
    set({
      activeObject: Object.assign(Object.create(Object.getPrototypeOf(target)), target),
    });
    get().saveHistory();
  },

  /* ---------- PowerPoint-style crop ------------------------------
   * On enter:
   *   1) Snapshot the image's current state (for cancel/undo).
   *   2) "Un-crop" the image so the full source is visible, positioned so the
   *      currently-visible cropped area stays exactly where it was on canvas.
   *   3) Overlay 4 dim rects (top/right/bottom/left) around a draggable +
   *      resizable crop rectangle sitting at the currently-cropped area.
   *   4) Lock the image scale/rotation but allow drag — user can reposition
   *      the image "under" the crop (classic PPT behavior).
   * The crop rect's moving/scaling events keep the 4 dim rects synced live.
   * ---------------------------------------------------------------- */
  startCropMode: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const img = canvas.getActiveObject() as any;
    if (!img || img.type !== 'image') return;

    // Wipe any stale overlays from a previous session.
    canvas.getObjects().forEach((o) => {
      if ((o as any).isCropOverlay || (o as any).isDimOverlay || (o as any).isCropRect) {
        canvas.remove(o);
      }
    });

    // Snapshot original state so cancel/undo can restore.
    const snapshot = {
      cropX: img.cropX ?? 0,
      cropY: img.cropY ?? 0,
      width: img.width,
      height: img.height,
      left: img.left ?? 0,
      top: img.top ?? 0,
      scaleX: img.scaleX ?? 1,
      scaleY: img.scaleY ?? 1,
      hasControls: img.hasControls,
      lockScalingX: img.lockScalingX,
      lockScalingY: img.lockScalingY,
      lockRotation: img.lockRotation,
      selectable: img.selectable,
    };
    (img as any).__cropSnapshot = snapshot;

    const el: HTMLImageElement | undefined = img._element || (typeof img.getElement === 'function' ? img.getElement() : undefined);
    const naturalW = el?.naturalWidth || img.width || 100;
    const naturalH = el?.naturalHeight || img.height || 100;

    // Visual coords + size of the currently cropped area on canvas.
    const visLeft = snapshot.left;
    const visTop = snapshot.top;
    const visW = img.getScaledWidth();
    const visH = img.getScaledHeight();

    // "Un-crop": show the full source. Keep the current visible area at the
    // same on-canvas position by shifting the image top-left by the crop offset.
    img.set({
      cropX: 0,
      cropY: 0,
      width: naturalW,
      height: naturalH,
      left: visLeft - snapshot.cropX * snapshot.scaleX,
      top: visTop - snapshot.cropY * snapshot.scaleY,
      // Lock scale + rotation while cropping so the user can only *move* the
      // image (PPT-like); the crop rect handles what area is kept.
      hasControls: false,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
      // Allow drag
      selectable: true,
    });
    img.setCoords();

    // Crop rectangle at the currently-cropped area.
    const cropRect = new fabric.Rect({
      left: visLeft,
      top: visTop,
      width: visW,
      height: visH,
      fill: 'transparent',
      stroke: '#ffffff',
      strokeWidth: 2,
      strokeDashArray: [6, 4],
      strokeUniform: true,
      hasControls: true,
      hasBorders: true,
      lockRotation: true,
      cornerColor: '#000000',
      cornerStrokeColor: '#ffffff',
      cornerStyle: 'rect',
      transparentCorners: false,
      cornerSize: 12,
      borderColor: '#000000',
      selectable: true,
      evented: true,
    });
    (cropRect as any).isCropRect = true;

    const makeDim = (): fabric.Rect => {
      const r = new fabric.Rect({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
        fill: 'rgba(0,0,0,0.55)',
        selectable: false,
        evented: false,
        hoverCursor: 'default',
      });
      (r as any).isDimOverlay = true;
      return r;
    };
    const dimT = makeDim();
    const dimR = makeDim();
    const dimB = makeDim();
    const dimL = makeDim();

    const syncDims = () => {
      const cw = canvas.getWidth();
      const ch = canvas.getHeight();
      const cx = cropRect.left ?? 0;
      const cy = cropRect.top ?? 0;
      const cwd = cropRect.getScaledWidth();
      const chd = cropRect.getScaledHeight();

      dimT.set({ left: 0, top: 0, width: cw, height: Math.max(0, cy) });
      dimB.set({ left: 0, top: cy + chd, width: cw, height: Math.max(0, ch - (cy + chd)) });
      dimL.set({ left: 0, top: cy, width: Math.max(0, cx), height: chd });
      dimR.set({ left: cx + cwd, top: cy, width: Math.max(0, cw - (cx + cwd)), height: chd });
      dimT.setCoords();
      dimB.setCoords();
      dimL.setCoords();
      dimR.setCoords();
    };
    syncDims();

    // Keep dims in sync while user drags/scales the crop rect.
    cropRect.on('moving', syncDims);
    cropRect.on('scaling', syncDims);

    // Also re-sync when the image itself moves (user repositioning image
    // under the crop). Nothing changes about the crop rect, but the dim
    // rects should still repaint to reflect any window resize.
    img.on?.('moving', syncDims);

    // Store refs on the image so exit routines can find them without
    // touching module-scope state (survives HMR).
    (img as any).__cropRect = cropRect;
    (img as any).__cropDims = [dimT, dimR, dimB, dimL];
    (img as any).__cropSync = syncDims;

    canvas.add(dimT, dimR, dimB, dimL, cropRect);
    canvas.setActiveObject(cropRect);
    canvas.requestRenderAll();
    set({ cropModeActive: true });
  },

  applyCrop: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const img = canvas
      .getObjects()
      .find((o) => (o as any).__cropRect) as any;
    if (!img) {
      set({ cropModeActive: false });
      return;
    }
    const cropRect = img.__cropRect as fabric.Rect;
    const dims = (img.__cropDims || []) as fabric.Rect[];

    // Compute crop values in the image's *source* coordinate system.
    // Because we un-cropped the image on enter, crop rect coords translate
    // directly:  sourceX = (cropRectLeft - imgLeft) / scaleX.
    const sx = img.scaleX || 1;
    const sy = img.scaleY || 1;
    const iL = img.left ?? 0;
    const iT = img.top ?? 0;
    const cL = cropRect.left ?? 0;
    const cT = cropRect.top ?? 0;
    // Use raw width/height * scale (not getScaledWidth) because getScaledWidth
    // includes strokeWidth. The crop *area* is what's inside the stroke, so
    // 2px stroke would otherwise leak into the crop dimensions.
    const cW = (cropRect.width || 0) * (cropRect.scaleX || 1);
    const cH = (cropRect.height || 0) * (cropRect.scaleY || 1);

    let cropX = (cL - iL) / sx;
    let cropY = (cT - iT) / sy;
    let width = cW / sx;
    let height = cH / sy;

    // Clamp crop to source bounds so we don't render outside pixels.
    const naturalW = img.width;
    const naturalH = img.height;
    if (cropX < 0) {
      width += cropX;
      cropX = 0;
    }
    if (cropY < 0) {
      height += cropY;
      cropY = 0;
    }
    if (cropX + width > naturalW) width = naturalW - cropX;
    if (cropY + height > naturalH) height = naturalH - cropY;
    width = Math.max(1, width);
    height = Math.max(1, height);

    img.set({
      cropX,
      cropY,
      width,
      height,
      // Reposition image so the cropped area sits where the crop rect is.
      left: iL + cropX * sx,
      top: iT + cropY * sy,
      // Restore normal interaction.
      hasControls: (img.__cropSnapshot?.hasControls) ?? true,
      lockScalingX: (img.__cropSnapshot?.lockScalingX) ?? false,
      lockScalingY: (img.__cropSnapshot?.lockScalingY) ?? false,
      lockRotation: (img.__cropSnapshot?.lockRotation) ?? false,
    });
    img.setCoords();

    // Detach handlers + remove overlays.
    cropRect.off?.('moving');
    cropRect.off?.('scaling');
    img.off?.('moving');
    canvas.remove(cropRect, ...dims);

    delete img.__cropSnapshot;
    delete img.__cropRect;
    delete img.__cropDims;
    delete img.__cropSync;

    canvas.setActiveObject(img);
    canvas.requestRenderAll();
    set({ cropModeActive: false });
    get().saveHistory();
  },

  cancelCrop: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const img = canvas
      .getObjects()
      .find((o) => (o as any).__cropRect) as any;
    if (!img) {
      // Just clean any orphan overlays.
      canvas.getObjects().forEach((o) => {
        if ((o as any).isCropRect || (o as any).isDimOverlay) canvas.remove(o);
      });
      set({ cropModeActive: false });
      canvas.requestRenderAll();
      return;
    }
    const snap = img.__cropSnapshot as any;
    const cropRect = img.__cropRect as fabric.Rect;
    const dims = (img.__cropDims || []) as fabric.Rect[];

    if (snap) img.set(snap);
    img.setCoords();

    cropRect.off?.('moving');
    cropRect.off?.('scaling');
    img.off?.('moving');
    canvas.remove(cropRect, ...dims);

    delete img.__cropSnapshot;
    delete img.__cropRect;
    delete img.__cropDims;
    delete img.__cropSync;

    canvas.setActiveObject(img);
    canvas.requestRenderAll();
    set({ cropModeActive: false });
  },

  /**
   * Reset a previously-cropped image back to its full source. Not the same as
   * cancel — this is a permanent action that clears any existing crop.
   */
  resetCrop: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const img = canvas.getActiveObject() as any;
    if (!img || img.type !== 'image') return;
    const el: HTMLImageElement | undefined =
      img._element || (typeof img.getElement === 'function' ? img.getElement() : undefined);
    const naturalW = el?.naturalWidth || img.width;
    const naturalH = el?.naturalHeight || img.height;
    const sx = img.scaleX || 1;
    const sy = img.scaleY || 1;
    img.set({
      cropX: 0,
      cropY: 0,
      width: naturalW,
      height: naturalH,
      left: (img.left ?? 0) - (img.cropX ?? 0) * sx,
      top: (img.top ?? 0) - (img.cropY ?? 0) * sy,
    });
    img.setCoords();
    canvas.requestRenderAll();
    get().saveHistory();
  },

  removeBackground: async () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const img = canvas.getActiveObject() as any;
    if (!img || img.type !== 'image') return;
    set({ bgRemovalBusy: true });
    try {
      const mod = await import('@imgly/background-removal');
      const remove = (mod as any).removeBackground || (mod as any).default;
      if (typeof remove !== 'function') throw new Error('removeBackground export not found');

      // Serialize the current image (with any applied filters) to a data URL,
      // so background removal operates on what the user actually sees.
      const el = img._element || img.getElement?.();
      if (!el) throw new Error('image element not available');
      const w = el.naturalWidth || el.width;
      const h = el.naturalHeight || el.height;
      const tmp = document.createElement('canvas');
      tmp.width = w;
      tmp.height = h;
      const ctx = tmp.getContext('2d');
      if (!ctx) throw new Error('2d context unavailable');
      ctx.drawImage(el, 0, 0, w, h);
      const srcBlob = await new Promise<Blob>((res, rej) =>
        tmp.toBlob((b) => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png')
      );

      const outBlob: Blob = await remove(srcBlob);
      const url = URL.createObjectURL(outBlob);
      await (img as any).setSrc(url);
      // Reset any filters (they'd apply on top of the transparency)
      img.filters = [];
      img.applyFilters?.();
      canvas.renderAll();
      get().saveHistory();
    } catch (e: any) {
      console.error('Background removal failed:', e);
      alert(
        'Background removal failed.\n\n' +
          (e?.message || 'Unknown error') +
          '\n\nMake sure @imgly/background-removal is installed and try again.'
      );
    } finally {
      set({ bgRemovalBusy: false });
    }
  },

  /* ---------- Recent colors ---------- */
  pushRecentColor: (color) => {
    const next = pushRecent(get().recentColors, color);
    saveRecentColors(next);
    set({ recentColors: next });
  },

  /* ---------- Brand kit ---------- */
  reloadBrandKit: async () => {
    const kit = await loadBrandKit();
    set({ brandKit: kit });
  },
  addBrandColor: async (color) => {
    const kit = get().brandKit;
    if (kit.colors.includes(color)) return;
    const next = { ...kit, colors: [color, ...kit.colors].slice(0, 40) };
    await saveBrandKit(next);
    set({ brandKit: next });
  },
  removeBrandColor: async (color) => {
    const kit = get().brandKit;
    const next = { ...kit, colors: kit.colors.filter((c) => c !== color) };
    await saveBrandKit(next);
    set({ brandKit: next });
  },
  addBrandFont: async (family) => {
    const kit = get().brandKit;
    if (kit.fonts.includes(family)) return;
    const next = { ...kit, fonts: [family, ...kit.fonts].slice(0, 20) };
    await saveBrandKit(next);
    set({ brandKit: next });
  },
  removeBrandFont: async (family) => {
    const kit = get().brandKit;
    const next = { ...kit, fonts: kit.fonts.filter((f) => f !== family) };
    await saveBrandKit(next);
    set({ brandKit: next });
  },
  addBrandLogo: async (name, dataUrl) => {
    const kit = get().brandKit;
    const logo: BrandLogo = { id: newLogoId(), name, dataUrl };
    const next = { ...kit, logos: [logo, ...kit.logos].slice(0, 20) };
    await saveBrandKit(next);
    set({ brandKit: next });
  },
  removeBrandLogo: async (id) => {
    const kit = get().brandKit;
    const next = { ...kit, logos: kit.logos.filter((l) => l.id !== id) };
    await saveBrandKit(next);
    set({ brandKit: next });
  },
  applyBrandLogo: async (logo) => {
    const canvas = get().canvas;
    if (!canvas) return;
    try {
      const img = await fabric.FabricImage.fromURL(logo.dataUrl, { crossOrigin: 'anonymous' });
      const maxDim = 300;
      const scale = Math.min(1, maxDim / Math.max(img.width || maxDim, img.height || maxDim));
      img.set({ left: 120, top: 120, scaleX: scale, scaleY: scale });
      applyCornerStyle(img);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.requestRenderAll();
    } catch (e) {
      console.error('Failed to add logo', e);
    }
  },

  /* ---------- Comments ---------- */
  setObjectComment: (obj, text) => {
    const canvas = get().canvas;
    if (!canvas || !obj) return;
    (obj as any).comment = text;
    obj.setCoords();
    canvas.requestRenderAll();
    set({
      activeObject: Object.assign(Object.create(Object.getPrototypeOf(obj)), obj),
    });
    get().bumpObjectsRev();
    get().saveHistory();
  },

  /* ---------- Context menu ---------- */
  showContextMenu: (x, y) => set({ contextMenu: { x, y } }),
  hideContextMenu: () => set({ contextMenu: null }),

  /* ---------- Layer order ---------- */
  bringForward: () => {
    const { canvas, activeObject } = get();
    if (canvas && activeObject) {
      canvas.bringObjectForward(activeObject);
      canvas.requestRenderAll();
      get().bumpObjectsRev();
      get().saveHistory();
    }
  },
  sendBackward: () => {
    const { canvas, activeObject } = get();
    if (canvas && activeObject) {
      canvas.sendObjectBackwards(activeObject);
      canvas.requestRenderAll();
      get().bumpObjectsRev();
      get().saveHistory();
    }
  },
  bringToFront: () => {
    const { canvas, activeObject } = get();
    if (canvas && activeObject) {
      canvas.bringObjectToFront(activeObject);
      canvas.requestRenderAll();
      get().bumpObjectsRev();
      get().saveHistory();
    }
  },
  sendToBack: () => {
    const { canvas, activeObject } = get();
    if (canvas && activeObject) {
      canvas.sendObjectToBack(activeObject);
      canvas.requestRenderAll();
      get().bumpObjectsRev();
      get().saveHistory();
    }
  },

  /* ---------- Align (to canvas bounds) ---------- */
  align: (dir) => {
    const { canvas, activeObject } = get();
    if (!canvas || !activeObject) return;
    const cw = canvas.getWidth();
    const ch = canvas.getHeight();
    const bw = activeObject.getScaledWidth();
    const bh = activeObject.getScaledHeight();
    switch (dir) {
      case 'left':
        activeObject.set({ left: 0 });
        break;
      case 'center-h':
        activeObject.set({ left: (cw - bw) / 2 });
        break;
      case 'right':
        activeObject.set({ left: cw - bw });
        break;
      case 'top':
        activeObject.set({ top: 0 });
        break;
      case 'center-v':
        activeObject.set({ top: (ch - bh) / 2 });
        break;
      case 'bottom':
        activeObject.set({ top: ch - bh });
        break;
    }
    activeObject.setCoords();
    canvas.requestRenderAll();
    get().saveHistory();
  },
  flip: (axis) => {
    const { canvas, activeObject } = get();
    if (!canvas || !activeObject) return;
    if (axis === 'h') activeObject.set('flipX', !activeObject.flipX);
    else activeObject.set('flipY', !activeObject.flipY);
    canvas.requestRenderAll();
    get().saveHistory();
  },

  nudge: (dx, dy) => {
    const { canvas, activeObject } = get();
    if (!canvas || !activeObject) return;
    activeObject.set({ left: (activeObject.left ?? 0) + dx, top: (activeObject.top ?? 0) + dy });
    activeObject.setCoords();
    canvas.requestRenderAll();
    get().saveHistory();
  },
  selectAll: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const objects = canvas.getObjects();
    if (!objects.length) return;
    canvas.discardActiveObject();
    const sel = new fabric.ActiveSelection(objects, { canvas });
    canvas.setActiveObject(sel);
    canvas.requestRenderAll();
  },
  discardSelection: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    set({ activeObject: null });
  },

  /* ---------- Group / ungroup (Fabric v6 manual) ---------- */
  group: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!(active instanceof fabric.ActiveSelection)) return;
    const objects = active.getObjects().slice();
    canvas.discardActiveObject();
    objects.forEach((o) => canvas.remove(o));
    const grp = new fabric.Group(objects);
    applyCornerStyle(grp);
    canvas.add(grp);
    canvas.setActiveObject(grp);
    canvas.requestRenderAll();
    get().bumpObjectsRev();
    get().saveHistory();
  },
  ungroup: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!(active instanceof fabric.Group) || active instanceof fabric.ActiveSelection) return;
    const items = active.removeAll();
    canvas.remove(active);
    items.forEach((o) => {
      applyCornerStyle(o);
      canvas.add(o);
    });
    const sel = new fabric.ActiveSelection(items, { canvas });
    canvas.setActiveObject(sel);
    canvas.requestRenderAll();
    get().bumpObjectsRev();
    get().saveHistory();
  },

  /* ---------- Distribute evenly ---------- */
  distribute: (axis) => {
    const canvas = get().canvas;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!(active instanceof fabric.ActiveSelection)) return;
    const objects = active.getObjects();
    if (objects.length < 3) return;
    // ActiveSelection children are positioned relative to the selection's own
    // matrix. We temporarily disband to work with absolute coordinates, then
    // rebuild the selection.
    canvas.discardActiveObject();

    if (axis === 'h') {
      const sorted = objects.slice().sort((a, b) => (a.left ?? 0) - (b.left ?? 0));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalSpan =
        (last.left ?? 0) + last.getScaledWidth() - (first.left ?? 0);
      const objsWidth = sorted.reduce((s, o) => s + o.getScaledWidth(), 0);
      const gap = (totalSpan - objsWidth) / (sorted.length - 1);
      let cursor = (first.left ?? 0) + first.getScaledWidth() + gap;
      for (let i = 1; i < sorted.length - 1; i++) {
        sorted[i].set({ left: cursor });
        sorted[i].setCoords();
        cursor += sorted[i].getScaledWidth() + gap;
      }
    } else {
      const sorted = objects.slice().sort((a, b) => (a.top ?? 0) - (b.top ?? 0));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalSpan =
        (last.top ?? 0) + last.getScaledHeight() - (first.top ?? 0);
      const objsHeight = sorted.reduce((s, o) => s + o.getScaledHeight(), 0);
      const gap = (totalSpan - objsHeight) / (sorted.length - 1);
      let cursor = (first.top ?? 0) + first.getScaledHeight() + gap;
      for (let i = 1; i < sorted.length - 1; i++) {
        sorted[i].set({ top: cursor });
        sorted[i].setCoords();
        cursor += sorted[i].getScaledHeight() + gap;
      }
    }

    const sel = new fabric.ActiveSelection(objects, { canvas });
    canvas.setActiveObject(sel);
    canvas.requestRenderAll();
    get().saveHistory();
  },

  /* ---------- Canvas config ---------- */
  setBgColor: (color) => {
    const canvas = get().canvas;
    if (!canvas) return;
    canvas.backgroundColor = color;
    canvas.requestRenderAll();
    set({ bgColor: color });
    get().saveHistory();
  },
  resizeCanvas: (w, h) => {
    const canvas = get().canvas;
    if (!canvas) return;
    canvas.setDimensions({ width: w, height: h });
    canvas.requestRenderAll();
    set({ canvasSize: { width: w, height: h } });
    get().saveHistory();
  },

  /* ---------- History ---------- */
  saveHistory: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    pushHistory(canvas, set);
  },
  initHistory: () => {
    const canvas = get().canvas;
    if (!canvas) return;
    historyStack = [JSON.stringify(canvas.toObject(EXTRA_PROPS))];
    historyIndex = 0;
    set({ canUndo: false, canRedo: false });
  },
  clearHistory: () => {
    historyStack = [];
    historyIndex = -1;
    set({ canUndo: false, canRedo: false });
  },
  undo: async () => {
    const canvas = get().canvas;
    if (!canvas || historyIndex <= 0) return;
    isRestoring = true;
    historyIndex--;
    await canvas.loadFromJSON(JSON.parse(historyStack[historyIndex]));
    canvas.getObjects().forEach(applyCornerStyle);
    canvas.renderAll();
    set({
      canUndo: historyIndex > 0,
      canRedo: historyIndex < historyStack.length - 1,
      activeObject: null,
      bgColor: (canvas.backgroundColor as string) || '#ffffff',
    });
    get().bumpObjectsRev();
    isRestoring = false;
  },
  redo: async () => {
    const canvas = get().canvas;
    if (!canvas || historyIndex >= historyStack.length - 1) return;
    isRestoring = true;
    historyIndex++;
    await canvas.loadFromJSON(JSON.parse(historyStack[historyIndex]));
    canvas.getObjects().forEach(applyCornerStyle);
    canvas.renderAll();
    set({
      canUndo: historyIndex > 0,
      canRedo: historyIndex < historyStack.length - 1,
      activeObject: null,
      bgColor: (canvas.backgroundColor as string) || '#ffffff',
    });
    get().bumpObjectsRev();
    isRestoring = false;
  },
}));

export const isHistoryRestoring = () => isRestoring;
