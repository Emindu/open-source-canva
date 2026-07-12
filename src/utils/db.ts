import { get, set, del, entries } from 'idb-keyval';

export interface ProjectMeta {
  id: string;
  name: string;
  thumbnail: string;
  updatedAt: number;
}

export interface ProjectData extends ProjectMeta {
  data: any; // Fabric JSON representation
}

/**
 * Save a complete project to IndexedDB
 */
export const saveProjectDb = async (project: ProjectData): Promise<void> => {
  await set(`proj_${project.id}`, project);
};

/**
 * Retrieve a full project by ID
 */
export const getProjectDb = async (id: string): Promise<ProjectData | undefined> => {
  return await get(`proj_${id}`);
};

/**
 * Delete a project by ID
 */
export const deleteProjectDb = async (id: string): Promise<void> => {
  await del(`proj_${id}`);
};

/**
 * List all projects (metadata only) sorted by most recently updated
 */
export const listProjectsDb = async (): Promise<ProjectMeta[]> => {
  const all = await entries();
  const projects: ProjectMeta[] = [];
  
  for (const [key, value] of all) {
    if (typeof key === 'string' && key.startsWith('proj_')) {
      const proj = value as ProjectData;
      projects.push({
        id: proj.id,
        name: proj.name,
        thumbnail: proj.thumbnail,
        updatedAt: proj.updatedAt,
      });
    }
  }
  
  return projects.sort((a, b) => b.updatedAt - a.updatedAt);
};
