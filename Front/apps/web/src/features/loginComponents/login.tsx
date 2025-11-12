"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { login } from "../../services/userService";
import { useRouter } from "next/navigation";
import styles from "./loginPage.module.css";

// 🔹 Tipos
type FormData = { email: string; password: string };
type User = { id: number; email: string; name?: string; created_at: string };
type LoginResponse = { access_token: string; user: User };
type MutationError = { response?: { data?: { detail?: string } } };

// 🔹 Cliente de React Query (se crea una sola instancia)
const queryClient = new QueryClient();

function LoginFormInner() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const mutation = useMutation<LoginResponse, MutationError, FormData>({
    mutationFn: (data: FormData) => login(data),
    onSuccess: (data: LoginResponse) => {
      if (data?.access_token) {
        try {
          localStorage.setItem("access_token", data.access_token);
          if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        } catch {
          /* ignore */
        }
        router.replace("/projects");
      }
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit(onSubmit)}
      aria-label="login-form"
      noValidate
    >
      <h2 className={styles.title}>Login</h2>




<div className={styles.secondaryButtons}>
  <button type="button" className={styles.secondaryButton}>
    Register
  </button>
 
</div>


      <label htmlFor="email" className={styles.label}>
        Email
      </label>
      <input
        id="email"
        className={styles.input}
        type="email"
        aria-invalid={!!errors.email}
        {...register("email", { required: "Email required" })}
      />
      {errors.email && (
        <div className={styles.fieldError}>{errors.email.message}</div>
      )}

      <label htmlFor="password" className={styles.label}>
        Contraseña
      </label>
      <input
        id="password"
        className={styles.input}
        type="password"
        aria-invalid={!!errors.password}
        {...register("password", {
          required: "Password required",
          minLength: { value: 8, message: "Min. 8 characters" },
        })}
      />
      {errors.password && (
        <div className={styles.fieldError}>{errors.password.message}</div>
      )}

      <button
        type="submit"
        className={styles.button}
        disabled={mutation.isPending}
        aria-busy={mutation.isPending}
      >
        {mutation.isPending ? "Logging in..." : "Login"}
      </button>

      {mutation.isError && (
        <div role="alert" className={styles.error}>
          {mutation.error?.response?.data?.detail || "Authentication error"}
        </div>
      )}


 <button type="button" className={styles.secondaryButton}>
    Forgot password?
  </button>


    </form>


  );
}

// 🔹 Componente principal que envuelve con QueryClientProvider
export default function LoginForm() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoginFormInner />
    </QueryClientProvider>
  );
}
