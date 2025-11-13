import api from "../../../../axios/axios";
import axios from "axios";

export type UserItem = {
  id: number;
  name: string;
  email: string;
  created_at?: string;
};

export type UserDetail = UserItem & {
  projects?: Array<{ 
    id: number; 
    name: string; 
    description?: string; 
  }>;
  tasks?: Array<{ 
    id: number; 
    title: string; 
    status: 'todo' | 'doing' | 'done'; 
    priority: 'low' | 'med' | 'high';
  }>;
};

export type ListUsersParams = { q?: string; page?: number; page_size?: number };
export type ListUsersResponse = { items: UserItem[]; total?: number };

export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResponse> {
  try {
    const { q = "", page = 1, page_size = 50 } = params;
    const skip = (page - 1) * page_size;
    const res = await api.get("/users", { params: { skip, limit: page_size, search: q } });
    return { 
      items: Array.isArray(res.data) ? res.data : [], 
      total: Array.isArray(res.data) ? res.data.length : 0 
    };
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.error("listUsers error:", err.response?.data ?? err);
      throw err.response?.data ?? err;
    }
    throw err;
  }
}

export async function getUser(id: number): Promise<UserDetail> {
  const res = await api.get(`/users/${id}`);
  return res.data;
}