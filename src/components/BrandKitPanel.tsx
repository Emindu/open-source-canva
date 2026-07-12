import React, { useState } from 'react';
import { Plus, Trash2, Upload } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { FONTS } from '../utils/fonts';

const BrandKitPanel: React.FC = () => {
  const brandKit = useEditorStore((s) => s.brandKit);
  const addBrandColor = useEditorStore((s) => s.addBrandColor);
  const removeBrandColor = useEditorStore((s) => s.removeBrandColor);
  const addBrandFont = useEditorStore((s) => s.addBrandFont);
  const removeBrandFont = useEditorStore((s) => s.removeBrandFont);
  const addBrandLogo = useEditorStore((s) => s.addBrandLogo);
  const removeBrandLogo = useEditorStore((s) => s.removeBrandLogo);
  const applyBrandLogo = useEditorStore((s) => s.applyBrandLogo);
  const activeObject = useEditorStore((s) => s.activeObject);
  const updateSelectedProperty = useEditorStore((s) => s.updateSelectedProperty);

  const [newColor, setNewColor] = useState('#7c5cff');
  const [newFont, setNewFont] = useState<string>('Inter');

  const applyColorToSelection = (color: string) => {
    if (activeObject) updateSelectedProperty('fill', color);
  };

  const applyFontToSelection = (family: string) => {
    if (activeObject) updateSelectedProperty('fontFamily', family);
  };

  const handleUploadLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      addBrandLogo(file.name || 'Logo', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Colors */}
      <div className="panel-section">
        <div className="panel-title">Brand colors</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {brandKit.colors.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Save your palette here so it's one click away in every project.
            </div>
          )}
          {brandKit.colors.map((c) => (
            <div key={c} style={{ position: 'relative' }}>
              <button
                onClick={() => applyColorToSelection(c)}
                title={`Apply ${c}${activeObject ? '' : ' (select an object first)'}`}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  backgroundColor: c,
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
              <button
                onClick={() => removeBrandColor(c)}
                title="Remove"
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 16,
                  height: 16,
                  padding: 0,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-panel)',
                  color: 'var(--text-secondary)',
                  fontSize: 11,
                  lineHeight: '14px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="color-swatch" style={{ backgroundColor: newColor }}>
            <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
          </span>
          <input
            className="field-input"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
          />
          <button
            className="pill-btn"
            style={{ padding: '6px 10px' }}
            onClick={() => addBrandColor(newColor)}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Fonts */}
      <div className="panel-section">
        <div className="panel-title">Brand fonts</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
          {brandKit.fonts.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Pin your go-to typefaces here.
            </div>
          )}
          {brandKit.fonts.map((f) => (
            <div
              key={f}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 8px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-elevated)',
              }}
            >
              <span style={{ flex: 1, fontFamily: `"${f}"`, fontSize: 14 }}>{f}</span>
              <button
                className="icon-btn"
                style={{ width: 22, height: 22 }}
                onClick={() => applyFontToSelection(f)}
                title="Apply to selected text"
              >
                <Plus size={12} />
              </button>
              <button
                className="icon-btn"
                style={{ width: 22, height: 22, color: 'var(--danger)' }}
                onClick={() => removeBrandFont(f)}
                title="Remove"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <select
            className="field-select"
            value={newFont}
            onChange={(e) => setNewFont(e.target.value)}
            style={{ flex: 1 }}
          >
            {FONTS.map((f) => (
              <option key={f.family} value={f.family}>
                {f.label}
              </option>
            ))}
          </select>
          <button
            className="pill-btn"
            style={{ padding: '6px 10px' }}
            onClick={() => addBrandFont(newFont)}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Logos */}
      <div className="panel-section">
        <div className="panel-title">Logos</div>
        {brandKit.logos.length === 0 && (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: 10 }}>
            Upload a logo (PNG with transparency works best).
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 10 }}>
          {brandKit.logos.map((logo) => (
            <div
              key={logo.id}
              style={{
                position: 'relative',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#ffffff',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => applyBrandLogo(logo)}
              title={`Add ${logo.name} to canvas`}
            >
              <img
                src={logo.dataUrl}
                alt={logo.name}
                style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeBrandLogo(logo.id);
                }}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 18,
                  height: 18,
                  padding: 0,
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-panel)',
                  color: 'var(--danger)',
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <label
          className="tool-btn"
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Upload size={14} />
          Upload logo
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUploadLogo(f);
              e.target.value = '';
            }}
          />
        </label>
      </div>
    </>
  );
};

export default BrandKitPanel;
