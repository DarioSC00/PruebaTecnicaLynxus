import api from "../../../../axios/axios";
import axios from "axios";

export type User = {
  id: number;
  email: string;
  name?: string;
  created_at?: string;
};

export type LoginResponse = {
  access_token: string;
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export async function loginWithEmail(payload: LoginPayload): Promise<LoginResponse> {
  try {
    const res = await api.post("/users/login/email", payload);
    return res.data as LoginResponse;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data ?? err;
    }
    throw err;
  }
}