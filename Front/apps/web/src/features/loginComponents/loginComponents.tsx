"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail } from "./loginService/loginService";
import styles from "./loginPage.module.css";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginWithEmail({ email, password });

      // Guardar token
      localStorage.setItem("access_token", response.access_token);

      // Redirigir a la vista protegida
      router.push("/user");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
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

            {error && (
              <div role="alert" className={styles.errorAlert}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  className={styles.input}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? (
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
