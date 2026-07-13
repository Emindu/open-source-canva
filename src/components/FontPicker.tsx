import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { FONTS, FONT_CATEGORIES } from '../utils/fonts';

/**
 * Searchable font selector with live previews. Each row renders in its own
 * font family, so the browser lazily fetches the face the first time it
 * scrolls into view (all families are declared in index.html with
 * display=swap). The actual canvas-side loading is awaited separately by
 * updateSelectedProperty via ensureFontLoaded.
 */
const FontPicker: React.FC<{
  value: string;
  onChange: (family: string) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation(); // don't let the canvas Escape handler fire
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey, true);
    searchRef.current?.focus();
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FONT_CATEGORIES.map((cat) => ({
      ...cat,
      fonts: FONTS.filter(
        (f) => f.category === cat.id && (!q || f.label.toLowerCase().includes(q))
      ),
    })).filter((g) => g.fonts.length > 0);
  }, [query]);

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        className="field-select"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          cursor: 'pointer',
          fontFamily: `"${value}"`,
          fontSize: 14,
          textAlign: 'left',
        }}
        title="Change font"
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
        <ChevronDown size={14} style={{ flexShrink: 0, opacity: 0.6 }} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 50,
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: 8, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Search size={13} style={{ flexShrink: 0, color: 'var(--text-tertiary)' }} />
            <input
              ref={searchRef}
              className="field-input"
              placeholder="Search fonts…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: '4px 0', fontSize: 12, flex: 1 }}
            />
          </div>
          <div className="scrollable" style={{ maxHeight: 320, overflowY: 'auto' }}>
            {groups.length === 0 && (
              <div style={{ padding: 12, fontSize: 12, color: 'var(--text-tertiary)' }}>No fonts match “{query}”.</div>
            )}
            {groups.map((g) => (
              <div key={g.id}>
                <div
                  style={{
                    padding: '8px 10px 4px',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 0.6,
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {g.label}
                </div>
                {g.fonts.map((f) => (
                  <button
                    key={f.family}
                    onClick={() => {
                      onChange(f.family);
                      setOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      width: '100%',
                      padding: '7px 10px',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      backgroundColor: f.family === value ? 'var(--accent-soft)' : 'transparent',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => {
                      if (f.family !== value) e.currentTarget.style.backgroundColor = 'var(--bg-panel)';
                    }}
                    onMouseLeave={(e) => {
                      if (f.family !== value) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span
                      style={{
                        fontFamily: `"${f.family}"`,
                        fontSize: 16,
                        lineHeight: 1.3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {f.sample ?? f.label}
                    </span>
                    {f.sample && (
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', flexShrink: 0 }}>{f.label}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FontPicker;
