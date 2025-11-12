"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { loginWithEmail as login } from "./loginService/loginService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./loginPage.module.css";
import { toast } from "react-toastify";

type FormData = { email: string; password: string };
type User = { id: number; email: string; name?: string; created_at?: string };
type LoginResponse = { access_token?: string; user?: User } | Record<string, unknown>;
type MutationError = { response?: { data?: { detail?: string } }; message?: string };

const queryClient = new QueryClient();

function LoginFormInner() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [serverError, setServerError] = useState<string | null>(null);

  const mutation = useMutation<LoginResponse, MutationError, FormData>({
    mutationFn: async (data: FormData): Promise<LoginResponse> => {
      const res = await login({ email: data.email, password: data.password });
      return res as LoginResponse;
    },
    onSuccess: () => {
      toast.success("Login successful!");
      router.replace("/projects");
    },
    onError: (err) => {
      const message = err?.response?.data?.detail ?? err?.message ?? "Authentication error";
      setServerError(message);
      toast.error(message);
    },
  });

  function hasIsLoadingField(x: unknown): x is { isLoading: boolean } {
    return (
      typeof x === "object" &&
      x !== null &&
      Object.prototype.hasOwnProperty.call(x, "isLoading") &&
      typeof (x as { isLoading: unknown }).isLoading === "boolean"
    );
  }
  const _status = (mutation as unknown as { status?: string }).status;
  const isLoading = hasIsLoadingField(mutation) ? mutation.isLoading : _status === "loading" || _status === "pending";

  const onSubmit: SubmitHandler<FormData> = (data) => {
    setServerError(null);
    mutation.mutate(data);
  };

  return (
    <main className={styles.page}>
      <div className={styles.bgTexture} aria-hidden />
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          <div className={styles.brandWrapper}>
            <svg className={styles.logo} viewBox="0 0 60 60" aria-hidden>
              <defs>
                <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={styles.logoStop1} />
                  <stop offset="100%" className={styles.logoStop2} />
                </linearGradient>
              </defs>
              <rect width="60" height="60" rx="14" className={styles.logoRect} />
              <path d="M18 38 L30 22 L42 38" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <div>
              <h1 className={styles.appTitle}>Lynxus Task</h1>
              <p className={styles.appSubtitle}>Manage projects and tasks effortlessly</p>
            </div>
          </div>
          <div className={styles.illustration}>
            <svg viewBox="0 0 400 300" className={styles.illustrationSvg} role="img" aria-hidden>
              <rect x="50" y="80" width="140" height="160" rx="8" className={styles.illRect1} />
              <rect x="210" y="50" width="140" height="190" rx="8" className={styles.illRect2} />
              <circle cx="120" cy="140" r="18" className={styles.illCircle1} />
              <circle cx="280" cy="120" r="18" className={styles.illCircle2} />
            </svg>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>Sign in to your account to continue</p>

            {serverError && (
              <div role="alert" className={styles.errorAlert}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">Email address</label>
                <input
                  id="email"
                  className={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && <span className={styles.fieldError}>{errors.email.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="password">Password</label>
                <input
                  id="password"
                  className={styles.input}
                  type="password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                />
                {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
              </div>

              <button type="submit" className={styles.submitButton} disabled={isLoading} aria-busy={isLoading}>
                {isLoading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className={styles.signupPrompt}>
                Don&apos;t have an account? <Link href="/register" className={styles.signupLink}>Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginForm() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoginFormInner />
    </QueryClientProvider>
  );
}
