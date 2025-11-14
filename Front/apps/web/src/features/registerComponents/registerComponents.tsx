"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerWithEmail } from "./registerService/registerService";
import styles from "./registerPage.module.css";
import { toast } from "react-toastify";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
};

export default function Register() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const domFormData = new FormData(form); // DOM FormData
    const payload: RegisterFormData = {
      name: domFormData.get("name") as string,
      email: domFormData.get("email") as string,
      password: domFormData.get("password") as string,
    };

    try {
      await registerWithEmail(payload);
      toast.success("Registration successful! Welcome to Lynxus Task.");
      // redirigir a la sección de usuarios
      router.push("/user");
    } catch (err: unknown) {
      // extraer mensaje de forma segura sin usar `any`
      const detail =
        typeof err === "object" && err !== null && "response" in err
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (err as any).response?.data?.detail
          : undefined;
      const message = detail ?? (err instanceof Error ? err.message : String(err));
      const errorMessage = message || "Registration error";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

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

            <form onSubmit={onSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  className={styles.input}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  className={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  className={styles.input}
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? "Registering..." : "Sign up"}
              </button>

              {error && <p role="alert" className={styles.errorMessage}>{error}</p>}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}