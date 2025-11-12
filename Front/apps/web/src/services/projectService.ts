import api from "../../axios/axios";

export async function getProjects(params: { page?: number; page_size?: number; search?: string } = {}) {
  const res = await api.get("/projects", { params });
  return res.data; // { items, total, page, page_size }
}

export async function createProject(payload: { name: string; description?: string }) {
  const res = await api.post("/projects", payload);
  return res.data;
}