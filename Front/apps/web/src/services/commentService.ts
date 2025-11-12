import api from "../../axios/axios";

export async function getComments(taskId: number) {
  const res = await api.get(`/tasks/${taskId}/comments`);
  return res.data;
}

export async function createComment(taskId: number, payload: { body: string }) {
  const res = await api.post(`/tasks/${taskId}/comments`, payload);
  return res.data;
}