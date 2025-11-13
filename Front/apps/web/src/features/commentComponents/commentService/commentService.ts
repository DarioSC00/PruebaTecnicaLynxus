import api from "../../../../axios/axios";

export type UserItem = {
  id: number;
  name?: string;
  email?: string;
};

export type CommentItem = {
  id: number;
  body: string;
  task_id: number;
  author_id: number;
  author?: UserItem;
  created_at?: string;
};

export type CreateCommentInput = {
  body: string;
};

/**
 * Listar comentarios de una tarea
 */
export async function listComments(taskId: number): Promise<CommentItem[]> {
  try {
    const response = await api.get(`/tasks/${taskId}/comments`);
    console.log("[commentService] listComments response:", response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("[commentService] listComments error:", error);
    throw error;
  }
}

/**
 * Crear comentario en una tarea
 */
export async function createComment(taskId: number, data: CreateCommentInput): Promise<CommentItem> {
  try {
    const response = await api.post(`/tasks/${taskId}/comments`, data);
    console.log("[commentService] createComment response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[commentService] createComment error:", error);
    throw error;
  }
}

/**
 * Eliminar comentario (solo el autor puede eliminar)
 */
export async function deleteComment(commentId: number): Promise<void> {
  try {
    await api.delete(`/comments/${commentId}`);
    console.log("[commentService] deleteComment success");
  } catch (error) {
    console.error("[commentService] deleteComment error:", error);
    throw error;
  }
}
