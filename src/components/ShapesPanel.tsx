import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { SHAPE_CATEGORIES, SHAPE_LIB } from '../utils/shapeLibrary';
import type { ShapeCategory } from '../utils/shapeLibrary';

const ShapesPanel: React.FC = () => {
  const addShape = useEditorStore((s) => s.addShape);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const grouped = new Map<ShapeCategory, typeof SHAPE_LIB>();
    for (const s of SHAPE_LIB) {
      const matches =
        !q ||
        s.label.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.keywords.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);
      if (!matches) continue;
      const arr = grouped.get(s.category) || [];
      arr.push(s);
      grouped.set(s.category, arr);
    }
    return SHAPE_CATEGORIES
      .map((c) => ({ ...c, items: grouped.get(c.id) || [] }))
      .filter((c) => c.items.length);
  }, [query]);

  return (
    <div
      className="scrollable"
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      <div className="panel-section" style={{ paddingBottom: 12 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 10px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          <Search size={14} style={{ color: 'var(--text-tertiary)' }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shapes"
            style={{
              background: 'transparent',
              border: 'none',
              flex: 1,
              fontSize: 13,
              color: 'var(--text-primary)',
            }}
          />
        </div>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 20, fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
          No shapes match "{query}".
        </div>
      )}

      {filtered.map((sec) => (
        <div key={sec.id} className="panel-section" style={{ paddingTop: 8 }}>
          <div className="panel-title">{sec.label}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {sec.items.map((s) => (
              <button
                key={s.id}
                className="tool-btn"
                onClick={() => addShape(s.id)}
                title={s.label}
                style={{
                  flexDirection: 'column',
                  gap: 4,
                  height: 72,
                  padding: 6,
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                {s.preview}
                <span style={{ fontSize: 10.5, color: 'var(--text-secondary)', textAlign: 'center' }}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShapesPanel;
