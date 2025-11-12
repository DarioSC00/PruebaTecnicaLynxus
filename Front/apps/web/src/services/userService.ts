import api from "../../axios/axios";

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { email: string; password: string; name?: string };

export async function login(payload: LoginPayload) {
  const res = await api.post("/auth/login", payload);
  return res.data;
}

export async function register(payload: RegisterPayload) {
  const res = await api.post("/auth/register", payload);
  return res.data;
}