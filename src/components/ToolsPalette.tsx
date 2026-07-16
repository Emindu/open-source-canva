import React, { useEffect, useRef, useState } from 'react';
import {
  MousePointer2,
  Pen,
  Shapes,
  Minus,
  StickyNote,
  PenTool,
  Grid,
  Highlighter,
  Eraser,
  Brush,
  Menu,
  RectangleHorizontal,
  SquareRoundCorner,
  Circle,
  Triangle,
  Slash,
  MoveUpRight,
} from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import SignatureModal from './SignatureModal';

type ActiveTool = 'select' | 'draw' | null;
type Flyout = 'shapes' | 'lines' | 'draw-options' | null;

const ToolsPalette: React.FC = () => {
  const [activeFlyout, setActiveFlyout] = useState<Flyout>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const paletteRef = useRef<HTMLDivElement>(null);

  const drawingMode = useEditorStore((s) => s.drawingMode);
  const drawingColor = useEditorStore((s) => s.drawingColor);
  const drawingWidth = useEditorStore((s) => s.drawingWidth);
  const drawingOpacity = useEditorStore((s) => s.drawingOpacity);
  const brushType = useEditorStore((s) => s.brushType);
  const setDrawingMode = useEditorStore((s) => s.setDrawingMode);
  const setDrawingColor = useEditorStore((s) => s.setDrawingColor);
  const setDrawingWidth = useEditorStore((s) => s.setDrawingWidth);
  const setDrawingOpacity = useEditorStore((s) => s.setDrawingOpacity);
  const setBrushType = useEditorStore((s) => s.setBrushType);
  const [drawSettingsOpen, setDrawSettingsOpen] = useState(true);

  const addRect = useEditorStore((s) => s.addRect);
  const addRoundedRect = useEditorStore((s) => s.addRoundedRect);
  const addCircle = useEditorStore((s) => s.addCircle);
  const addTriangle = useEditorStore((s) => s.addTriangle);
  const addLine = useEditorStore((s) => s.addLine);
  const addArrow = useEditorStore((s) => s.addArrow);
  const addImage = useEditorStore((s) => s.addImage);
  const addTable = useEditorStore((s) => s.addTable);
  const addStickyNote = useEditorStore((s) => s.addStickyNote);

  const activeTool: ActiveTool = drawingMode ? 'draw' : 'select';

  // If the palette closes (Tools toggled off / another tab opened) while the
  // brush is active, exit drawing mode — otherwise the canvas stays stuck in
  // draw mode with no UI left to leave it.
  useEffect(
    () => () => {
      if (useEditorStore.getState().drawingMode) {
        useEditorStore.getState().setDrawingMode(false);
      }
    },
    []
  );

  // Close flyouts on outside click / Esc
  useEffect(() => {
    if (activeFlyout === null) return;
    const onClickOutside = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) {
        setActiveFlyout(null);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveFlyout(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [activeFlyout]);

  const closeFlyoutAnd =
    <A extends any[]>(fn: (...args: A) => any) =>
    (...args: A) => {
      setActiveFlyout(null);
      return fn(...args);
    };

  const enterSelectMode = () => {
    setActiveFlyout(null);
    setDrawingMode(false);
  };

  const toggleDraw = () => {
    if (drawingMode) {
      // Second click on Draw closes options and exits
      setDrawingMode(false);
      setActiveFlyout(null);
    } else {
      setDrawingMode(true);
      setActiveFlyout('draw-options');
    }
  };

  const tools = [
    {
      id: 'select' as const,
      icon: MousePointer2,
      label: 'Select',
      onClick: enterSelectMode,
      active: activeTool === 'select' && activeFlyout === null,
    },
    {
      id: 'draw' as const,
      icon: Pen,
      label: 'Draw',
      onClick: toggleDraw,
      active: activeTool === 'draw',
    },
    {
      id: 'shapes' as const,
      icon: Shapes,
      label: 'Shapes',
      onClick: () => setActiveFlyout(activeFlyout === 'shapes' ? null : 'shapes'),
      active: activeFlyout === 'shapes',
    },
    {
      id: 'lines' as const,
      icon: Minus,
      label: 'Lines',
      onClick: () => setActiveFlyout(activeFlyout === 'lines' ? null : 'lines'),
      active: activeFlyout === 'lines',
    },
    {
      id: 'sticky' as const,
      icon: StickyNote,
      label: 'Sticky note',
      onClick: closeFlyoutAnd(addStickyNote),
      active: false,
    },
    {
      id: 'signature' as const,
      icon: PenTool,
      label: 'Signature',
      onClick: () => {
        setActiveFlyout(null);
        setShowSignatureModal(true);
      },
      active: showSignatureModal,
    },
    {
      id: 'table' as const,
      icon: Grid,
      label: 'Table',
      onClick: closeFlyoutAnd(addTable),
      active: false,
    },
  ];

  const handleSignatureInsert = (dataUrl: string) => {
    addImage(dataUrl);
    setShowSignatureModal(false);
  };

  const pillStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-panel)',
    borderRadius: 32,
    padding: '16px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    boxShadow: 'var(--shadow-canvas)',
    border: '1px solid var(--border)',
  };

  const toolBtn = (opts: { icon: React.ReactNode; label: string; onClick: () => void }) => (
    <button
      onClick={opts.onClick}
      title={opts.label}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        color: 'var(--text-primary)',
        transition: 'background-color 0.1s',
        cursor: 'pointer',
        border: 'none',
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {opts.icon}
    </button>
  );

  return (
    <>
    <div
      ref={paletteRef}
      style={{
        position: 'absolute',
        // The palette has no positioned ancestor, so it anchors to the page:
        // offset below the topbar and stay under its z-index so the palette
        // never covers the File/View menus.
        top: 'calc(var(--topbar-height) + 16px)',
        left: 'calc(var(--rail-width) + 20px)',
        zIndex: 10,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      {/* Main pill */}
      <div style={pillStyle}>
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={t.onClick}
            title={t.label}
            style={{
              position: 'relative',
              width: 44,
              height: 44,
              borderRadius: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: t.active ? 'var(--accent-soft)' : 'transparent',
              color: t.active ? 'var(--accent)' : 'var(--text-primary)',
              transition: 'background-color 0.1s, color 0.1s',
              cursor: 'pointer',
              border: t.active ? '1px solid var(--accent)' : '1px solid transparent',
            }}
            onMouseOver={(e) => {
              if (!t.active) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseOut={(e) => {
              if (!t.active) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <t.icon size={22} strokeWidth={1.5} />
          </button>
        ))}
      </div>

      {/* Flyout: Shapes — lucide icons at the main pill's size/stroke */}
      {activeFlyout === 'shapes' && (
        <div style={pillStyle}>
          {toolBtn({
            icon: <RectangleHorizontal size={22} strokeWidth={1.5} />,
            label: 'Rectangle',
            onClick: closeFlyoutAnd(addRect),
          })}
          {toolBtn({
            icon: <SquareRoundCorner size={22} strokeWidth={1.5} />,
            label: 'Rounded rectangle',
            onClick: closeFlyoutAnd(addRoundedRect),
          })}
          {toolBtn({
            icon: <Circle size={22} strokeWidth={1.5} />,
            label: 'Circle',
            onClick: closeFlyoutAnd(addCircle),
          })}
          {toolBtn({
            icon: <Triangle size={22} strokeWidth={1.5} />,
            label: 'Triangle',
            onClick: closeFlyoutAnd(addTriangle),
          })}
        </div>
      )}

      {/* Flyout: Lines */}
      {activeFlyout === 'lines' && (
        <div style={pillStyle}>
          {toolBtn({
            icon: <Slash size={22} strokeWidth={1.5} />,
            label: 'Line',
            onClick: closeFlyoutAnd(addLine),
          })}
          {toolBtn({
            icon: <MoveUpRight size={22} strokeWidth={1.5} />,
            label: 'Arrow',
            onClick: closeFlyoutAnd(addArrow),
          })}
        </div>
      )}

      {/* Flyout: Draw options (brush types + color + settings) */}
      {activeFlyout === 'draw-options' && drawingMode && (
        <div
          style={{
            ...pillStyle,
            padding: 16,
            gap: 14,
            width: 240,
          }}
        >
          {/* Brush type row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Brush
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
              {([
                { id: 'pen', label: 'Pen', Icon: Pen },
                { id: 'marker', label: 'Marker', Icon: Brush },
                { id: 'highlighter', label: 'Highlighter', Icon: Highlighter },
                { id: 'eraser', label: 'Eraser', Icon: Eraser },
              ] as const).map(({ id, label, Icon }) => {
                const active = brushType === id;
                return (
                  <button
                    key={id}
                    onClick={() => setBrushType(id)}
                    title={label}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                      color: active ? 'var(--accent)' : 'var(--text-primary)',
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                      cursor: 'pointer',
                      transition: 'background-color 0.1s, color 0.1s',
                    }}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color + Settings row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Color
              </span>
              <label
                title="Change color"
                style={{
                  position: 'relative',
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  border: '2px solid var(--border-strong)',
                  backgroundColor: drawingColor,
                  cursor: brushType === 'eraser' ? 'not-allowed' : 'pointer',
                  opacity: brushType === 'eraser' ? 0.4 : 1,
                  display: 'inline-block',
                }}
              >
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(drawingColor) ? drawingColor : '#111827'}
                  onChange={(e) => setDrawingColor(e.target.value)}
                  disabled={brushType === 'eraser'}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: brushType === 'eraser' ? 'not-allowed' : 'pointer',
                    border: 'none',
                    padding: 0,
                    background: 'transparent',
                  }}
                />
              </label>
            </div>
            <button
              onClick={() => setDrawSettingsOpen(!drawSettingsOpen)}
              title="Brush settings"
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: drawSettingsOpen ? 'var(--bg-active)' : 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <Menu size={16} />
            </button>
          </div>

          {/* Settings (Weight + Transparency) */}
          {drawSettingsOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <span>Weight</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{drawingWidth}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  step={1}
                  value={drawingWidth}
                  onChange={(e) => setDrawingWidth(parseInt(e.target.value, 10))}
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-tertiary)' }}>
                  <span>Transparency</span>
                  <span style={{ fontVariantNumeric: 'tabular-nums' }}>{Math.round(drawingOpacity * 100)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(drawingOpacity * 100)}
                  onChange={(e) => setDrawingOpacity(parseInt(e.target.value, 10) / 100)}
                  disabled={brushType === 'eraser'}
                  style={{ accentColor: 'var(--accent)', opacity: brushType === 'eraser' ? 0.4 : 1 }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setDrawingMode(false);
              setActiveFlyout(null);
            }}
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Exit drawing mode
          </button>
        </div>
      )}

    </div>

    {/* Fixed-position modal must live outside the palette's z-index:10
        stacking context, or the topbar (z-index:20) would paint over it. */}
    {showSignatureModal && (
      <SignatureModal onClose={() => setShowSignatureModal(false)} onInsert={handleSignatureInsert} />
    )}
    </>
  );
};

export default ToolsPalette;
