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
  const [showPassword, setShowPassword] = React.useState(false);
  
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
                <div className={styles.passwordWrapper}>
                  <input
                    id="password"
                    className={styles.input}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 6, message: "Minimum 6 characters" },
                      validate: (v: string) => {
                        const bytes = new TextEncoder().encode(v).length;
                        return bytes <= 72 || "Password too long (max 72 bytes)";
                      }
                    })}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      /* eye-off icon */
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.58 10.58A3 3 0 0113.42 13.42" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9.88 5.94A15.72 15.72 0 0121 12c-1.21 2.1-3.05 3.85-5.2 4.95" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14.12 18.06A15.72 15.72 0 013 12c1.21-2.1 3.05-3.85 5.2-4.95" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      /* eye icon */
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <span id="password-error" className={styles.fieldError}>{errors.password.message}</span>}
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