import api from "../../../../axios/axios";
import axios from "axios";

export type LoginResponse = {
  access_token?: string;
  token_type?: string;
  user?: Record<string, unknown>;
};

export async function loginWithEmail(email: string, password: string): Promise<LoginResponse> {
  try {
    const res = await api.post("/users/login/email", { email, password });
    const data = res.data as LoginResponse;

    // opcional: guardar token en localStorage (sin setAuthToken)
    if (typeof window !== "undefined" && data?.access_token) {
      localStorage.setItem("token", data.access_token);
    }

    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data ?? err;
    }
    throw err;
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

export async function getUsers(skip = 0, limit = 20, search?: string): Promise<Record<string, unknown>[]> {
  try {
    const params: Record<string, string | number> = { skip, limit };
    if (search) params.search = search;
    const res = await api.get("/users", { params });
    return res.data as Record<string, unknown>[];
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data ?? err;
    }
    throw err;
  }
}

export async function getUserById(userId: string | number): Promise<Record<string, unknown>> {
  try {
    const res = await api.get(`/users/${userId}`);
    return res.data as Record<string, unknown>;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data ?? err;
    }
    throw err;
  }
}