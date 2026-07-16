import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { listProjectsDb, deleteProjectDb, getProjectDb, type ProjectMeta } from '../utils/db';
import { FolderHeart, Trash2, Clock, Plus } from 'lucide-react';

const ProjectsPanel: React.FC = () => {
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const currentProjectId = useEditorStore((s) => s.projectId);
  const canvas = useEditorStore((s) => s.canvas);
  
  const loadProjects = async () => {
    const list = await listProjectsDb();
    setProjects(list);
  };

  useEffect(() => {
    loadProjects();
    // Refresh periodically in case of autosave
    const interval = setInterval(loadProjects, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenProject = async (id: string) => {
    if (!canvas) return;
    try {
      const proj = await getProjectDb(id);
      if (proj && proj.data) {
        useEditorStore.getState().setProjectId(proj.id);
        useEditorStore.getState().setProjectName(proj.name);
        await canvas.loadFromJSON(proj.data);
        canvas.renderAll();
        useEditorStore.getState().initHistory();
        localStorage.setItem('canvawasm.lastProjectId', proj.id);
      }
    } catch (e) {
      console.error('Failed to open project', e);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProjectDb(id);
      if (id === currentProjectId) {
        // If we delete the currently open project, just clear it and start fresh
        handleNewProject();
      } else {
        loadProjects();
      }
    }
  };

  const handleNewProject = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    useEditorStore.getState().clearHistory();
    useEditorStore.getState().initHistory();
    useEditorStore.getState().setFileHandle(null);
    useEditorStore.getState().setProjectName('Untitled design');
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    useEditorStore.getState().setProjectId(newId);
    localStorage.setItem('canvawasm.lastProjectId', newId);
    canvas.requestRenderAll();
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FolderHeart size={20} color="var(--accent)" /> Your Projects
        </h2>
        <button 
          className="icon-btn" 
          onClick={handleNewProject} 
          title="New Project"
          style={{ width: 32, height: 32, backgroundColor: 'var(--accent)', color: '#fff', borderRadius: '50%' }}
        >
          <Plus size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {projects.map((p) => {
          const isActive = p.id === currentProjectId;
          return (
            <div
              key={p.id}
              onClick={() => handleOpenProject(p.id)}
              style={{
                position: 'relative',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                border: `2px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                boxShadow: isActive ? '0 0 0 4px var(--accent-soft)' : 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.transform = 'translateY(-2px)';
                const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                if (btn) btn.style.opacity = '1';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.transform = 'translateY(0)';
                const btn = e.currentTarget.querySelector('.delete-btn') as HTMLElement;
                if (btn) btn.style.opacity = '0';
              }}
            >
              <div
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  backgroundColor: '#fff',
                  backgroundImage: `url(${p.thumbnail})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  borderBottom: '1px solid var(--border)',
                }}
              />
              <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Clock size={10} /> {new Date(p.updatedAt).toLocaleDateString()}
                </div>
              </div>
              
              <button
                className="delete-btn"
                onClick={(e) => handleDeleteProject(e, p.id)}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}
      </div>
      
      {projects.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)', fontSize: 13 }}>
          <FolderHeart size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          No projects yet. Start designing to see them here!
        </div>
      )}
    </div>
  );
};

export default ProjectsPanel;
