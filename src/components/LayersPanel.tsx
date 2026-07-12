import React from 'react';
import * as fabric from 'fabric';
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronUp,
  ChevronDown,
  Square as SquareIcon,
  Circle as CircleIcon,
  Triangle,
  Type as TypeIcon,
  Image as ImageIcon,
  Group as GroupIcon,
  Shapes,
  Star,
  Diamond,
  Minus,
} from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';

const typeIcon = (type: string | undefined) => {
  switch (type) {
    case 'rect':
      return <SquareIcon size={14} />;
    case 'circle':
    case 'ellipse':
      return <CircleIcon size={14} />;
    case 'triangle':
      return <Triangle size={14} />;
    case 'polygon':
      return <Diamond size={14} />;
    case 'path':
      return <Star size={14} />;
    case 'line':
      return <Minus size={14} />;
    case 'textbox':
    case 'text':
    case 'i-text':
      return <TypeIcon size={14} />;
    case 'image':
      return <ImageIcon size={14} />;
    case 'group':
      return <GroupIcon size={14} />;
    default:
      return <Shapes size={14} />;
  }
};

const typeLabel = (obj: fabric.Object) => {
  const t = obj.type;
  if (t === 'textbox' || t === 'text' || t === 'i-text') {
    const text = ((obj as any).text || '').toString().trim();
    return text.length ? (text.length > 22 ? text.slice(0, 22) + '…' : text) : 'Text';
  }
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Object';
};

const LayersPanel: React.FC = () => {
  const canvas = useEditorStore((s) => s.canvas);
  const activeObject = useEditorStore((s) => s.activeObject);
  // objectsRev triggers re-render when objects change
  useEditorStore((s) => s.objectsRev);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const bumpObjectsRev = useEditorStore((s) => s.bumpObjectsRev);
  const saveHistory = useEditorStore((s) => s.saveHistory);

  if (!canvas) return null;
  // Top-first rendering order
  const objects = [...canvas.getObjects()].reverse();

  const selectObj = (obj: fabric.Object) => {
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    useEditorStore.getState().setActiveObject(obj);
  };

  const toggleVisibility = (obj: fabric.Object) => {
    obj.visible = !obj.visible;
    if (activeObject === obj && !obj.visible) canvas.discardActiveObject();
    canvas.requestRenderAll();
    bumpObjectsRev();
    saveHistory();
  };

  const toggleLock = (obj: fabric.Object) => {
    const locked = obj.selectable === false;
    obj.selectable = locked;
    obj.evented = locked;
    obj.lockMovementX = !locked;
    obj.lockMovementY = !locked;
    obj.lockScalingX = !locked;
    obj.lockScalingY = !locked;
    obj.lockRotation = !locked;
    if (!locked) canvas.discardActiveObject();
    canvas.requestRenderAll();
    bumpObjectsRev();
    saveHistory();
  };

  const remove = (obj: fabric.Object) => {
    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  return (
    <div style={{ padding: '12px 8px' }}>
      <div
        className="panel-title"
        style={{ padding: '0 8px 8px', display: 'flex', justifyContent: 'space-between' }}
      >
        <span>Layers</span>
        <span style={{ color: 'var(--text-tertiary)' }}>{objects.length}</span>
      </div>
      {objects.length === 0 && (
        <div
          style={{
            padding: '32px 12px',
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--text-tertiary)',
            lineHeight: 1.5,
          }}
        >
          Add shapes, text, or images from the other tabs to see them here.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {objects.map((obj, i) => {
          const isActive = activeObject === obj;
          const isLocked = obj.selectable === false;
          const isHidden = obj.visible === false;
          return (
            <div
              key={i}
              onClick={() => !isLocked && selectObj(obj)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isHidden ? 0.5 : 1,
                transition: 'background-color 0.1s ease',
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                {typeIcon(obj.type)}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {typeLabel(obj)}
              </span>
              <button
                className="icon-btn"
                style={{ width: 22, height: 22 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisibility(obj);
                }}
                title={isHidden ? 'Show' : 'Hide'}
              >
                {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <button
                className="icon-btn"
                style={{ width: 22, height: 22 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(obj);
                }}
                title={isLocked ? 'Unlock' : 'Lock'}
              >
                {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
              </button>
              <button
                className="icon-btn"
                style={{ width: 22, height: 22 }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectObj(obj);
                  bringForward();
                }}
                title="Move up"
              >
                <ChevronUp size={12} />
              </button>
              <button
                className="icon-btn"
                style={{ width: 22, height: 22 }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectObj(obj);
                  sendBackward();
                }}
                title="Move down"
              >
                <ChevronDown size={12} />
              </button>
              <button
                className="icon-btn"
                style={{ width: 22, height: 22, color: 'var(--danger)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(obj);
                }}
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LayersPanel;
