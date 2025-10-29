import { create } from "zustand";

interface Task {
  id: string;
  title: string;
  status: "Todo" | "In Progress" | "Done";
  dueDate?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  tasks?: Task[];
}

interface ProjectStore {
  projects: Project[];
  activeProject: Project | null;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  setActiveProject: (project: Project | null) => void;
  updateTask: (projectId: string, task: Task) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  activeProject: null,
  setProjects: (projects) => set({ projects }),
  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),
  setActiveProject: (project) => set({ activeProject: project }),
  updateTask: (projectId, updatedTask) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
            ...p,
            tasks: p.tasks?.map((t) =>
              t.id === updatedTask.id ? updatedTask : t
            ),
          }
          : p
      ),
    })),
}));
