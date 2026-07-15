"use client";

import { Sparkles } from "lucide-react";
import styles from "@/app/dashboard/dashboard.module.css";

const TONES = ["casual", "professional", "educational"] as const;

interface IdeaFormProps {
  niche: string;
  tone: "casual" | "professional" | "educational";
  isGenerating: boolean;
  error: string | null;
  onNicheChange: (value: string) => void;
  onToneChange: (value: "casual" | "professional" | "educational") => void;
  onGenerate: () => void;
}

export default function IdeaForm({
  niche,
  tone,
  isGenerating,
  error,
  onNicheChange,
  onToneChange,
  onGenerate,
}: IdeaFormProps) {
  return (
    <div>
      <div className={styles.inputGroup}>
        <label className={styles.label}>Your Niche</label>
        <input
          type="text"
          className={styles.input}
          placeholder="e.g. AI for Beginners, Personal Finance for Gen Z..."
          value={niche}
          onChange={(e) => onNicheChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && niche.trim() && !isGenerating) {
              onGenerate();
            }
          }}
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Tone of Voice</label>
        <div className={styles.toneSelector}>
          {TONES.map((t) => (
            <button
              key={t}
              className={`${styles.tonePill} ${tone === t ? styles.tonePillActive : ""}`}
              onClick={() => onToneChange(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button
        className={styles.generateBtn}
        onClick={onGenerate}
        disabled={!niche.trim() || isGenerating}
      >
        {isGenerating ? "Generating..." : <>Generate Ideas <Sparkles size={16} /></>}
      </button>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
