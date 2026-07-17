"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Circle } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./signup.module.css";

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailFormatError, setEmailFormatError] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setNameError("");
    if (!name.trim()) {
      setNameError("Field cannot be empty");
      return;
    }
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setEmailError("");
    if (!email.trim()) {
      setEmailError("Field cannot be empty");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailFormatError(true);
      return;
    }
    setStep(3);
  }

  async function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setConfirmPasswordError("");
    setError("");
    setIsLoading(true);

    try {
      let hasError = false;

      if (!password.trim()) {
        setPasswordError("Field cannot be empty");
        hasError = true;
      }

      if (!confirmPassword.trim()) {
        setConfirmPasswordError("Field cannot be empty");
        hasError = true;
      }

      if (hasError) {
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        setIsLoading(false);
        return;
      }

      if (!/[A-Z]/.test(password)) {
        setError("Password must contain an uppercase letter");
        setIsLoading(false);
        return;
      }

      if (!/[a-z]/.test(password)) {
        setError("Password must contain a lowercase letter");
        setIsLoading(false);
        return;
      }

      if (!/[0-9]/.test(password)) {
        setError("Password must contain a number");
        setIsLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong");
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created. Please sign in manually.");
        router.push("/signin");
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>


        {step === 1 && (
          <>
            <h1 className={styles.title}>What's your name?</h1>
            <p className={styles.subtitle}>We'll use this to personalize your experience</p>
            <form className={styles.form} onSubmit={handleStep1} noValidate>
            <div className={styles.inputGroup}>
              <input
                id="name"
                type="text"
                className={`${styles.input} ${name.trim() ? styles.inputFilled : ''} ${nameError ? styles.inputError : ''}`}
                placeholder=""
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(""); }}
                onBlur={() => { if (!name.trim()) setNameError("this field cannot be empty"); }}
                required
                autoFocus
              />
              {nameError && <p className={styles.fieldError}>{nameError}</p>}
            </div>
            <button type="submit" className={styles.arrowBtn}>Next</button>
          </form>

          </>
        )}

        {step === 2 && (
          <>
            <h1 className={styles.title}>What's your email?</h1>
            <p className={styles.subtitle}>We'll send you a confirmation once you're in</p>
            <form className={styles.form} onSubmit={handleStep2} noValidate>
            <div className={styles.inputGroup}>
              <input
                id="email"
                type="email"
                className={`${styles.input} ${email.trim() ? styles.inputFilled : ''} ${emailError || emailFormatError ? styles.inputError : ''}`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  setEmailError("");
                  if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    setEmailFormatError(true);
                  } else {
                    setEmailFormatError(false);
                  }
                }}
                onBlur={() => { if (!email.trim()) setEmailError("this field cannot be empty"); }}
                required
                autoFocus
              />
              {emailFormatError && <p className={styles.fieldError}>Enter a valid email address</p>}
              {emailError && <p className={styles.fieldError}>{emailError}</p>}
            </div>
            <button type="submit" className={styles.arrowBtn}>Next</button>
            <button type="button" className={styles.backBtn} onClick={() => { setStep(1); setError(""); }}><ArrowLeft size={14} /> Back</button>
          </form>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className={styles.title}>Pick a password</h1>
            <p className={styles.subtitle}>Make it strong — at least 6 characters</p>
            <form className={styles.form} onSubmit={handleStep3} noValidate>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={`${styles.input} ${styles.inputPassword} ${password.trim() ? styles.inputFilled : ''} ${passwordError ? styles.inputError : ''}`}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
                  onBlur={() => { if (!password.trim()) setPasswordError("this field cannot be empty"); }}
                  required
                  minLength={8}
                  autoFocus
                />
                <button
                  type="button"
                  className={styles.visibilityToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && (
                <ul className={styles.requirements}>
                  {password.length < 8 && (
                    <li className={styles.unmet}><Circle size={12} /> At least 8 characters</li>
                  )}
                  {password.length >= 8 && !/[A-Z]/.test(password) && (
                    <li className={styles.unmet}><Circle size={12} /> One uppercase letter</li>
                  )}
                  {password.length >= 8 && /[A-Z]/.test(password) && !/[a-z]/.test(password) && (
                    <li className={styles.unmet}><Circle size={12} /> One lowercase letter</li>
                  )}
                  {password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && !/[0-9]/.test(password) && (
                    <li className={styles.unmet}><Circle size={12} /> One number</li>
                  )}
                </ul>
              )}
              {passwordError && <p className={styles.fieldError}>{passwordError}</p>}
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm password</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`${styles.input} ${styles.inputPassword} ${confirmPassword.trim() ? styles.inputFilled : ''} ${confirmPasswordError ? styles.inputError : ''}`}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setConfirmPasswordError(""); }}
                  onBlur={() => { if (!confirmPassword.trim()) setConfirmPasswordError("this field cannot be empty"); }}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className={styles.visibilityToggle}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPasswordError && <p className={styles.fieldError}>{confirmPasswordError}</p>}
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.arrowBtn} disabled={isLoading}>
              {isLoading ? "Creating my account..." : "Create my account"}
            </button>
            <button type="button" className={styles.backBtn} onClick={() => { setStep(2); setError(""); }}><ArrowLeft size={14} /> Back</button>
          </form>
          </>
        )}

        <p className={styles.footer}>
          Already have an account?{" "}
          <Link href="/signin" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
