import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface SignatureModalProps {
  onClose: () => void;
  onInsert: (dataUrl: string) => void;
}

const COLORS = ['#111827', '#1f2937', '#0f172a', '#2563eb', '#ef4444', '#0ea5e9'];

const SignatureModal: React.FC<SignatureModalProps> = ({ onClose, onInsert }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState<string>('#111827');
  const [width, setWidth] = useState<number>(4);
  const [hasStrokes, setHasStrokes] = useState(false);

  // Redraw context on color / width change so subsequent strokes use new settings.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
  }, [color, width]);

  const getCtx = () => canvasRef.current?.getContext('2d') || null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = getCtx();
    if (!ctx) return;
    // Reapply settings in case they were reset by clear or resize.
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = getCtx();
    if (!ctx) return;
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
    setHasStrokes(true);
  };

  const stopDrawing = () => {
    const ctx = getCtx();
    if (ctx) ctx.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasStrokes(false);
    }
  };

  const handleInsert = () => {
    if (!hasStrokes) return;
    const canvas = canvasRef.current;
    if (canvas) {
      // PNG preserves transparency — the signature keeps its transparent bg
      // when inserted onto the design canvas.
      onInsert(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderRadius: 'var(--radius-lg)',
          padding: 24,
          width: 500,
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>Draw signature</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Color + width controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                title={c}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  padding: 0,
                  cursor: 'pointer',
                  backgroundColor: c,
                  border: color === c ? '2px solid var(--accent)' : '2px solid var(--border)',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Thickness</span>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value, 10))}
              style={{ flex: 1, accentColor: 'var(--accent)' }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', width: 22, textAlign: 'right' }}>
              {width}
            </span>
          </div>
        </div>

        <div
          style={{
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            // WHITE background so the signature is visible while drawing,
            // AND so the exported PNG has proper contrast against the
            // preview. The insert step uses the canvas's raw pixels, which
            // include only what was actually drawn (transparent elsewhere).
            backgroundColor: '#ffffff',
            marginBottom: 16,
          }}
        >
          <canvas
            ref={canvasRef}
            width={450}
            height={200}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ cursor: 'crosshair', display: 'block' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={handleClear}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={!hasStrokes}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: hasStrokes ? 'var(--accent)' : 'var(--bg-hover)',
                color: 'white',
                cursor: hasStrokes ? 'pointer' : 'not-allowed',
                opacity: hasStrokes ? 1 : 0.6,
              }}
            >
              Insert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
