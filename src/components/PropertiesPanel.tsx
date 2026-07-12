import React from 'react';
import * as fabric from 'fabric';
import {
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  MousePointerClick,
  Copy,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  FlipHorizontal,
  FlipVertical,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  ChevronsUp,
  ChevronsDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  X,
  Group as GroupIcon,
  Ungroup,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
  Superscript,
  Subscript,
  Spline,
  Crop,
  Scissors,
  Loader2,
  RotateCw,
} from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import type { AlignDir } from '../store/useEditorStore';
import { Grid, Plus } from 'lucide-react';
import { applyWasmFilter } from '../utils/wasmFilters';
import FontPicker from './FontPicker';
import {
  BLEND_MODES,
  GRADIENT_PRESETS,
  PATTERNS,
  createLinearGradient,
  createRadialGradient,
  createSvgPattern,
  getFillMode,
  readFillColors,
} from '../utils/fills';
import type { FillMode } from '../utils/fills';
import { FILTER_PRESETS, readFilterState } from '../utils/imageFilters';
import ColorField from './ColorField';

const toTitleCase = (s: string) =>
  s.replace(/\S+/g, (w) => w.charAt(0).toLocaleUpperCase() + w.slice(1).toLocaleLowerCase());

const SHADOW_PRESETS: { label: string; value: null | { color: string; blur: number; offsetX: number; offsetY: number } }[] = [
  { label: 'None', value: null },
  { label: 'Soft', value: { color: 'rgba(0,0,0,0.35)', blur: 12, offsetX: 2, offsetY: 4 } },
  { label: 'Hard', value: { color: 'rgba(0,0,0,0.55)', blur: 0, offsetX: 4, offsetY: 4 } },
  { label: 'Glow', value: { color: 'rgba(124,92,255,0.55)', blur: 20, offsetX: 0, offsetY: 0 } },
];

const CANVAS_PRESETS: { label: string; w: number; h: number }[] = [
  { label: 'Instagram Post', w: 1080, h: 1080 },
  { label: 'Instagram Story', w: 1080, h: 1920 },
  { label: 'Facebook Cover', w: 820, h: 312 },
  { label: 'Twitter Post', w: 1200, h: 675 },
  { label: 'YouTube Thumbnail', w: 1280, h: 720 },
  { label: 'A4 Portrait', w: 794, h: 1123 },
  { label: 'A4 Landscape', w: 1123, h: 794 },
  { label: 'HD 1080p', w: 1920, h: 1080 },
  { label: 'Default', w: 900, h: 600 },
];

const Row: React.FC<{ children: React.ReactNode; gap?: number }> = ({ children, gap = 8 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap }}>{children}</div>
);

const NumberField: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}> = ({ label, value, onChange, step = 1, min }) => (
  <div className="field" style={{ flex: 1 }}>
    <label className="field-label">{label}</label>
    <input
      type="number"
      className="field-input"
      value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
      step={step}
      min={min}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
    />
  </div>
);

const IconToggle: React.FC<{
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}> = ({ active, onClick, children, label }) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 34,
      height: 32,
      borderRadius: 'var(--radius-sm)',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-elevated)',
      color: active ? 'white' : 'var(--text-secondary)',
      transition: 'background-color 0.12s ease, color 0.12s ease',
    }}
  >
    {children}
  </button>
);

const CanvasEmptyState: React.FC = () => {
  const { bgColor, canvasSize, setBgColor, resizeCanvas } = useEditorStore();
  return (
    <>
      <div className="panel-section">
        <div className="panel-title">Canvas</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="field-label">Background</label>
            <Row>
              <span className="color-swatch" style={{ backgroundColor: bgColor }}>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              </span>
              <input
                className="field-input"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
              />
            </Row>
          </div>
          <div className="field">
            <label className="field-label">Preset size</label>
            <select
              className="field-select"
              value={`${canvasSize.width}x${canvasSize.height}`}
              onChange={(e) => {
                const found = CANVAS_PRESETS.find((p) => `${p.w}x${p.h}` === e.target.value);
                if (found) resizeCanvas(found.w, found.h);
              }}
            >
              <option value="custom" disabled>
                Custom
              </option>
              {CANVAS_PRESETS.map((p) => (
                <option key={p.label} value={`${p.w}x${p.h}`}>
                  {p.label} · {p.w}×{p.h}
                </option>
              ))}
            </select>
          </div>
          <Row>
            <NumberField
              label="Width"
              value={canvasSize.width}
              onChange={(v) => resizeCanvas(Math.max(50, v), canvasSize.height)}
              min={50}
            />
            <NumberField
              label="Height"
              value={canvasSize.height}
              onChange={(v) => resizeCanvas(canvasSize.width, Math.max(50, v))}
              min={50}
            />
          </Row>
        </div>
      </div>
      <div className="panel-section">
        <div className="panel-title">Tip</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontSize: 12,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}
        >
          <MousePointerClick size={16} style={{ marginTop: 2, color: 'var(--text-tertiary)' }} />
          Click an object to edit its properties. Try shortcuts like <b>Ctrl+D</b> to duplicate,
          <b> Ctrl+Z</b> to undo, and <b>Arrow</b> keys to nudge.
        </div>
      </div>
    </>
  );
};

/**
 * FillPicker — tabbed selector for solid, linear gradient, radial gradient, and pattern fills.
 * Applies changes via the passed setter (which routes through updateSelectedProperty).
 */
const FillPicker: React.FC<{
  fill: any;
  onChange: (fill: any) => void;
}> = ({ fill, onChange }) => {
  const currentMode = getFillMode(fill);
  const { from, to } = readFillColors(fill);
  const [mode, setMode] = React.useState<FillMode>(currentMode);
  const [colorA, setColorA] = React.useState(from);
  const [colorB, setColorB] = React.useState(to);
  const [angle, setAngle] = React.useState<number>(
    fill?.type === 'linear' && fill?.coords
      ? Math.round(
          (Math.atan2(fill.coords.y2 - fill.coords.y1, fill.coords.x2 - fill.coords.x1) * 180) /
            Math.PI
        )
      : 0
  );

  React.useEffect(() => {
    setMode(getFillMode(fill));
    const c = readFillColors(fill);
    setColorA(c.from);
    setColorB(c.to);
  }, [fill]);

  const applyMode = (nextMode: FillMode, a = colorA, b = colorB, ang = angle) => {
    setMode(nextMode);
    if (nextMode === 'solid') {
      onChange(a);
    } else if (nextMode === 'linear') {
      onChange(createLinearGradient(a, b, ang));
    } else if (nextMode === 'radial') {
      onChange(createRadialGradient(a, b));
    }
    // 'pattern' handled separately by pattern buttons
  };

  const solidHex = /^#[0-9a-fA-F]{6}$/.test(colorA) ? colorA : '#7c5cff';
  const bHex = /^#[0-9a-fA-F]{6}$/.test(colorB) ? colorB : '#4f46e5';

  const modes: { id: FillMode; label: string }[] = [
    { id: 'solid', label: 'Solid' },
    { id: 'linear', label: 'Linear' },
    { id: 'radial', label: 'Radial' },
    { id: 'pattern', label: 'Pattern' },
  ];

  return (
    <div className="field">
      <label className="field-label">Fill</label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, marginBottom: 8 }}>
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => applyMode(m.id)}
            style={{
              padding: '6px 4px',
              fontSize: 11,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: mode === m.id ? 'var(--accent-soft)' : 'var(--bg-elevated)',
              border: `1px solid ${mode === m.id ? 'var(--accent)' : 'var(--border)'}`,
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'solid' && (
        <ColorField
          value={colorA}
          onChange={(c) => {
            setColorA(c);
            onChange(c);
          }}
        />
      )}

      {(mode === 'linear' || mode === 'radial') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="color-swatch" style={{ backgroundColor: colorA }}>
              <input
                type="color"
                value={solidHex}
                onChange={(e) => {
                  const v = e.target.value;
                  setColorA(v);
                  applyMode(mode, v, colorB, angle);
                }}
              />
            </span>
            <span className="color-swatch" style={{ backgroundColor: colorB }}>
              <input
                type="color"
                value={bHex}
                onChange={(e) => {
                  const v = e.target.value;
                  setColorB(v);
                  applyMode(mode, colorA, v, angle);
                }}
              />
            </span>
            <div style={{ flex: 1, height: 32, borderRadius: 6, background: `linear-gradient(${mode === 'linear' ? `${angle}deg` : '135deg'}, ${colorA}, ${colorB})`, border: '1px solid var(--border)' }} />
          </div>
          {mode === 'linear' && (
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="field-label">Angle</label>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                  {angle}°
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={angle}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  setAngle(v);
                  applyMode('linear', colorA, colorB, v);
                }}
                style={{ accentColor: 'var(--accent)', width: '100%' }}
              />
            </div>
          )}
          <div>
            <div className="field-label" style={{ marginBottom: 6 }}>Presets</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {GRADIENT_PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setColorA(p.from);
                    setColorB(p.to);
                    applyMode(mode, p.from, p.to, angle);
                  }}
                  title={p.name}
                  style={{
                    height: 28,
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: `linear-gradient(135deg, ${p.from}, ${p.to})`,
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === 'pattern' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span className="color-swatch" style={{ backgroundColor: colorA }}>
              <input
                type="color"
                value={solidHex}
                onChange={(e) => setColorA(e.target.value)}
                title="Pattern color"
              />
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Pattern color</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {PATTERNS.map((p) => (
              <button
                key={p.name}
                onClick={async () => {
                  const pat = await createSvgPattern(p.svg(colorA));
                  if (pat) onChange(pat);
                }}
                title={p.name}
                style={{
                  height: 56,
                  padding: 0,
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                  background: `url("data:image/svg+xml;utf8,${encodeURIComponent(p.svg(colorA))}") repeat`,
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PropertiesPanel: React.FC = () => {
  const {
    activeObject,
    canvas,
    updateSelectedProperty,
    deleteSelected,
    duplicateSelected,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    align,
    flip,
    group,
    ungroup,
    distribute,
    applyCurve,
    applyTextEffect,
    setTextShadow,
    toggleSuperscript,
    toggleSubscript,
    setImageFilter,
    applyImagePreset,
    resetImageFilters,
    startCropMode,
    applyCrop,
    cancelCrop,
    resetCrop,
    removeBackground,
    cropModeActive,
    bgRemovalBusy,
    setObjectComment,
    addTableRow,
    addTableColumn,
    removeTableRow,
    removeTableColumn,
    tableEditingGroup,
    exitTableEditMode,
  } = useEditorStore();

  // Crop mode is modal, and the active object is the crop rectangle (not the
  // image) — render only the crop controls so nothing else can edit the
  // temporary crop state.
  if (cropModeActive) {
    return (
      <aside
        className="scrollable"
        style={{
          width: 'var(--props-panel-width)',
          height: '100%',
          backgroundColor: 'var(--bg-panel)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        <div className="panel-section">
          <div className="panel-title">Crop image</div>
          <div style={{
            padding: 10,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--accent-soft)',
            border: '1px solid var(--accent)',
            fontSize: 12,
            color: 'var(--text-primary)',
            marginBottom: 10,
            lineHeight: 1.5,
          }}>
            <b>Drag the crop rectangle</b> to change what's kept.
            <br />
            <b>Drag the image</b> to reposition it under the crop.
            <br />
            <span style={{ color: 'var(--text-tertiary)' }}>Press <b>Enter</b> to apply, <b>Escape</b> to cancel.</span>
          </div>
          <Row>
            <button className="primary-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={applyCrop}>
              Apply
            </button>
            <button className="pill-btn" style={{ flex: 1, justifyContent: 'center' }} onClick={cancelCrop}>
              Cancel
            </button>
          </Row>
        </div>
      </aside>
    );
  }

  if (!activeObject) {
    return (
      <aside
        className="scrollable"
        style={{
          width: 'var(--props-panel-width)',
          height: '100%',
          backgroundColor: 'var(--bg-panel)',
          borderLeft: '1px solid var(--border)',
        }}
      >
        <CanvasEmptyState />
      </aside>
    );
  }

  const type = activeObject.type;
  const isText = type === 'text' || type === 'i-text' || type === 'textbox';
  const isLine = type === 'line';
  const isShape =
    type === 'rect' ||
    type === 'circle' ||
    type === 'ellipse' ||
    type === 'polygon' ||
    type === 'path' ||
    type === 'triangle' ||
    isLine;
  const isImage = type === 'image';
  const isSelection = activeObject instanceof fabric.ActiveSelection;
  const isGroup = activeObject instanceof fabric.Group && !isSelection;
  const isTable = !!(activeObject as any)?.isTable;
  // Also show the Table controls when the user is inside cell-edit mode; the
  // active object is then the cell (Textbox), not the table itself.
  const tableInScope: any = isTable ? (activeObject as any) : tableEditingGroup;
  const showTableControls = !!tableInScope;
  const hasFill = isText || (isShape && !isLine);

  const o = activeObject as any;
  const stroke = typeof o.stroke === 'string' ? o.stroke : '#000000';
  const strokeWidth = o.strokeWidth ?? 0;
  const opacity = o.opacity ?? 1;

  const alignBtn = (dir: AlignDir, Icon: React.ComponentType<{ size?: number }>, label: string) => (
    <IconToggle onClick={() => align(dir)} label={label}>
      <Icon size={16} />
    </IconToggle>
  );

  return (
    <aside
      className="scrollable"
      style={{
        width: 'var(--props-panel-width)',
        height: '100%',
        backgroundColor: 'var(--bg-panel)',
        borderLeft: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div className="panel-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="panel-title" style={{ marginBottom: 0 }}>
            {isText ? 'Text' : isImage ? 'Image' : isSelection ? 'Selection' : isGroup ? 'Group' : isShape ? 'Shape' : 'Object'}
          </div>
          <Row gap={2}>
            <button className="icon-btn" onClick={duplicateSelected} title="Duplicate (Ctrl+D)">
              <Copy size={15} />
            </button>
            <button className="icon-btn" onClick={bringForward} title="Bring forward">
              <ArrowUp size={15} />
            </button>
            <button className="icon-btn" onClick={sendBackward} title="Send backward">
              <ArrowDown size={15} />
            </button>
            <button className="icon-btn" onClick={bringToFront} title="Bring to front">
              <ChevronsUp size={15} />
            </button>
            <button className="icon-btn" onClick={sendToBack} title="Send to back">
              <ChevronsDown size={15} />
            </button>
          </Row>
        </div>

        {/* Alignment 3x2 grid */}
        <div className="field">
          <label className="field-label">Align to canvas</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4 }}>
            {alignBtn('left', AlignHorizontalJustifyStart, 'Align left')}
            {alignBtn('center-h', AlignHorizontalJustifyCenter, 'Center horizontally')}
            {alignBtn('right', AlignHorizontalJustifyEnd, 'Align right')}
            {alignBtn('top', AlignVerticalJustifyStart, 'Align top')}
            {alignBtn('center-v', AlignVerticalJustifyCenter, 'Center vertically')}
            {alignBtn('bottom', AlignVerticalJustifyEnd, 'Align bottom')}
          </div>
        </div>

        {/* Arrange (Group / Ungroup / Distribute) */}
        {(isSelection || isGroup) && (
          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label">Arrange</label>
            <Row gap={4}>
              {isSelection && (
                <IconToggle onClick={group} label="Group (Ctrl+G)">
                  <GroupIcon size={15} />
                </IconToggle>
              )}
              {isGroup && (
                <IconToggle onClick={ungroup} label="Ungroup (Ctrl+Shift+G)">
                  <Ungroup size={15} />
                </IconToggle>
              )}
              {isSelection && (activeObject as fabric.ActiveSelection).getObjects().length >= 3 && (
                <>
                  <IconToggle
                    onClick={() => distribute('h')}
                    label="Distribute horizontally"
                  >
                    <AlignHorizontalSpaceAround size={15} />
                  </IconToggle>
                  <IconToggle
                    onClick={() => distribute('v')}
                    label="Distribute vertically"
                  >
                    <AlignVerticalSpaceAround size={15} />
                  </IconToggle>
                </>
              )}
            </Row>
          </div>
        )}
        
        {/* Table Properties */}
        {(o as any).isTable && (
          <div className="field" style={{ marginTop: 12 }}>
            <label className="field-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Grid size={12} /> Table
              </span>
            </label>
            <Row gap={8}>
              <button
                className="secondary-btn"
                onClick={() => useEditorStore.getState().addTableRow()}
                style={{ flex: 1, justifyContent: 'center' }}
                title="Add Row"
              >
                <Plus size={14} /> Row
              </button>
              <button
                className="secondary-btn"
                onClick={() => useEditorStore.getState().addTableColumn()}
                style={{ flex: 1, justifyContent: 'center' }}
                title="Add Column"
              >
                <Plus size={14} /> Col
              </button>
            </Row>
          </div>
        )}
      </div>

      {/* Position & Size */}
      <div className="panel-section">
        <div className="panel-title">Position &amp; Size</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row>
            <NumberField label="X" value={o.left ?? 0} onChange={(v) => updateSelectedProperty('left', v)} />
            <NumberField label="Y" value={o.top ?? 0} onChange={(v) => updateSelectedProperty('top', v)} />
          </Row>
          <Row>
            <NumberField
              label="W"
              value={activeObject.getScaledWidth()}
              onChange={(v) => {
                const base = (o.width ?? 1) || 1;
                updateSelectedProperty('scaleX', Math.max(0.01, v / base));
              }}
              min={1}
            />
            <NumberField
              label="H"
              value={activeObject.getScaledHeight()}
              onChange={(v) => {
                const base = (o.height ?? 1) || 1;
                updateSelectedProperty('scaleY', Math.max(0.01, v / base));
              }}
              min={1}
            />
          </Row>
          <Row>
            <NumberField
              label="Rotation"
              value={o.angle ?? 0}
              onChange={(v) => updateSelectedProperty('angle', v)}
              step={1}
            />
            <div style={{ flex: 1, display: 'flex', gap: 4, alignItems: 'flex-end' }}>
              <IconToggle active={!!o.flipX} onClick={() => flip('h')} label="Flip horizontal">
                <FlipHorizontal size={15} />
              </IconToggle>
              <IconToggle active={!!o.flipY} onClick={() => flip('v')} label="Flip vertical">
                <FlipVertical size={15} />
              </IconToggle>
            </div>
          </Row>
        </div>
      </div>

      {/* Table controls */}
      {showTableControls && (
        <div className="panel-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="panel-title" style={{ marginBottom: 0 }}>Table</div>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
              {tableInScope.tableRows ?? '?'} × {tableInScope.tableCols ?? '?'}
            </span>
          </div>

          {/* Edit-mode banner */}
          {tableEditingGroup && (
            <div
              style={{
                padding: 10,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--accent-soft)',
                border: '1px solid var(--accent)',
                fontSize: 12,
                color: 'var(--text-primary)',
                marginBottom: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <span>
                <b>Editing cells.</b> Click any cell to edit its text. Press <b>Escape</b> to exit
                and move the table as a whole.
              </span>
              <button
                className="pill-btn"
                onClick={exitTableEditMode}
                style={{ justifyContent: 'center', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
              >
                Exit cell edit mode
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              <button
                className="tool-btn"
                onClick={addTableRow}
                style={{ justifyContent: 'center', fontSize: 12, padding: '8px 4px' }}
              >
                <Plus size={13} />
                Row
              </button>
              <button
                className="tool-btn"
                onClick={addTableColumn}
                style={{ justifyContent: 'center', fontSize: 12, padding: '8px 4px' }}
              >
                <Plus size={13} />
                Column
              </button>
              <button
                className="tool-btn"
                onClick={removeTableRow}
                disabled={(tableInScope.tableRows ?? 0) <= 1}
                style={{
                  justifyContent: 'center', fontSize: 12, padding: '8px 4px',
                  opacity: (tableInScope.tableRows ?? 0) <= 1 ? 0.4 : 1,
                  cursor: (tableInScope.tableRows ?? 0) <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <X size={13} />
                Row
              </button>
              <button
                className="tool-btn"
                onClick={removeTableColumn}
                disabled={(tableInScope.tableCols ?? 0) <= 1}
                style={{
                  justifyContent: 'center', fontSize: 12, padding: '8px 4px',
                  opacity: (tableInScope.tableCols ?? 0) <= 1 ? 0.4 : 1,
                  cursor: (tableInScope.tableCols ?? 0) <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <X size={13} />
                Column
              </button>
            </div>
            {!tableEditingGroup && (
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5, marginTop: 4 }}>
                The table drags as a single unit. <b>Double-click</b> any cell to edit its text.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Fill / Opacity / Blend */}
      <div className="panel-section">
        <div className="panel-title">Appearance</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {hasFill && (
            <FillPicker
              fill={o.fill}
              onChange={(next) => updateSelectedProperty('fill', next)}
            />
          )}
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="field-label">Opacity</label>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opacity}
              onChange={(e) => updateSelectedProperty('opacity', parseFloat(e.target.value))}
              style={{ accentColor: 'var(--accent)', width: '100%' }}
            />
          </div>
          <div className="field">
            <label className="field-label">Blend mode</label>
            <select
              className="field-select"
              value={o.globalCompositeOperation || 'source-over'}
              onChange={(e) => updateSelectedProperty('globalCompositeOperation', e.target.value)}
            >
              {BLEND_MODES.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stroke (shapes) */}
      {(isShape || isText) && (
        <div className="panel-section">
          <div className="panel-title">Stroke</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="field">
              <label className="field-label">Color</label>
              <ColorField
                value={stroke}
                fallback="#000000"
                onChange={(c) => updateSelectedProperty('stroke', c)}
              />
            </div>
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="field-label">Width</label>
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                  {strokeWidth}px
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={1}
                value={strokeWidth}
                onChange={(e) => updateSelectedProperty('strokeWidth', parseInt(e.target.value, 10))}
                style={{ accentColor: 'var(--accent)', width: '100%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Text-specific */}
      {isText && (
        <div className="panel-section">
          <div className="panel-title">Typography</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label className="field-label">Font</label>
              <FontPicker
                value={o.fontFamily || 'Inter'}
                onChange={(family) => updateSelectedProperty('fontFamily', family)}
              />
            </div>
            <Row>
              <NumberField
                label="Size"
                value={o.fontSize ?? 32}
                onChange={(v) => updateSelectedProperty('fontSize', Math.max(4, v))}
                min={4}
              />
              <div className="field" style={{ flex: 1 }}>
                <label className="field-label">Weight</label>
                <select
                  className="field-select"
                  value={String(o.fontWeight ?? '400')}
                  onChange={(e) => updateSelectedProperty('fontWeight', e.target.value)}
                >
                  <option value="300">Light</option>
                  <option value="400">Regular</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                </select>
              </div>
            </Row>
            <div className="field">
              <label className="field-label">Style</label>
              <Row gap={4}>
                <IconToggle
                  active={o.fontWeight === 'bold' || Number(o.fontWeight) >= 700}
                  onClick={() => {
                    const bold = o.fontWeight === 'bold' || Number(o.fontWeight) >= 700;
                    updateSelectedProperty('fontWeight', bold ? '400' : '700');
                  }}
                  label="Bold"
                >
                  <Bold size={15} />
                </IconToggle>
                <IconToggle
                  active={o.fontStyle === 'italic'}
                  onClick={() =>
                    updateSelectedProperty('fontStyle', o.fontStyle === 'italic' ? 'normal' : 'italic')
                  }
                  label="Italic"
                >
                  <Italic size={15} />
                </IconToggle>
                <IconToggle
                  active={!!o.underline}
                  onClick={() => updateSelectedProperty('underline', !o.underline)}
                  label="Underline"
                >
                  <Underline size={15} />
                </IconToggle>
                <IconToggle
                  active={!!o.linethrough}
                  onClick={() => updateSelectedProperty('linethrough', !o.linethrough)}
                  label="Strikethrough"
                >
                  <Strikethrough size={15} />
                </IconToggle>
                <IconToggle
                  active={!!o.overline}
                  onClick={() => updateSelectedProperty('overline', !o.overline)}
                  label="Overline"
                >
                  <span style={{ fontSize: 12, fontWeight: 700, textDecoration: 'overline' }}>O</span>
                </IconToggle>
                <IconToggle
                  onClick={toggleSuperscript}
                  label="Superscript"
                >
                  <Superscript size={15} />
                </IconToggle>
                <IconToggle
                  onClick={toggleSubscript}
                  label="Subscript"
                >
                  <Subscript size={15} />
                </IconToggle>
              </Row>
            </div>

            <div className="field">
              <label className="field-label">Align</label>
              <Row gap={4}>
                {([
                  { v: 'left', I: AlignLeft, l: 'Align left' },
                  { v: 'center', I: AlignCenter, l: 'Center' },
                  { v: 'right', I: AlignRight, l: 'Align right' },
                  { v: 'justify', I: AlignJustify, l: 'Justify' },
                ] as const).map(({ v, I, l }) => (
                  <IconToggle
                    key={v}
                    active={o.textAlign === v}
                    onClick={() => updateSelectedProperty('textAlign', v)}
                    label={l}
                  >
                    <I size={15} />
                  </IconToggle>
                ))}
              </Row>
            </div>

            <div className="field">
              <label className="field-label">Case</label>
              <Row gap={4}>
                <button
                  className="tool-btn"
                  onClick={() =>
                    updateSelectedProperty('text', String(o.text ?? '').toLocaleUpperCase())
                  }
                  style={{ justifyContent: 'center', fontSize: 12, padding: '8px 6px' }}
                  title="UPPERCASE"
                >
                  AA
                </button>
                <button
                  className="tool-btn"
                  onClick={() =>
                    updateSelectedProperty('text', String(o.text ?? '').toLocaleLowerCase())
                  }
                  style={{ justifyContent: 'center', fontSize: 12, padding: '8px 6px' }}
                  title="lowercase"
                >
                  aa
                </button>
                <button
                  className="tool-btn"
                  onClick={() => updateSelectedProperty('text', toTitleCase(String(o.text ?? '')))}
                  style={{ justifyContent: 'center', fontSize: 12, padding: '8px 6px' }}
                  title="Title Case"
                >
                  Aa
                </button>
                <button
                  className="tool-btn"
                  onClick={() => {
                    const t = String(o.text ?? '');
                    updateSelectedProperty(
                      'text',
                      t.charAt(0).toLocaleUpperCase() + t.slice(1).toLocaleLowerCase()
                    );
                  }}
                  style={{ justifyContent: 'center', fontSize: 12, padding: '8px 6px' }}
                  title="Sentence case"
                >
                  Ab
                </button>
              </Row>
            </div>

            <Row>
              <NumberField
                label="Line height"
                value={o.lineHeight ?? 1.16}
                onChange={(v) => updateSelectedProperty('lineHeight', Math.max(0.5, v))}
                step={0.05}
              />
              <NumberField
                label="Letter"
                value={o.charSpacing ?? 0}
                onChange={(v) => updateSelectedProperty('charSpacing', v)}
                step={10}
              />
            </Row>

            {/* Curve (text on path) */}
            <div className="field">
              <label className="field-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Spline size={12} /> Curve
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                {([
                  { id: 'none', label: 'None' },
                  { id: 'arc-up', label: 'Arc↑' },
                  { id: 'arc-down', label: 'Arc↓' },
                  { id: 'wave', label: 'Wave' },
                  { id: 'circle', label: 'Circle' },
                ] as const).map((c) => {
                  const active = c.id === 'none' ? !o.path : o.curveKind === c.id;
                  return (
                    <button
                      key={c.id}
                      className="tool-btn"
                      onClick={() => applyCurve(c.id)}
                      style={{
                        justifyContent: 'center',
                        fontSize: 10,
                        padding: '6px 2px',
                        backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                        borderColor: active ? 'var(--accent)' : undefined,
                      }}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
              {!!o.path && !!o.curveKind && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label className="field-label">Amount</label>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                      {o.curveAmount ?? 50}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={1}
                    value={o.curveAmount ?? 50}
                    onChange={(e) => applyCurve(o.curveKind, parseInt(e.target.value, 10))}
                    style={{ accentColor: 'var(--accent)', width: '100%' }}
                  />
                </div>
              )}
            </div>

            {/* Effect presets */}
            <div className="field">
              <label className="field-label" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={12} /> Effects
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                {([
                  { id: 'none', label: 'None' },
                  { id: 'shadow', label: 'Shadow' },
                  { id: 'neon', label: 'Neon' },
                  { id: 'echo', label: 'Echo' },
                  { id: 'splice', label: 'Splice' },
                  { id: '3d', label: '3D' },
                  { id: 'outline', label: 'Outline' },
                  { id: 'hollow', label: 'Hollow' },
                  { id: 'rainbow', label: 'Rainbow' },
                ] as const).map((p) => (
                  <button
                    key={p.id}
                    className="tool-btn"
                    onClick={() => applyTextEffect(p.id)}
                    style={{ justifyContent: 'center', fontSize: 11, padding: '8px 4px' }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Shadow fine-tuning (visible once any preset added a shadow) */}
            {!!o.shadow && (
              <div className="field">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="field-label">Shadow settings</label>
                  <button
                    className="icon-btn"
                    onClick={() => setTextShadow(null)}
                    title="Remove shadow"
                    style={{ width: 22, height: 22 }}
                  >
                    <X size={12} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                  <ColorField
                    value={typeof o.shadow.color === 'string' && o.shadow.color.startsWith('#') ? o.shadow.color : '#000000'}
                    fallback="#000000"
                    onChange={(c) => setTextShadow({ color: c })}
                  />
                  {([
                    { key: 'blur', label: 'Blur', min: 0, max: 60, value: o.shadow.blur ?? 0 },
                    { key: 'offsetX', label: 'Offset X', min: -40, max: 40, value: o.shadow.offsetX ?? 0 },
                    { key: 'offsetY', label: 'Offset Y', min: -40, max: 40, value: o.shadow.offsetY ?? 0 },
                  ] as const).map((s) => (
                    <div key={s.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label className="field-label">{s.label}</label>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                          {s.value}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={s.min}
                        max={s.max}
                        step={1}
                        value={s.value}
                        onChange={(e) => setTextShadow({ [s.key]: parseInt(e.target.value, 10) })}
                        style={{ accentColor: 'var(--accent)', width: '100%' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Highlight (text background color) */}
      {isText && (
        <div className="panel-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="panel-title" style={{ marginBottom: 0 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Highlighter size={12} /> Highlight
              </span>
            </div>
            {o.textBackgroundColor && (
              <button
                className="icon-btn"
                onClick={() => updateSelectedProperty('textBackgroundColor', '')}
                title="Remove highlight"
                style={{ width: 22, height: 22 }}
              >
                <X size={12} />
              </button>
            )}
          </div>
          <Row>
            <span className="color-swatch" style={{ backgroundColor: o.textBackgroundColor || 'transparent' }}>
              <input
                type="color"
                value={
                  typeof o.textBackgroundColor === 'string' && /^#[0-9a-fA-F]{6}$/.test(o.textBackgroundColor)
                    ? o.textBackgroundColor
                    : '#fff59d'
                }
                onChange={(e) => updateSelectedProperty('textBackgroundColor', e.target.value)}
              />
            </span>
            <input
              className="field-input"
              placeholder="none"
              value={o.textBackgroundColor || ''}
              onChange={(e) => updateSelectedProperty('textBackgroundColor', e.target.value)}
              style={{ flex: 1, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}
            />
          </Row>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, marginTop: 8 }}>
            {['#fff59d', '#ffd54f', '#f48fb1', '#81d4fa', '#a5d6a7', '#000000'].map((c) => (
              <button
                key={c}
                onClick={() => updateSelectedProperty('textBackgroundColor', c)}
                style={{
                  height: 26,
                  borderRadius: 4,
                  border: '1px solid var(--border)',
                  backgroundColor: c,
                  cursor: 'pointer',
                }}
                aria-label={`Highlight ${c}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Shadow — text, shapes, and images */}
      {(isText || isShape || isImage) && (
        <div className="panel-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="panel-title" style={{ marginBottom: 0 }}>Shadow</div>
            {o.shadow && (
              <button
                className="icon-btn"
                onClick={() => updateSelectedProperty('shadow', null)}
                title="Remove shadow"
                style={{ width: 22, height: 22 }}
              >
                <X size={12} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {SHADOW_PRESETS.map((p) => {
                const active =
                  (!o.shadow && p.value === null) ||
                  (p.value &&
                    o.shadow &&
                    o.shadow.color === p.value.color &&
                    o.shadow.blur === p.value.blur &&
                    o.shadow.offsetX === p.value.offsetX &&
                    o.shadow.offsetY === p.value.offsetY);
                return (
                  <button
                    key={p.label}
                    className="tool-btn"
                    onClick={() => updateSelectedProperty('shadow', p.value)}
                    style={{
                      justifyContent: 'center',
                      fontSize: 11,
                      padding: '6px 4px',
                      backgroundColor: active ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                      borderColor: active ? 'var(--accent)' : 'var(--border)',
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            {o.shadow && (
              <>
                <Row>
                  <span
                    className="color-swatch"
                    style={{ backgroundColor: o.shadow.color || '#000000' }}
                  >
                    <input
                      type="color"
                      value={
                        typeof o.shadow.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(o.shadow.color)
                          ? o.shadow.color
                          : '#000000'
                      }
                      onChange={(e) =>
                        updateSelectedProperty('shadow', { ...o.shadow, color: e.target.value })
                      }
                    />
                  </span>
                  <NumberField
                    label="Blur"
                    value={o.shadow.blur ?? 0}
                    onChange={(v) =>
                      updateSelectedProperty('shadow', { ...o.shadow, blur: Math.max(0, v) })
                    }
                    step={1}
                  />
                </Row>
                <Row>
                  <NumberField
                    label="Offset X"
                    value={o.shadow.offsetX ?? 0}
                    onChange={(v) => updateSelectedProperty('shadow', { ...o.shadow, offsetX: v })}
                    step={1}
                  />
                  <NumberField
                    label="Offset Y"
                    value={o.shadow.offsetY ?? 0}
                    onChange={(v) => updateSelectedProperty('shadow', { ...o.shadow, offsetY: v })}
                    step={1}
                  />
                </Row>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image: Crop + Reset + AI Background removal */}
      {isImage && !cropModeActive && (
        <div className="panel-section">
          <div className="panel-title">Edit</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button className="tool-btn" onClick={startCropMode} style={{ justifyContent: 'center' }}>
              <Crop size={14} />
              <span>Crop</span>
            </button>
            <button
              className="tool-btn"
              onClick={removeBackground}
              disabled={bgRemovalBusy}
              style={{
                justifyContent: 'center',
                opacity: bgRemovalBusy ? 0.7 : 1,
                cursor: bgRemovalBusy ? 'wait' : 'pointer',
              }}
              title="Remove background using AI"
            >
              {bgRemovalBusy ? (
                <>
                  <Loader2 size={14} className="spin" />
                  <span>Removing…</span>
                </>
              ) : (
                <>
                  <Scissors size={14} />
                  <span>Remove BG</span>
                </>
              )}
            </button>
          </div>
          {bgRemovalBusy && (
            <p style={{ marginTop: 8, fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Downloading the AI model on first use (~30 MB). Subsequent runs are fast.
            </p>
          )}
          {/* Show Reset only when the image actually has a crop applied.
              After Fabric filters run, _element is a canvas without
              naturalWidth, so check the original source element first. */}
          {(() => {
            const srcEl = (o._originalElement || o._element) as (HTMLImageElement & HTMLCanvasElement) | undefined;
            const srcW = srcEl?.naturalWidth || srcEl?.width;
            const srcH = srcEl?.naturalHeight || srcEl?.height;
            return (o.cropX ?? 0) > 0 || (o.cropY ?? 0) > 0 ||
              (!!srcW && srcW !== o.width) || (!!srcH && srcH !== o.height);
          })() && (
            <button
              onClick={resetCrop}
              style={{
                marginTop: 8,
                width: '100%',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: 12,
                cursor: 'pointer',
              }}
              title="Restore the image to its full source"
            >
              Reset crop
            </button>
          )}
        </div>
      )}

      {/* Image: Filter presets */}
      {isImage && !cropModeActive && (
        <div className="panel-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div className="panel-title" style={{ marginBottom: 0 }}>Presets</div>
            <button className="icon-btn" style={{ width: 22, height: 22 }} onClick={resetImageFilters} title="Reset filters">
              <RotateCw size={12} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
            {FILTER_PRESETS.map((p) => (
              <button
                key={p.id}
                className="tool-btn"
                onClick={() => applyImagePreset(p.id)}
                style={{ justifyContent: 'center', fontSize: 11, padding: '8px 4px' }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image: Adjustment sliders */}
      {isImage && !cropModeActive && (() => {
        const state = readFilterState(activeObject);
        const slider = (
          label: string,
          key: keyof typeof state,
          min: number,
          max: number,
          step: number,
          display: (v: number) => string
        ) => (
          <div className="field" key={key as string}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="field-label">{label}</label>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                {display((state[key] as number) || 0)}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={(state[key] as number) || 0}
              onChange={(e) => setImageFilter(key, parseFloat(e.target.value))}
              style={{ accentColor: 'var(--accent)', width: '100%' }}
            />
          </div>
        );
        return (
          <div className="panel-section">
            <div className="panel-title">Adjustments</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {slider('Brightness', 'brightness', -1, 1, 0.01, (v) => `${Math.round(v * 100)}`)}
              {slider('Contrast', 'contrast', -1, 1, 0.01, (v) => `${Math.round(v * 100)}`)}
              {slider('Saturation', 'saturation', -1, 1, 0.01, (v) => `${Math.round(v * 100)}`)}
              {slider('Blur', 'blur', 0, 1, 0.01, (v) => `${(v * 100).toFixed(0)}%`)}
              {slider('Hue rotation', 'hue', -Math.PI, Math.PI, 0.01, (v) => `${Math.round((v * 180) / Math.PI)}°`)}
            </div>
          </div>
        );
      })()}

      {/* Image: Colorize (BlendColor) */}
      {isImage && !cropModeActive && (() => {
        const state = readFilterState(activeObject);
        const blendHex = /^#[0-9a-fA-F]{6}$/.test(state.blendColor || '') ? state.blendColor! : '#7c5cff';
        return (
          <div className="panel-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div className="panel-title" style={{ marginBottom: 0 }}>Colorize</div>
              {state.blendColor && (
                <button
                  className="icon-btn"
                  style={{ width: 22, height: 22 }}
                  onClick={() => setImageFilter('blendColor', undefined)}
                  title="Remove colorize"
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Row>
                <span className="color-swatch" style={{ backgroundColor: state.blendColor || 'transparent' }}>
                  <input
                    type="color"
                    value={blendHex}
                    onChange={(e) => setImageFilter('blendColor', e.target.value)}
                  />
                </span>
                <select
                  className="field-select"
                  value={state.blendMode}
                  onChange={(e) => setImageFilter('blendMode', e.target.value)}
                  style={{ flex: 1 }}
                >
                  {(['tint', 'multiply', 'screen', 'add', 'difference', 'lighten', 'darken', 'overlay', 'exclusion'] as const).map(
                    (m) => (
                      <option key={m} value={m}>{m}</option>
                    )
                  )}
                </select>
              </Row>
              <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label className="field-label">Intensity</label>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                    {Math.round(state.blendAlpha * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={state.blendAlpha}
                  onChange={(e) => setImageFilter('blendAlpha', parseFloat(e.target.value))}
                  style={{ accentColor: 'var(--accent)', width: '100%' }}
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* Image WASM filters */}
      {isImage && !cropModeActive && (
        <div className="panel-section">
          <div className="panel-title">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={12} /> WASM Filters
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {['radio', 'oceanic', 'islands', 'marine', 'seagreen', 'flagblue', 'liquid', 'diamante'].map(
              (f) => (
                <button
                  key={f}
                  className="tool-btn"
                  onClick={() => applyWasmFilter(activeObject as any, f, canvas!)}
                  style={{ justifyContent: 'center', textTransform: 'capitalize', fontSize: 12 }}
                >
                  {f}
                </button>
              )
            )}
          </div>
          <p style={{ marginTop: 10, fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
            Filters run client-side via WebAssembly and modify the image in place.
          </p>
        </div>
      )}

      {/* Comment (annotation on the object) */}
      <div className="panel-section">
        <div className="panel-title">Comment</div>
        <textarea
          value={(o as any).comment ?? ''}
          onChange={(e) => setObjectComment(activeObject, e.target.value)}
          placeholder="Add a note for reviewers…"
          rows={3}
          style={{
            width: '100%',
            padding: '8px 10px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontSize: 12,
            resize: 'vertical',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div className="panel-section">
        <button
          className="danger-btn"
          onClick={deleteSelected}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </aside>
  );
};

export default PropertiesPanel;
