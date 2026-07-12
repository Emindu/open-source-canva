import * as fabric from 'fabric';

const SNAP_THRESHOLD = 6;
const GUIDE_COLOR = '#ff0080';

interface Guide {
  axis: 'x' | 'y';
  position: number;
}

/**
 * Snap a moving object to canvas edges/center and to other objects' edges/center.
 * Returns the active guide lines that should be drawn.
 */
const snapAndComputeGuides = (canvas: fabric.Canvas, moving: fabric.Object): Guide[] => {
  const cw = canvas.getWidth() / (canvas.getZoom() || 1);
  const ch = canvas.getHeight() / (canvas.getZoom() || 1);

  const w = moving.getScaledWidth();
  const h = moving.getScaledHeight();
  let left = moving.left ?? 0;
  let top = moving.top ?? 0;

  // Moving object's snap points
  const mX = { left, center: left + w / 2, right: left + w };
  const mY = { top, center: top + h / 2, bottom: top + h };

  // Candidate X targets (from other objects + canvas)
  const xTargets: number[] = [0, cw / 2, cw];
  const yTargets: number[] = [0, ch / 2, ch];
  canvas.getObjects().forEach((o) => {
    if (o === moving) return;
    const ol = o.left ?? 0;
    const ot = o.top ?? 0;
    const ow = o.getScaledWidth();
    const oh = o.getScaledHeight();
    xTargets.push(ol, ol + ow / 2, ol + ow);
    yTargets.push(ot, ot + oh / 2, ot + oh);
  });

  const guides: Guide[] = [];

  // Find best X snap
  let bestX: { delta: number; target: number } | null = null;
  for (const t of xTargets) {
    for (const p of [mX.left, mX.center, mX.right]) {
      const d = t - p;
      if (Math.abs(d) < SNAP_THRESHOLD && (!bestX || Math.abs(d) < Math.abs(bestX.delta))) {
        bestX = { delta: d, target: t };
      }
    }
  }
  if (bestX) {
    left += bestX.delta;
    moving.set({ left });
    guides.push({ axis: 'x', position: bestX.target });
  }

  // Find best Y snap
  let bestY: { delta: number; target: number } | null = null;
  for (const t of yTargets) {
    for (const p of [mY.top, mY.center, mY.bottom]) {
      const d = t - p;
      if (Math.abs(d) < SNAP_THRESHOLD && (!bestY || Math.abs(d) < Math.abs(bestY.delta))) {
        bestY = { delta: d, target: t };
      }
    }
  }
  if (bestY) {
    top += bestY.delta;
    moving.set({ top });
    guides.push({ axis: 'y', position: bestY.target });
  }

  return guides;
};

const drawGuides = (canvas: fabric.Canvas, guides: Guide[]) => {
  const ctx = canvas.contextTop;
  if (!ctx) return;
  const zoom = canvas.getZoom() || 1;
  const w = canvas.getWidth();
  const h = canvas.getHeight();
  canvas.clearContext(ctx);
  ctx.save();
  ctx.strokeStyle = GUIDE_COLOR;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  guides.forEach((g) => {
    ctx.beginPath();
    if (g.axis === 'x') {
      const x = g.position * zoom;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    } else {
      const y = g.position * zoom;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    ctx.stroke();
  });
  ctx.restore();
};

export interface SnappingHandle {
  detach: () => void;
}

/**
 * Attach snapping + guide rendering to a Fabric canvas.
 * Returns a handle whose detach() removes all listeners.
 */
export const attachSnapping = (
  canvas: fabric.Canvas,
  isEnabled: () => boolean
): SnappingHandle => {
  const onMoving = (e: any) => {
    if (!isEnabled()) return;
    const t = e.target as fabric.Object;
    if (!t) return;
    const guides = snapAndComputeGuides(canvas, t);
    drawGuides(canvas, guides);
  };

  const clear = () => {
    const ctx = canvas.contextTop;
    if (ctx) canvas.clearContext(ctx);
  };

  canvas.on('object:moving', onMoving);
  canvas.on('mouse:up', clear);
  canvas.on('object:modified', clear);
  canvas.on('selection:cleared', clear);

  return {
    detach: () => {
      canvas.off('object:moving', onMoving);
      canvas.off('mouse:up', clear);
      canvas.off('object:modified', clear);
      canvas.off('selection:cleared', clear);
    },
  };
};
