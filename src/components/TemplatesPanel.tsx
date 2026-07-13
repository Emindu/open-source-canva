import React, { useEffect, useState } from 'react';
import * as fabric from 'fabric';
import { useEditorStore } from '../store/useEditorStore';
import { TEMPLATES } from '../utils/templates';
import type { TemplateDef } from '../utils/templates';

/**
 * Real template previews: each template is built once on an offscreen
 * StaticCanvas and rasterized to a data URL. Cached at module scope so
 * re-opening the panel is instant. Renders are queued one at a time —
 * building 18 canvases in parallel janks the UI.
 */
const thumbCache = new Map<string, string>();
let renderQueue: Promise<void> = Promise.resolve();

const renderThumb = (t: TemplateDef): Promise<string> => {
  const cached = thumbCache.get(t.id);
  if (cached) return Promise.resolve(cached);
  const job = renderQueue.then(async () => {
    if (thumbCache.has(t.id)) return;
    try {
      const off = new fabric.StaticCanvas(undefined, { width: t.width, height: t.height });
      off.backgroundColor = t.background;
      await t.build(off as unknown as fabric.Canvas, fabric, () => {});
      off.renderAll();
      // 2x the display size for crisp thumbs on dense screens.
      const scale = Math.min(420 / t.width, 320 / t.height);
      thumbCache.set(t.id, off.toDataURL({ format: 'png', multiplier: scale }));
      off.dispose();
    } catch (e) {
      console.warn('Template thumb render failed', t.id, e);
    }
  });
  renderQueue = job;
  return job.then(() => thumbCache.get(t.id) ?? '');
};

const TemplateThumb: React.FC<{ t: TemplateDef; onClick: () => void }> = ({ t, onClick }) => {
  const [img, setImg] = useState<string>(() => thumbCache.get(t.id) ?? '');
  useEffect(() => {
    if (img) return;
    let alive = true;
    renderThumb(t).then((url) => {
      if (alive && url) setImg(url);
    });
    return () => {
      alive = false;
    };
  }, [t, img]);

  // Preserve aspect ratio: fit inside a 210x160 box using the smaller scale.
  const maxW = 210;
  const maxH = 160;
  const scale = Math.min(maxW / t.width, maxH / t.height);
  const thumbW = Math.round(t.width * scale);
  const thumbH = Math.round(t.height * scale);

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: 0,
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-elevated)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.12s ease, transform 0.06s ease',
      }}
      onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
      onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      {/* Frame provides the fixed 210x160 area; thumb is centered inside it,
          preserving the template's real aspect ratio. */}
      <div
        style={{
          width: '100%',
          height: maxH,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-panel-2)',
          borderBottom: '1px solid var(--border)',
        }}
      >
      <div
        style={{
          width: thumbW,
          height: thumbH,
          // Gradient placeholder until the real render lands.
          background: `linear-gradient(135deg, ${t.preview.from}, ${t.preview.to})`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
        }}
      >
        {img ? (
          <img
            src={img}
            alt={t.name}
            style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              left: '10%',
              top: '40%',
              width: '60%',
              height: 6,
              borderRadius: 3,
              backgroundColor: t.preview.accents?.[0] ?? '#ffffff',
              opacity: 0.9,
            }}
          />
        )}
      </div>
      </div>
      <div style={{ padding: '8px 10px', textAlign: 'left' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
          {t.width} × {t.height}
        </div>
      </div>
    </button>
  );
};

const TemplatesPanel: React.FC = () => {
  const loadTemplate = useEditorStore((s) => s.loadTemplate);

  const groups: Record<string, TemplateDef[]> = {
    Social: TEMPLATES.filter((t) => t.category === 'social'),
    Video: TEMPLATES.filter((t) => t.category === 'video'),
    Print: TEMPLATES.filter((t) => t.category === 'print'),
    Web: TEMPLATES.filter((t) => t.category === 'web'),
  };

  return (
    <>
      {Object.entries(groups).map(([label, items]) =>
        items.length ? (
          <div key={label} className="panel-section">
            <div className="panel-title">{label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((t) => (
                <TemplateThumb key={t.id} t={t} onClick={() => loadTemplate(t.id)} />
              ))}
            </div>
          </div>
        ) : null
      )}
      <div className="panel-section">
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
          Loading a template clears the current canvas. Save first if you need to keep your work.
        </p>
      </div>
    </>
  );
};

export default TemplatesPanel;
