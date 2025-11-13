import api from "../../../../axios/axios";
import axios from "axios";

export type ProjectItem = { id: number; name: string; description?: string; created_at?: string };
export type ProjectDetail = ProjectItem & {
  owner_id?: number;
  owner?: string | { id: number; name?: string; email?: string };
  archived?: boolean;
  status?: string;
  tasks?: Array<{
    id: number;
    title: string;
    status?: "todo" | "doing" | "done";
    priority?: "low" | "med" | "high";
    due_date?: string | null;
  }>;
};

// Nuevo: tipo para crear proyecto (formularios)
export type CreateProjectInput = {
  name: string;
  description?: string;
  owner?: string | number;
  status?: string;
};

// Opciones públicas de estado (si quieres centralizarlas)
export const STATUS_OPTIONS: string[] = ["active", "archived", "planned"];

// Nuevo: crear proyecto
export async function createProject(payload: CreateProjectInput) {
  try {
    const res = await api.post("/projects", payload);
    return res.data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("createProject error:", err.response?.status, err.response?.data);
      throw err.response?.data ?? err;
    }
    throw err;
  }
}

export async function listProjects(params: { q?: string; page?: number; page_size?: number } = {}) {
  try {
    const { q = "", page = 1, page_size = 50 } = params;
    const res = await api.get("/projects", { params: { search: q, page, page_size } });
    console.log("listProjects response:", res.status);
    return { items: Array.isArray(res.data) ? res.data : [], total: Array.isArray(res.data) ? res.data.length : 0 };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      console.error("listProjects error:", status, err.response?.data);
      if (status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
      return { items: [], total: 0 };
    }
    throw err;
  }
}

export async function getProject(id: number): Promise<ProjectDetail> {
  try {
    const res = await api.get(`/projects/${id}`);
    console.log("getProject response:", res.status);
    return res.data as ProjectDetail;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      console.error("getProject error:", status, err.response?.data);
      if (status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
      throw err.response?.data ?? err;
    }
    throw err;
  }
}