import React, { useEffect } from 'react';
import {
  Copy,
  ClipboardPaste,
  Trash2,
  ChevronsUp,
  ChevronsDown,
  ArrowUp,
  ArrowDown,
  Files,
  MessageSquare,
} from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';

const Item: React.FC<{
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
  danger?: boolean;
}> = ({ icon, label, hint, onClick, danger }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '7px 10px',
      borderRadius: 'var(--radius-sm)',
      color: danger ? 'var(--danger)' : 'var(--text-primary)',
      fontSize: 13,
      textAlign: 'left',
      transition: 'background-color 0.1s ease',
      width: '100%',
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
  >
    <span style={{ color: danger ? 'var(--danger)' : 'var(--text-secondary)', display: 'inline-flex' }}>
      {icon}
    </span>
    <span style={{ flex: 1 }}>{label}</span>
    {hint && (
      <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 12 }}>{hint}</span>
    )}
  </button>
);

const Divider: React.FC = () => (
  <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '4px 0' }} />
);

const ContextMenu: React.FC = () => {
  const contextMenu = useEditorStore((s) => s.contextMenu);
  const hideContextMenu = useEditorStore((s) => s.hideContextMenu);
  const activeObject = useEditorStore((s) => s.activeObject);
  const copySelected = useEditorStore((s) => s.copySelected);
  const paste = useEditorStore((s) => s.paste);
  const duplicateSelected = useEditorStore((s) => s.duplicateSelected);
  const deleteSelected = useEditorStore((s) => s.deleteSelected);
  const bringToFront = useEditorStore((s) => s.bringToFront);
  const sendToBack = useEditorStore((s) => s.sendToBack);
  const bringForward = useEditorStore((s) => s.bringForward);
  const sendBackward = useEditorStore((s) => s.sendBackward);
  const setObjectComment = useEditorStore((s) => s.setObjectComment);

  useEffect(() => {
    if (!contextMenu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideContextMenu();
    };
    const onClickAnywhere = () => hideContextMenu();
    document.addEventListener('keydown', onKey);
    // Delay outside-click so opening click doesn't immediately close
    const t = window.setTimeout(() => {
      document.addEventListener('mousedown', onClickAnywhere, { once: true });
    }, 0);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickAnywhere);
      window.clearTimeout(t);
    };
  }, [contextMenu, hideContextMenu]);

  if (!contextMenu) return null;

  const hasSelection = !!activeObject;
  const run = (fn: () => void | Promise<void>) => () => {
    fn();
    hideContextMenu();
  };

  const handleAddComment = () => {
    if (!activeObject) return;
    const existing = (activeObject as any).comment || '';
    const text = window.prompt('Add a comment for this object:', existing);
    if (text !== null) setObjectComment(activeObject, text);
    hideContextMenu();
  };

  // Clamp position so menu doesn't fall off-screen
  const menuW = 220;
  const menuH = 300;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const x = Math.min(contextMenu.x, vw - menuW - 8);
  const y = Math.min(contextMenu.y, vh - menuH - 8);

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: x,
        top: y,
        minWidth: menuW,
        padding: 6,
        backgroundColor: 'var(--bg-panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        zIndex: 40,
      }}
    >
      {hasSelection && (
        <>
          <Item icon={<Copy size={14} />} label="Copy" hint="Ctrl+C" onClick={run(copySelected)} />
          <Item
            icon={<Files size={14} />}
            label="Duplicate"
            hint="Ctrl+D"
            onClick={run(duplicateSelected)}
          />
        </>
      )}
      <Item icon={<ClipboardPaste size={14} />} label="Paste" hint="Ctrl+V" onClick={run(paste)} />
      {hasSelection && (
        <>
          <Divider />
          <Item icon={<ChevronsUp size={14} />} label="Bring to front" onClick={run(bringToFront)} />
          <Item icon={<ArrowUp size={14} />} label="Bring forward" onClick={run(bringForward)} />
          <Item icon={<ArrowDown size={14} />} label="Send backward" onClick={run(sendBackward)} />
          <Item
            icon={<ChevronsDown size={14} />}
            label="Send to back"
            onClick={run(sendToBack)}
          />
          <Divider />
          <Item icon={<MessageSquare size={14} />} label="Add comment…" onClick={handleAddComment} />
          <Divider />
          <Item
            icon={<Trash2 size={14} />}
            label="Delete"
            hint="Del"
            danger
            onClick={run(deleteSelected)}
          />
        </>
      )}
    </div>
  );
};

export default ContextMenu;
