import React, { useEffect, useRef, useState } from 'react';
import {
  Undo2,
  Redo2,
  Share2,
  Download,
  FileImage,
  FileJson,
  FileText,
  ChevronDown,
  FolderOpen,
  Save,
  FilePlus,
  SaveAll,
  Grid3x3,
  Ruler,
  Magnet,
  Check,
  Moon,
  Sun,
  Palette,
} from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import { ACCENTS } from '../utils/accentTheme';
import type { AccentName } from '../utils/accentTheme';
import { exportJpg, exportJson, exportPdf, exportPng } from '../utils/exporters';
import { openProjectFile, saveProjectFile, saveAsProjectFile } from '../utils/fileSystem';
import { EXTRA_PROPS } from '../utils/projectSerialization';

const Topbar: React.FC = () => {
  const [exportOpen, setExportOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const viewMenuRef = useRef<HTMLDivElement>(null);

  const showGrid = useEditorStore((s) => s.showGrid);
  const showRulers = useEditorStore((s) => s.showRulers);
  const snapEnabled = useEditorStore((s) => s.snapEnabled);
  const toggleGrid = useEditorStore((s) => s.toggleGrid);
  const toggleRulers = useEditorStore((s) => s.toggleRulers);
  const toggleSnap = useEditorStore((s) => s.toggleSnap);
  const theme = useEditorStore((s) => s.theme);
  const toggleTheme = useEditorStore((s) => s.toggleTheme);

  const canvas = useEditorStore((s) => s.canvas);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const projectName = useEditorStore((s) => s.projectName);
  const setProjectName = useEditorStore((s) => s.setProjectName);
  const fileHandle = useEditorStore((s) => s.fileHandle);
  const setFileHandle = useEditorStore((s) => s.setFileHandle);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setFileMenuOpen(false);
      }
      if (viewMenuRef.current && !viewMenuRef.current.contains(e.target as Node)) {
        setViewMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleExport = (kind: 'png' | 'jpg' | 'pdf' | 'json') => {
    if (!canvas) return;
    setExportOpen(false);
    const name = projectName.trim() || 'design';
    if (kind === 'png') exportPng(canvas, 2, name);
    else if (kind === 'jpg') exportJpg(canvas, 2, name);
    else if (kind === 'pdf') exportPdf(canvas, 2, name);
    else exportJson(canvas, name);
  };

  const handleNewProject = () => {
    if (!canvas) return;
    setFileMenuOpen(false);
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    useEditorStore.getState().clearHistory();
    useEditorStore.getState().initHistory();
    setFileHandle(null);
    setProjectName('Untitled design');
    useEditorStore.getState().setProjectId(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
    canvas.requestRenderAll();
  };

  const handleOpenProject = async () => {
    if (!canvas) return;
    setFileMenuOpen(false);
    try {
      const { handle, name, content } = await openProjectFile();
      await canvas.loadFromJSON(content);
      canvas.renderAll();
      useEditorStore.getState().initHistory();
      setFileHandle(handle);
      setProjectName(name);
      useEditorStore.getState().setProjectId(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));
    } catch (e: any) {
      if (e.message !== 'Cancelled') {
        alert('Failed to open file: ' + e.message);
      }
    }
  };

  const handleSaveProject = async () => {
    if (!canvas) return;
    setFileMenuOpen(false);
    const data = canvas.toObject(EXTRA_PROPS);
    if (fileHandle) {
      await saveProjectFile(fileHandle, data, projectName);
    } else {
      await handleSaveAsProject();
    }
  };

  const handleSaveAsProject = async () => {
    if (!canvas) return;
    setFileMenuOpen(false);
    try {
      const data = canvas.toObject(EXTRA_PROPS);
      const { handle, name } = await saveAsProjectFile(data, projectName || 'design');
      setFileHandle(handle);
      setProjectName(name);
    } catch (e: any) {
      if (e.message !== 'Cancelled') {
        alert('Failed to save file: ' + e.message);
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSaveAsProject();
        } else {
          handleSaveProject();
        }
      } else if (mod && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleOpenProject();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [canvas, fileHandle, projectName]);

  return (
    <header
      style={{
        height: 'var(--topbar-height)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px 0 16px',
        backgroundColor: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        gap: 12,
        position: 'relative',
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-contrast)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            C
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            CanvaWasm
          </span>
        </div>


        {/* File Menu */}
        <div ref={fileMenuRef} style={{ position: 'relative' }}>
          <button 
            className="icon-btn" 
            style={{ fontWeight: 600, fontSize: 13, padding: '6px 10px', width: 'auto', borderRadius: 'var(--radius-sm)' }}
            onClick={() => setFileMenuOpen(!fileMenuOpen)}
          >
            File
          </button>
          {fileMenuOpen && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 'calc(100% + 6px)',
                minWidth: 200,
                padding: 6,
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                zIndex: 30,
              }}
            >
              <MenuItem icon={<FilePlus size={14} />} label="New design" hint="" onClick={handleNewProject} />
              <MenuItem icon={<FolderOpen size={14} />} label="Open design" hint="Ctrl+O" onClick={handleOpenProject} />
              <div style={{ height: 1, backgroundColor: 'var(--border)', margin: '4px 0' }} />
              <MenuItem icon={<Save size={14} />} label="Save" hint="Ctrl+S" onClick={handleSaveProject} />
              <MenuItem icon={<SaveAll size={14} />} label="Save as..." hint="" onClick={handleSaveAsProject} />
            </div>
          )}
        </div>

        {/* View Menu */}
        <div ref={viewMenuRef} style={{ position: 'relative' }}>
          <button
            className="icon-btn"
            style={{ fontWeight: 600, fontSize: 13, padding: '6px 10px', width: 'auto', borderRadius: 'var(--radius-sm)' }}
            onClick={() => setViewMenuOpen(!viewMenuOpen)}
          >
            View
          </button>
          {viewMenuOpen && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 'calc(100% + 6px)',
                minWidth: 200,
                padding: 6,
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                zIndex: 30,
              }}
            >
              <ToggleMenuItem
                icon={<Ruler size={14} />}
                label="Rulers"
                active={showRulers}
                onClick={() => {
                  toggleRulers();
                  setViewMenuOpen(false);
                }}
              />
              <ToggleMenuItem
                icon={<Grid3x3 size={14} />}
                label="Grid"
                active={showGrid}
                onClick={() => {
                  toggleGrid();
                  setViewMenuOpen(false);
                }}
              />
              <ToggleMenuItem
                icon={<Magnet size={14} />}
                label="Snap to guides"
                active={snapEnabled}
                onClick={() => {
                  toggleSnap();
                  setViewMenuOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          style={{
            background: 'transparent',
            border: '1px solid transparent',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 13,
            color: 'var(--text-primary)',
            textAlign: 'center',
            minWidth: 200,
            transition: 'background-color 0.12s ease, border-color 0.12s ease',
          }}
          onFocus={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 240, justifyContent: 'flex-end' }}>
        <ThemeMenu />
        <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle theme">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div style={{ width: 1, height: 20, backgroundColor: 'var(--border)', margin: '0 2px' }} />
        <button className="icon-btn" onClick={() => undo()} disabled={!canUndo} aria-label="Undo (Ctrl+Z)" title="Undo (Ctrl+Z)">
          <Undo2 size={16} />
        </button>
        <button className="icon-btn" onClick={() => redo()} disabled={!canRedo} aria-label="Redo (Ctrl+Shift+Z)" title="Redo (Ctrl+Shift+Z)">
          <Redo2 size={16} />
        </button>
        <div style={{ width: 1, height: 20, backgroundColor: 'var(--border)', margin: '0 6px' }} />
        <button className="pill-btn">
          <Share2 size={14} />
          Share
        </button>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button className="primary-btn" onClick={() => setExportOpen((v) => !v)}>
            <Download size={14} />
            Export
            <ChevronDown size={14} />
          </button>
          {exportOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 6px)',
                minWidth: 200,
                padding: 6,
                backgroundColor: 'var(--bg-panel)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                zIndex: 30,
              }}
            >
              <MenuItem icon={<FileImage size={14} />} label="PNG image" hint="Transparent, 2x" onClick={() => handleExport('png')} />
              <MenuItem icon={<FileImage size={14} />} label="JPG image" hint="High quality" onClick={() => handleExport('jpg')} />
              <MenuItem icon={<FileText size={14} />} label="PDF document" hint="Print-ready" onClick={() => handleExport('pdf')} />
              <MenuItem icon={<FileJson size={14} />} label="Project JSON" hint="Reopen later" onClick={() => handleExport('json')} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

/** Accent color picker: five theme swatches in a small dropdown. */
const ThemeMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const accentTheme = useEditorStore((s) => s.accentTheme);
  const setAccentTheme = useEditorStore((s) => s.setAccentTheme);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="icon-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Color theme"
        title="Color theme"
      >
        <Palette size={16} />
      </button>
      {open && (
        <div
          className="glass-card"
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 6px)',
            padding: 10,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 8,
            zIndex: 30,
          }}
        >
          {(Object.keys(ACCENTS) as AccentName[]).map((name) => {
            const active = name === accentTheme;
            return (
              <button
                key={name}
                onClick={() => setAccentTheme(name)}
                title={ACCENTS[name].label}
                aria-label={`${ACCENTS[name].label} theme`}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  padding: 0,
                  backgroundColor: ACCENTS[name].hex,
                  border: '2px solid var(--bg-panel)',
                  boxShadow: active ? '0 0 0 2px var(--accent)' : '0 0 0 1px var(--border-strong)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                {active && <Check size={13} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
}> = ({ icon, label, hint, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--text-primary)',
      fontSize: 13,
      textAlign: 'left',
      transition: 'background-color 0.12s ease',
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
  >
    <span style={{ color: 'var(--text-secondary)' }}>{icon}</span>
    <span style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <span style={{ fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
        {hint && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              marginLeft: 16,
              alignSelf: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {hint}
          </span>
        )}
      </span>
    </span>
  </button>
);

const ToggleMenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 10px',
      borderRadius: 'var(--radius-sm)',
      color: 'var(--text-primary)',
      fontSize: 13,
      textAlign: 'left',
      transition: 'background-color 0.12s ease',
    }}
    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
  >
    <span style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }}>{icon}</span>
    <span style={{ flex: 1, fontWeight: 500 }}>{label}</span>
    <span style={{ width: 16, display: 'flex', justifyContent: 'flex-end' }}>
      {active && <Check size={14} style={{ color: 'var(--accent)' }} />}
    </span>
  </button>
);

export default Topbar;
