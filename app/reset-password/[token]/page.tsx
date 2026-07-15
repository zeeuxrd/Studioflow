"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "../reset-password.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Set New Password</h1>
        {!success ? (
          <>
            <p className={styles.subtitle}>Choose a new password for your account.</p>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="password">New Password</label>
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                />
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className={styles.success}>Password reset successfully!</p>
            <p className={styles.footer}>
              <Link href="/signin" className={styles.link}>Sign in with your new password</Link>
            </p>
          </>
        )}
        {!success && (
          <p className={styles.footer}>
            <Link href="/signin" className={styles.link}>Back to sign in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
