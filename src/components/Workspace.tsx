import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { isHistoryRestoring, useEditorStore } from '../store/useEditorStore';
import { attachSnapping } from '../utils/snapping';
import Rulers from './Rulers';
import ContextMenu from './ContextMenu';

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;
const AUTOSAVE_DEBOUNCE = 600;

const Workspace: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const setCanvas = useEditorStore((state) => state.setCanvas);
  const canvasSize = useEditorStore((s) => s.canvasSize);
  const showRulers = useEditorStore((s) => s.showRulers);
  const showGrid = useEditorStore((s) => s.showGrid);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initCanvas = new fabric.Canvas(canvasRef.current, {
      width: 900,
      height: 600,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
    });

    fabricRef.current = initCanvas;
    setCanvas(initCanvas);

    // ---- Selection sync ----
    const handleSelection = () => {
      useEditorStore.getState().setActiveObject(initCanvas.getActiveObject() || null);
    };
    initCanvas.on('selection:created', handleSelection);
    initCanvas.on('selection:updated', handleSelection);
    initCanvas.on('selection:cleared', handleSelection);

    // ---- History hooks ----
    const trackChange = () => {
      if (isHistoryRestoring()) return;
      useEditorStore.getState().saveHistory();
      useEditorStore.getState().bumpObjectsRev();
      scheduleAutosave();
    };
    initCanvas.on('object:added', trackChange);
    initCanvas.on('object:modified', trackChange);
    initCanvas.on('object:removed', trackChange);

    // ---- Smart guides + snapping ----
    const snapHandle = attachSnapping(initCanvas, () => useEditorStore.getState().snapEnabled);

    // ---- Autosave (debounced IndexedDB) ----
    let autosaveTimer: number | null = null;
    const scheduleAutosave = () => {
      if (autosaveTimer) window.clearTimeout(autosaveTimer);
      autosaveTimer = window.setTimeout(() => {
        useEditorStore.getState().autosave();
      }, AUTOSAVE_DEBOUNCE);
    };

    // ---- Restore from IndexedDB BEFORE seeding history ----
    const restore = async () => {
      const lastId = localStorage.getItem('canvawasm.lastProjectId');
      if (lastId) {
        try {
          const { getProjectDb } = await import('../utils/db');
          const proj = await getProjectDb(lastId);
          if (proj && proj.data) {
            useEditorStore.getState().setProjectId(proj.id);
            useEditorStore.getState().setProjectName(proj.name);
            await initCanvas.loadFromJSON(proj.data);
            initCanvas.renderAll();
          }
        } catch (e) {
          console.warn('Restore failed', e);
        }
      }
      useEditorStore.getState().initHistory();
    };
    restore();

    // ---- Keyboard shortcuts ----
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
      const active = initCanvas.getActiveObject();
      if (active && (active as any).isEditing) return;

      const mod = e.ctrlKey || e.metaKey;
      const store = useEditorStore.getState();

      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        store.undo();
      } else if ((mod && e.key.toLowerCase() === 'y') || (mod && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault();
        store.redo();
      } else if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        store.duplicateSelected();
      } else if (mod && e.key.toLowerCase() === 'c') {
        store.copySelected();
      } else if (mod && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        store.paste();
      } else if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        store.selectAll();
      } else if (mod && !e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        store.group();
      } else if (mod && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        store.ungroup();
      } else if (e.key === 'Enter' && store.cropModeActive) {
        // Enter commits the crop (only meaningful in crop mode).
        e.preventDefault();
        store.applyCrop();
      } else if (e.key === 'Escape') {
        // Ordering matters: crop mode > table edit > general selection.
        if (store.cropModeActive) {
          store.cancelCrop();
        } else if (store.tableEditingGroup) {
          store.exitTableEditMode();
        } else {
          store.discardSelection();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!active) return;
        store.deleteSelected();
      } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        if (!active) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
        store.nudge(dx, dy);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // ---- Mouse wheel zoom ----
    initCanvas.on('mouse:wheel', (opt: any) => {
      const e = opt.e as WheelEvent;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
        setZoom((prev) => {
          const next = prev + (e.deltaY > 0 ? -0.1 : 0.1);
          const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next));
          const w = useEditorStore.getState().canvasSize.width;
          const h = useEditorStore.getState().canvasSize.height;
          initCanvas.setZoom(clamped);
          initCanvas.setDimensions({ width: w * clamped, height: h * clamped });
          initCanvas.requestRenderAll();
          return clamped;
        });
      }
    });

    // ---- Table cell / Sticky note text edit (double-click) ----
    initCanvas.on('mouse:dblclick', (opt: any) => {
      const target = opt.target as any;
      if (!target) return;

      // Sticky notes have exactly one Textbox child — always target it.
      if (target.isStickyNote) {
        const textChild = target
          .getObjects()
          .find((o: any) => o?.type === 'textbox') || null;
        useEditorStore.getState().enterTableEditMode(target, textChild);
        return;
      }

      if (!target.isTable) return;

      // Table: pick the specific cell under the cursor.
      // 1) Prefer subTargets provided by Fabric — pick the innermost Textbox.
      const st: any[] = opt.subTargets || [];
      let cell: any = st.find((o: any) => o?.type === 'textbox') || null;

      // 2) Fallback: derive the cell by pointer position + grid geometry.
      // Handles clicks on borders where subTargets can be empty; scale-aware.
      if (!cell) {
        const pointer = initCanvas.getScenePoint(opt.e);
        const tableLeft = target.left ?? 0;
        const tableTop = target.top ?? 0;
        const sx = target.scaleX || 1;
        const sy = target.scaleY || 1;
        const localX = (pointer.x - tableLeft) / sx;
        const localY = (pointer.y - tableTop) / sy;
        const col = Math.floor(localX / target.cellW);
        const row = Math.floor(localY / target.cellH);
        if (col >= 0 && col < target.tableCols && row >= 0 && row < target.tableRows) {
          const idx = (row * target.tableCols + col) * 2 + 1; // Textbox is second per cell
          cell = target.getObjects()[idx] || null;
        }
      }

      useEditorStore.getState().enterTableEditMode(target, cell);
    });

    // ---- Right-click context menu ----
    const canvasEl: HTMLElement | null =
      (initCanvas.upperCanvasEl as HTMLElement) || canvasRef.current;
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const info = initCanvas.findTarget(e);
      const target = info?.target;
      if (target) initCanvas.setActiveObject(target);
      useEditorStore.getState().showContextMenu(e.clientX, e.clientY);
    };
    canvasEl?.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (autosaveTimer) window.clearTimeout(autosaveTimer);
      snapHandle.detach();
      canvasEl?.removeEventListener('contextmenu', handleContextMenu);
      initCanvas.off('selection:created', handleSelection);
      initCanvas.off('selection:updated', handleSelection);
      initCanvas.off('selection:cleared', handleSelection);
      initCanvas.off('object:added', trackChange);
      initCanvas.off('object:modified', trackChange);
      initCanvas.off('object:removed', trackChange);
      initCanvas.off('mouse:wheel');
      initCanvas.dispose();
    };
  }, [setCanvas]);

  const applyZoom = (next: number) => {
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, next));
    setZoom(clamped);
    const canvas = fabricRef.current;
    if (canvas) {
      const w = useEditorStore.getState().canvasSize.width;
      const h = useEditorStore.getState().canvasSize.height;
      canvas.setZoom(clamped);
      canvas.setDimensions({ width: w * clamped, height: h * clamped });
      canvas.requestRenderAll();
    }
  };

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !containerRef.current) return;
    
    // Auto-fit calculation
    const container = containerRef.current;
    const padding = 96; // 48px padding on each side
    const availableWidth = container.clientWidth - padding;
    const availableHeight = container.clientHeight - padding;
    
    const zoomX = availableWidth / canvasSize.width;
    const zoomY = availableHeight / canvasSize.height;
    
    // Cap at 1 (100%) so small canvases don't get blown up, but scale down large ones.
    const optimalZoom = Math.min(zoomX, zoomY, 1);
    
    // Round to 2 decimal places for cleaner display
    const roundedZoom = Math.floor(optimalZoom * 100) / 100;
    const clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, roundedZoom));
    
    canvas.setZoom(clamped);
    canvas.setDimensions({ width: canvasSize.width * clamped, height: canvasSize.height * clamped });
    canvas.requestRenderAll();
    setZoom(clamped);
  }, [canvasSize.width, canvasSize.height]);

  return (
    <div
      ref={containerRef}
      className="workspace-bg scrollable"
      style={{
        flex: 1,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'auto',
        padding: '48px',
        position: 'relative',
      }}
    >
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div
          style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-canvas)',
            background: '#fff',
          }}
        >
          <canvas ref={canvasRef} />
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
          <Rulers
            width={canvasSize.width}
            height={canvasSize.height}
            zoom={zoom}
            showRulers={showRulers}
            showGrid={showGrid}
          />
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: 4,
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <button className="icon-btn" onClick={() => applyZoom(zoom - 0.1)} aria-label="Zoom out">
          <ZoomOut size={16} />
        </button>
        <div
          style={{
            minWidth: 56,
            textAlign: 'center',
            fontSize: 12,
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--text-secondary)',
          }}
        >
          {Math.round(zoom * 100)}%
        </div>
        <button className="icon-btn" onClick={() => applyZoom(zoom + 0.1)} aria-label="Zoom in">
          <ZoomIn size={16} />
        </button>
        <div style={{ width: 1, height: 20, backgroundColor: 'var(--border)', margin: '0 2px' }} />
        <button className="icon-btn" onClick={() => applyZoom(1)} aria-label="Reset zoom">
          <Maximize2 size={16} />
        </button>
      </div>

      <ContextMenu />
    </div>
  );
};

export default Workspace;
