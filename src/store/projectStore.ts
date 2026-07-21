import { create } from 'zustand';

export interface ProjectMeta {
  id: string;
  name: string;
  genre: string;
  logline?: string;
  coverColor?: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  status: string;
}

interface ProjectState {
  projects: ProjectMeta[];
  activeProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (name: string, genre: string) => Promise<ProjectMeta>;
  updateProjectMeta: (id: string, updates: Partial<ProjectMeta>) => Promise<ProjectMeta>;
  deleteProject: (id: string) => Promise<void>;
  duplicateProject: (id: string) => Promise<ProjectMeta>;
  setActiveProject: (id: string | null) => void;
  setActiveProjectId: (id: string | null) => void;
}

const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      set({ projects: data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  createProject: async (name, genre) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, genre })
      });
      if (!res.ok) throw new Error('Failed to create project');
      const newProj = await res.json();
      set(state => ({
        projects: [...state.projects, newProj],
        isLoading: false
      }));
      return newProj;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  updateProjectMeta: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update project metadata');
      const updated = await res.json();
      set(state => ({
        projects: state.projects.map(p => p.id === id ? updated : p),
        isLoading: false
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete project');
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  duplicateProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${id}/duplicate`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to duplicate project');
      const duplicate = await res.json();
      set(state => ({
        projects: [...state.projects, duplicate],
        isLoading: false
      }));
      return duplicate;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  setActiveProject: (id) => set({ activeProjectId: id }),
  setActiveProjectId: (id) => set({ activeProjectId: id })
}));

export default useProjectStore;
