"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import styles from "./registerPage.module.css";
import { registerWithEmail } from "./registerService/registerService";

type FormData = {
  name: string;
  email: string;
  password: string;
};

export default function Register() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();
  
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await registerWithEmail({ name: data.name, email: data.email, password: data.password });
      toast.success("Account created successfully");
      router.replace("/login");
    } catch (err: unknown) {
      // extraer mensaje de forma segura sin usar `any`
      const getMessage = (e: unknown): string | undefined => {
        if (typeof e !== "object" || e === null) return undefined;
        const obj = e as Record<string, unknown>;
        const resp = obj.response as Record<string, unknown> | undefined;
        const data = resp?.data as Record<string, unknown> | undefined;
        if (typeof data?.detail === "string") return data.detail;
        if (typeof obj.message === "string") return obj.message;
        return undefined;
      };
      const finalMsg = getMessage(err) ?? "Registration error";
      toast.error(finalMsg);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.bgTexture} aria-hidden />
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          <div className={styles.brandWrapper}>
            <svg className={styles.logo} viewBox="0 0 60 60" aria-hidden>
              <defs>
                <linearGradient id="logoGradReg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={styles.logoStop1} />
                  <stop offset="100%" className={styles.logoStop2} />
                </linearGradient>
              </defs>
              <rect width="60" height="60" rx="14" className={styles.logoRect} />
              <path d="M18 38 L30 22 L42 38" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <div>
              <h1 className={styles.appTitle}>Lynxus Task</h1>
              <p className={styles.appSubtitle}>Create your account and start organizing</p>
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
            <h2 className={styles.formTitle}>Create account</h2>
            <p className={styles.formSubtitle}>Sign up to start managing your projects</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">Full name</label>
                <input
                  id="name"
                  className={styles.input}
                  placeholder="Your name"
                  {...register("name", { required: "Name is required" })}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <span className={styles.fieldError}>{errors.name.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">Email address</label>
                <input
                  id="email"
                  className={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  {...register("email", { required: "Email is required" })}
                  aria-invalid={!!errors.email}
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
                  {...register("password", { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
                  aria-invalid={!!errors.password}
                />
                {errors.password && <span className={styles.fieldError}>{errors.password.message}</span>}
              </div>

              <button type="submit" className={styles.submitButton} disabled={isSubmitting} aria-busy={isSubmitting}>
                {isSubmitting ? <span className={styles.spinner}></span> : "Create account"}
              </button>

              <div className={styles.signupPrompt}>
                Already have an account? <Link href="/login" className={styles.signupLink}>Sign in</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}