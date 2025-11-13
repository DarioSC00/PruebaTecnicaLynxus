import api from "../../../../axios/axios";
import axios from "axios";

export type UserItem = { id: number; name?: string; email?: string };
export type CommentItem = { id: number; body: string; author?: UserItem; created_at?: string };
export type TaskItem = {
  id: number;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string | null;
  assignee?: UserItem | null;
  comments?: CommentItem[];
};
export type ProjectDetail = {
  id: number;
  name: string;
  description?: string;
  archived?: boolean;
  owner?: UserItem | null;
  owner_id?: number;
  tasks?: TaskItem[];
};
export type ProjectItem = { 
  id: number; 
  name: string; 
  description?: string; 
  status?: string;
  created_at?: string;
};
export type CreateProjectInput = {
  name: string;
  description?: string;
  owner?: string | number;
  status?: string;
};

// paginación estándar
export type Paged<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
};

export const STATUS_OPTIONS: string[] = ["active", "archived", "planned"];

export async function getProject(id: number): Promise<ProjectDetail> {
  try {
    const res = await api.get(`/projects/${id}`);
    console.log("[projectService] getProject response:", res.status, res.data);
    return res.data as ProjectDetail;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      console.error("[projectService] getProject error:", status, err.response?.data);
      if (status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
      throw err.response?.data ?? err;
    }
    console.error("[projectService] getProject unknown error:", err);
    throw err;
  }
}

// listProjects - el backend devuelve array directo List[ProjectResponse]
export async function listProjects(params: { q?: string; page?: number; page_size?: number } = {}): Promise<{ items: ProjectItem[]; total: number }> {
  try {
    const { q = "", page = 1, page_size = 50 } = params;
    const skip = (page - 1) * page_size;
    const res = await api.get("/projects/", { params: { search: q, skip, limit: page_size } });
    console.log("[projectService] listProjects response:", res.status, res.data);
    
    // El backend devuelve array directo
    const items = Array.isArray(res.data) ? res.data : [];
    return { items, total: items.length };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("[projectService] listProjects error:", err.response?.status, err.response?.data);
      if (err.response?.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
      return { items: [], total: 0 };
    }
    console.error("[projectService] listProjects unknown error:", err);
    return { items: [], total: 0 };
  }
}

export async function createProject(payload: CreateProjectInput) {
  // usa la instancia api ya importada en este archivo
  const res = await api.post("/projects", payload);
  return res.data;
}