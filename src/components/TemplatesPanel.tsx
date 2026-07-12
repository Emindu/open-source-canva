import React from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { TEMPLATES } from '../utils/templates';
import type { TemplateDef } from '../utils/templates';

const TemplateThumb: React.FC<{ t: TemplateDef; onClick: () => void }> = ({ t, onClick }) => {
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
          background: `linear-gradient(135deg, ${t.preview.from}, ${t.preview.to})`,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
        }}
      >
        {/* Simplified visual: two thin bars representing text */}
        <div
          style={{
            position: 'absolute',
            left: '10%',
            top: '30%',
            width: '60%',
            height: 6,
            borderRadius: 3,
            backgroundColor: t.preview.accents?.[0] ?? '#ffffff',
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '10%',
            top: '45%',
            width: '75%',
            height: 4,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '10%',
            top: '55%',
            width: '40%',
            height: 4,
            borderRadius: 2,
            backgroundColor: '#ffffff',
            opacity: 0.4,
          }}
        />
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
