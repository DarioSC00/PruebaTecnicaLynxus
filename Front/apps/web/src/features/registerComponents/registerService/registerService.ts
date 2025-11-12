import api from "../../../../axios/axios";
import axios from "axios";

export type RegisterPayload = {
  email: string;
  name: string;
  password: string;
};

export async function registerWithEmail(payload: RegisterPayload): Promise<Record<string, unknown>> {
  try {
    const res = await api.post("/users/register", payload);
    return res.data as Record<string, unknown>;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      throw err.response?.data ?? err;
    }
    throw err;
  }
}