import React, { useState } from 'react';
import {
  Shapes,
  Type,
  Image as ImageIcon,
  Upload,
  Heading1,
  Heading2,
  TextCursorInput,
  Layers,
  FolderHeart,
  LayoutTemplate,
  Sparkles,
  Smile,
  Palette,
  MessageSquare,
  Wrench,
} from 'lucide-react';
import { useEditorStore } from '../store/useEditorStore';
import LayersPanel from './LayersPanel';
import ProjectsPanel from './ProjectsPanel';
import TemplatesPanel from './TemplatesPanel';
import IconsPanel from './IconsPanel';
import EmojisPanel from './EmojisPanel';
import BrandKitPanel from './BrandKitPanel';
import CommentsPanel from './CommentsPanel';
import ToolsPalette from './ToolsPalette';
import ShapesPanel from './ShapesPanel';

type Tab =
  | 'projects'
  | 'templates'
  | 'tools'
  | 'shapes'
  | 'text'
  | 'icons'
  | 'emojis'
  | 'uploads'
  | 'brand'
  | 'comments'
  | 'layers';

const rails: { id: Tab; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'projects', label: 'Projects', icon: FolderHeart },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'shapes', label: 'Shapes', icon: Shapes },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'icons', label: 'Icons', icon: Sparkles },
  { id: 'emojis', label: 'Emojis', icon: Smile },
  { id: 'uploads', label: 'Uploads', icon: ImageIcon },
  { id: 'brand', label: 'Brand', icon: Palette },
  { id: 'comments', label: 'Comments', icon: MessageSquare },
  { id: 'layers', label: 'Layers', icon: Layers },
];

const TextPanel: React.FC = () => {
  const addText = useEditorStore((s) => s.addText);
  return (
    <>
      <div className="panel-section">
        <div className="panel-title">Add text</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="tool-btn" onClick={() => addText('heading')}>
            <Heading1 size={18} />
            <span style={{ fontSize: 15, fontWeight: 700 }}>Add a heading</span>
          </button>
          <button className="tool-btn" onClick={() => addText('subheading')}>
            <Heading2 size={16} />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Add a subheading</span>
          </button>
          <button className="tool-btn" onClick={() => addText('body')}>
            <TextCursorInput size={14} />
            <span style={{ fontSize: 12 }}>Add body text</span>
          </button>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-title">Font art</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="tool-btn" onClick={() => addText('display')}>
            <span style={{ fontFamily: '"Bebas Neue"', fontSize: 18, letterSpacing: 1 }}>BIG STATEMENT</span>
          </button>
          <button className="tool-btn" onClick={() => addText('script')}>
            <span style={{ fontFamily: '"Pacifico"', fontSize: 15 }}>Something lovely</span>
          </button>
          <button className="tool-btn" onClick={() => addText('comic')}>
            <span style={{ fontFamily: '"Bangers"', fontSize: 17, letterSpacing: 1 }}>POW! WOW!</span>
          </button>
        </div>
        <p style={{ marginTop: 10, fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
          Combine with <b>Curve</b>, <b>Effects</b> and gradient fills in the
          right panel to build word-art.
        </p>
      </div>

      <div className="panel-section">
        <div className="panel-title">සිංහල · Sinhala</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="tool-btn" onClick={() => addText('sinhala-heading')}>
            <Heading1 size={18} />
            <span style={{ fontFamily: '"Noto Sans Sinhala"', fontSize: 18, fontWeight: 700 }}>
              ආයුබෝවන්
            </span>
          </button>
          <button className="tool-btn" onClick={() => addText('sinhala-body')}>
            <TextCursorInput size={14} />
            <span style={{ fontFamily: '"Noto Sans Sinhala"', fontSize: 14 }}>
              සිංහල පෙළක් එකතු කරන්න
            </span>
          </button>
        </div>
        <p style={{ marginTop: 10, fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
          Double-click the text on the canvas to edit inline. Use your OS
          Sinhala IME (Wijesekera / Phonetic) to type — Unicode grapheme
          clusters (කු, ශ්‍රී, etc.) render correctly.
        </p>
      </div>
    </>
  );
};

const UploadsPanel: React.FC = () => {
  const addImage = useEditorStore((s) => s.addImage);
  return (
    <div className="panel-section">
      <div className="panel-title">Uploads</div>
      <label
        className="tool-btn"
        style={{
          flexDirection: 'column',
          height: 130,
          borderStyle: 'dashed',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Upload size={22} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>Upload an image</span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>PNG, JPG, GIF</span>
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) addImage(URL.createObjectURL(file));
            e.target.value = '';
          }}
        />
      </label>
      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        After uploading, select the image and use WASM filters from the right panel.
      </p>
    </div>
  );
};

const Sidebar: React.FC = () => {
  const [tab, setTab] = useState<Tab>('tools');

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Icon rail */}
      <div
        style={{
          width: 'var(--rail-width)',
          backgroundColor: 'var(--bg-panel)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 8,
        }}
      >
        {rails.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              className={`rail-btn ${tab === r.id ? 'active' : ''}`}
              onClick={() => setTab(r.id)}
            >
              <Icon size={20} />
              <span>{r.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contextual tool panel */}
      {tab !== 'tools' && (
        <div
          style={{
            width: 'var(--tool-panel-width)',
            height: '100%',
            backgroundColor: 'var(--bg-panel-2)',
            borderRight: '1px solid var(--border)',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {tab === 'projects' && <ProjectsPanel />}
          {tab === 'templates' && <TemplatesPanel />}
          {tab === 'shapes' && <ShapesPanel />}
          {tab === 'text' && <TextPanel />}
          {tab === 'icons' && <IconsPanel />}
          {tab === 'emojis' && <EmojisPanel />}
          {tab === 'uploads' && <UploadsPanel />}
          {tab === 'brand' && <BrandKitPanel />}
          {tab === 'comments' && <CommentsPanel />}
          {tab === 'layers' && <LayersPanel />}
        </div>
      )}
      
      {/* Floating Tools Palette rendered over the workspace when active */}
      {tab === 'tools' && <ToolsPalette />}
    </div>
  );
};

export default Sidebar;
