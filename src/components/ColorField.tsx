import React from 'react';
import { Pipette } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { eyedropperSupported, pickWithEyedropper } from '../utils/recentColors';

interface Props {
  value: string;
  onChange: (color: string) => void;
  showRecent?: boolean; // default true
  fallback?: string; // used when value isn't a valid #hex
}

const ColorField: React.FC<Props> = ({ value, onChange, showRecent = true, fallback = '#3b82f6' }) => {
  const recent = useEditorStore((s) => s.recentColors);
  const pushRecentColor = useEditorStore((s) => s.pushRecentColor);
  const supported = eyedropperSupported();

  const safe = /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;

  const apply = (c: string) => {
    if (!c) return;
    onChange(c);
    if (/^#[0-9a-fA-F]{6}$/i.test(c)) pushRecentColor(c);
  };

  const handleEyedropper = async () => {
    const picked = await pickWithEyedropper();
    if (picked) apply(picked);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="color-swatch" style={{ backgroundColor: value || 'transparent' }}>
          <input
            type="color"
            value={safe}
            onChange={(e) => apply(e.target.value)}
          />
        </span>
        <input
          className="field-input"
          value={value}
          onChange={(e) => apply(e.target.value)}
          style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
        />
        {supported && (
          <button
            className="icon-btn"
            style={{ width: 32, height: 32, flexShrink: 0 }}
            onClick={handleEyedropper}
            title="Pick color from screen (EyeDropper)"
          >
            <Pipette size={14} />
          </button>
        )}
      </div>
      {showRecent && recent.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {recent.slice(0, 8).map((c) => (
            <button
              key={c}
              onClick={() => apply(c)}
              title={c}
              style={{
                width: 18,
                height: 18,
                borderRadius: 3,
                border: '1px solid var(--border)',
                backgroundColor: c,
                padding: 0,
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorField;
