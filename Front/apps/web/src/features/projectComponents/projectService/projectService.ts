import api from "../../../../axios/axios";
import type { AxiosError } from "axios";

export type ProjectItem = {
  id: number;
  name: string;
  owner?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export type ProjectDetail = ProjectItem & {
  description?: string | null;
};

export type ListParams = {
  q?: string;
  page?: number;
  page_size?: number;
};

type BackendList<T> = T[] | { items?: T[]; total?: number };

function buildBackendParams(p?: ListParams) {
  const page = p?.page ?? 1;
  const page_size = p?.page_size ?? 50;
  const skip = Math.max(0, (page - 1) * page_size);
  const limit = page_size;
  const search = p?.q ?? undefined;
  // backend espera: skip, limit, search
  return { skip, limit, search };
}

async function tryPaths<T>(paths: string[], params?: Record<string, unknown>): Promise<T> {
  let lastErr: unknown = null;
  for (const path of paths) {
    try {
      const res = await api.get<T>(path, { params });
      return res.data;
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as AxiosError)?.response?.status;
      // si es 404 prueba siguiente; si es otro error re-lanzar
      if (status && status !== 404) throw err;
    }
  }
  throw lastErr;
}

const PATH_CANDIDATES = [
  "/projects",
  "/projects/",
  "/project",
  "/project/",
  "/api/projects",
  "/api/projects/",
  "/api/project",
  "/api/project/",
];

export async function listProjects(params?: ListParams): Promise<{ items: ProjectItem[]; total?: number }> {
  const backendParams = buildBackendParams(params);
  try {
    const data = await tryPaths<BackendList<ProjectItem>>(PATH_CANDIDATES, backendParams);
    if (Array.isArray(data)) return { items: data };
    return { items: data.items ?? (data as unknown as ProjectItem[]), total: (data as { total?: number }).total };
  } catch (err: unknown) {
    // Si no encontramos la ruta en el backend, devolver lista vacía (log para depuración).
    console.warn("[projectService] listProjects: no se encontró endpoint compatible. Error:", err);
    return { items: [] };
  }
}

export async function getProject(id: number): Promise<ProjectDetail> {
  const data = await tryPaths<ProjectDetail>(PATH_CANDIDATES.map((p) => `${p}/${id}`));
  return data;
}

export async function createProject(payload: ProjectDetail) {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  return api.post("/projects", payload, { headers });
}

export async function updateProject(id: number, payload: Partial<ProjectDetail>) {
  let lastErr: unknown = null;
  for (const path of PATH_CANDIDATES.map((p) => `${p}/${id}`)) {
    try {
      const res = await api.patch<ProjectDetail>(path, payload);
      return res.data;
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as AxiosError)?.response?.status;
      if (status && status !== 404) throw err;
    }
  }
  throw lastErr;
}

export async function deleteProject(id: number) {
  let lastErr: unknown = null;
  for (const path of PATH_CANDIDATES.map((p) => `${p}/${id}`)) {
    try {
      const res = await api.delete<void>(path);
      return res.data;
    } catch (err: unknown) {
      lastErr = err;
      const status = (err as AxiosError)?.response?.status;
      if (status && status !== 404) throw err;
    }
  }
  throw lastErr;
}

export default {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};