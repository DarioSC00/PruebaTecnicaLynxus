import api from "../../../../axios/axios";
import axios from "axios";

export type ProjectItem = {
  id: number;
  name: string;
  description?: string;
  owner?: string;
  owner_id?: number;
  status?: string;
  created_at?: string;
  archived?: boolean;
};

export type ProjectDetail = ProjectItem;
export type ListProjectsParams = { q?: string; page?: number; page_size?: number };
export type ListProjectsResponse = { items: ProjectItem[]; total?: number };

export async function listProjects(params: ListProjectsParams = {}): Promise<ListProjectsResponse> {
  try {
    const { q = "", page = 1, page_size = 50 } = params;
    const skip = (page - 1) * page_size;
    const res = await api.get("/projects", { params: { skip, limit: page_size, search: q } });
    return { items: Array.isArray(res.data) ? res.data : [], total: Array.isArray(res.data) ? res.data.length : 0 };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("listProjects error:", err.response?.data ?? err);
      throw err.response?.data ?? err;
    }
    throw err;
  }
}

export async function getProject(id: number): Promise<ProjectDetail> {
  const res = await api.get(`/projects/${id}`);
  return res.data;
}

export async function createProject(projectData: { name: string; description?: string }) {
  const res = await api.post("/projects", projectData);
  return res.data;
}

export async function updateProject(id: number, projectData: Partial<ProjectDetail>) {
  const res = await api.put(`/projects/${id}`, projectData);
  return res.data;
}

export async function deleteProject(id: number) {
  await api.delete(`/projects/${id}`);
}