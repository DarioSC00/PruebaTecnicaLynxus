import api from "../../../../axios/axios";

export type StatusType = "todo" | "doing" | "done";
export type PriorityType = "low" | "med" | "high";

export type UserItem = {
  id: number;
  name?: string;
  email?: string;
};

export type TaskItem = {
  id: number;
  title: string;
  description?: string;
  status: StatusType;
  priority: PriorityType;
  due_date?: string | null;
  assignee_id?: number | null;
  project_id: number;
  created_at?: string;
  updated_at?: string;
};

export type TaskDetail = TaskItem & {
  assignee?: UserItem | null;
  comments?: CommentItem[];
};

export type CommentItem = {
  id: number;
  body: string;
  author?: UserItem;
  created_at?: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  status?: StatusType;
  priority?: PriorityType;
  due_date?: string | null;
  assignee_id?: number | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;

export type ListTasksParams = {
  project_id?: number;
  q?: string;
  status?: StatusType;
  priority?: PriorityType;
  overdue?: boolean;
  skip?: number;
  limit?: number;
};

// Opciones para los selects
export const STATUS_OPTIONS: { value: StatusType; label: string; color: string }[] = [
  { value: "todo", label: "Por hacer", color: "#fef3c7" },
  { value: "doing", label: "En progreso", color: "#dbeafe" },
  { value: "done", label: "Completado", color: "#d1fae5" },
];

export const PRIORITY_OPTIONS: { value: PriorityType; label: string; color: string }[] = [
  { value: "low", label: "Baja", color: "#e5e7eb" },
  { value: "med", label: "Media", color: "#fef3c7" },
  { value: "high", label: "Alta", color: "#fee2e2" },
];

/**
 * Listar tareas (con filtros opcionales)
 */
export async function listTasks(params: ListTasksParams = {}): Promise<{ items: TaskItem[]; total: number }> {
  try {
    const { project_id, q, status, priority, overdue, skip = 0, limit = 50 } = params;
    
    // Si hay project_id, usar ruta de proyecto
    const url = project_id ? `/projects/${project_id}/tasks` : `/tasks/`;
    
    const response = await api.get(url, {
      params: {
        search: q || undefined,
        status: status || undefined,
        priority: priority || undefined,
        overdue: overdue || undefined,
        skip,
        limit,
      },
    });

    console.log("[taskService] listTasks response:", response.data);

    const payload = response.data;
    
    // El backend puede devolver array directo o formato paginado
    if (Array.isArray(payload)) {
      return { items: payload, total: payload.length };
    }
    
    return {
      items: payload.items || [],
      total: payload.total || 0,
    };
  } catch (error) {
    console.error("[taskService] listTasks error:", error);
    throw error;
  }
}

/**
 * Obtener detalle de una tarea
 */
export async function getTask(taskId: number): Promise<TaskDetail> {
  try {
    const response = await api.get(`/tasks/${taskId}`);
    console.log("[taskService] getTask response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[taskService] getTask error:", error);
    throw error;
  }
}

/**
 * Crear tarea en un proyecto
 */
export async function createTask(projectId: number, data: CreateTaskInput): Promise<TaskItem> {
  try {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    console.log("[taskService] createTask response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[taskService] createTask error:", error);
    throw error;
  }
}

/**
 * Actualizar tarea
 */
export async function updateTask(taskId: number, data: UpdateTaskInput): Promise<TaskItem> {
  try {
    const response = await api.put(`/tasks/${taskId}`, data);
    console.log("[taskService] updateTask response:", response.data);
    return response.data;
  } catch (error) {
    console.error("[taskService] updateTask error:", error);
    throw error;
  }
}

/**
 * Eliminar tarea
 */
export async function deleteTask(taskId: number): Promise<void> {
  try {
    await api.delete(`/tasks/${taskId}`);
    console.log("[taskService] deleteTask success");
  } catch (error) {
    console.error("[taskService] deleteTask error:", error);
    throw error;
  }
}
