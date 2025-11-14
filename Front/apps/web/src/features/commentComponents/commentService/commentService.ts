import api from "../../../../axios/axios";

export type CommentInput = { body: string };

export async function listComments(taskId: number) {
  const res = await api.get(`/tasks/${taskId}/comments`);
  return res.data;
}

export async function createComment(taskId: number, payload: CommentInput) {
  const res = await api.post(`/tasks/${taskId}/comments`, payload);
  return res.data;
}

export async function deleteComment(commentId: number) {
  const res = await api.delete(`/comments/${commentId}`);
  return res.data;
}
