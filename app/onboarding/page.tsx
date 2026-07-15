"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./onboarding.module.css";

const TONES = [
  { value: "casual", label: "Casual" },
  { value: "professional", label: "Professional" },
  { value: "educational", label: "Educational" },
] as const;

const PLATFORMS = [
  { value: "X", label: "Twitter / X" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Instagram", label: "Instagram" },
  { value: "TikTok", label: "TikTok" },
] as const;

const GOALS = [
  { value: "grow_audience", label: "Grow my audience" },
  { value: "make_money", label: "Make money" },
  { value: "stay_consistent", label: "Stay consistent" },
] as const;

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    return () => document.documentElement.removeAttribute("data-theme");
  }, []);
  const [step, setStep] = useState(1);
  const [niche, setNiche] = useState("");
  const [nicheError, setNicheError] = useState("");
  const [tone, setTone] = useState<string>("casual");
  const [platform, setPlatform] = useState<string>("X");
  const [goal, setGoal] = useState<string>("grow_audience");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!session) {
    return (
      <div className={styles.container}>
        <p>Please sign in first.</p>
      </div>
    );
  }

  if (session.user.niche) {
    router.push("/dashboard");
    return null;
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setNicheError("");
    if (!niche.trim()) {
      setNicheError("Field cannot be empty");
      return;
    }
    setStep(2);
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setStep(3);
  }

  async function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/auth/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        niche,
        tone_preference: tone,
        platform_focus: platform,
        monetization_goal: goal,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setIsLoading(false);
      return;
    }

    await update();
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <p className={styles.stepIndicator}>Step {step}/3</p>

        {step === 1 && (
          <>
            <h1 className={styles.title}>What's your niche?</h1>
            <p className={styles.subtitle}>What do you create content about?</p>
            <form className={styles.form} onSubmit={handleStep1} noValidate>
              <div className={styles.inputGroup}>
                <input
                  id="niche"
                  type="text"
                  className={`${styles.input} ${niche.trim() ? styles.inputFilled : ''} ${nicheError ? styles.inputError : ''}`}
                  placeholder="e.g. AI for Beginners, Personal Finance for Gen Z..."
                  value={niche}
                  onChange={(e) => { setNiche(e.target.value); setNicheError(""); }}
                  onBlur={() => { if (!niche.trim()) setNicheError("this field cannot be empty"); }}
                  required
                  autoFocus
                />
                {nicheError && <p className={styles.fieldError}>{nicheError}</p>}
              </div>
              <button type="submit" className={styles.arrowBtn}>Next</button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className={styles.title}>How do you want to sound?</h1>
            <p className={styles.subtitle}>Pick your tone and primary platform</p>
            <form className={styles.form} onSubmit={handleStep2} noValidate>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Tone of voice</label>
                <div className={styles.pillGroup}>
                  {TONES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      className={`${styles.pill} ${tone === t.value ? styles.pillActive : ""}`}
                      onClick={() => setTone(t.value)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Primary platform</label>
                <div className={styles.pillGroup}>
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      className={`${styles.pill} ${platform === p.value ? styles.pillActive : ""}`}
                      onClick={() => setPlatform(p.value)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className={styles.arrowBtn}>Next</button>
              <button type="button" className={styles.backBtn} onClick={() => setStep(1)}>&larr; Back</button>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className={styles.title}>What's your main goal?</h1>
            <p className={styles.subtitle}>This helps us tailor suggestions for you</p>
            <form className={styles.form} onSubmit={handleStep3} noValidate>
              <div className={styles.pillGroupVertical}>
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    className={`${styles.goalPill} ${goal === g.value ? styles.goalPillActive : ""}`}
                    onClick={() => setGoal(g.value)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              {error && <p className={styles.error}>{error}</p>}
              <button type="submit" className={styles.arrowBtn} disabled={isLoading}>
                {isLoading ? "Setting up..." : "Get Started"}
              </button>
              <button type="button" className={styles.backBtn} onClick={() => setStep(2)}>&larr; Back</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
