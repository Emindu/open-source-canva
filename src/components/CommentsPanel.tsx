import React from 'react';
import * as fabric from 'fabric';
import { MessageSquare, MousePointerClick, Trash2 } from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';

const objTitle = (obj: fabric.Object): string => {
  const t = obj.type;
  if (t === 'textbox' || t === 'text' || t === 'i-text') {
    const s = ((obj as any).text || '').toString().trim();
    return s.length ? (s.length > 30 ? s.slice(0, 30) + '…' : s) : 'Text';
  }
  return (t || 'Object').charAt(0).toUpperCase() + (t || 'Object').slice(1);
};

const CommentsPanel: React.FC = () => {
  const canvas = useEditorStore((s) => s.canvas);
  const activeObject = useEditorStore((s) => s.activeObject);
  useEditorStore((s) => s.objectsRev); // subscribe so we re-render on changes
  const setObjectComment = useEditorStore((s) => s.setObjectComment);

  if (!canvas) return null;
  const commented = canvas.getObjects().filter((o) => typeof (o as any).comment === 'string' && (o as any).comment.trim().length > 0);

  const select = (obj: fabric.Object) => {
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    useEditorStore.getState().setActiveObject(obj);
  };

  return (
    <>
      <div className="panel-section">
        <div className="panel-title">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <MessageSquare size={12} /> Comments
          </span>
        </div>
        {commented.length === 0 ? (
          <div
            style={{
              padding: '20px 12px',
              textAlign: 'center',
              color: 'var(--text-tertiary)',
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            No comments yet. Right-click any object → <b>Add comment…</b> or use the Comment field in the
            Properties panel.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {commented.map((obj, i) => {
              const isActive = activeObject === obj;
              const comment = (obj as any).comment as string;
              return (
                <div
                  key={i}
                  style={{
                    padding: 10,
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                    backgroundColor: isActive ? 'var(--accent-soft)' : 'var(--bg-elevated)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', flex: 1 }}>
                      {objTitle(obj)}
                    </span>
                    <button
                      className="icon-btn"
                      style={{ width: 22, height: 22 }}
                      onClick={() => select(obj)}
                      title="Select on canvas"
                    >
                      <MousePointerClick size={12} />
                    </button>
                    <button
                      className="icon-btn"
                      style={{ width: 22, height: 22, color: 'var(--danger)' }}
                      onClick={() => setObjectComment(obj, '')}
                      title="Remove comment"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {comment}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default CommentsPanel;
