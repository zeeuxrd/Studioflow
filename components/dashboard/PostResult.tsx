"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, Send } from "lucide-react";
import type { Post, Product } from "./types";
import styles from "@/app/dashboard/dashboard.module.css";

interface PostResultProps {
  post: Post;
  product: Product | undefined;
  activePostId: string | null;
  isProductizing: string | null;
  onToggleProductize: (postId: string) => void;
  onProductize: (postId: string, productType: string) => void;
  onPublish: (productId: string) => void;
  isPublishing: string | null;
  isCrafting?: boolean;
}

const PRODUCT_TYPES = ["ebook", "checklist", "course", "template"];

export default function PostResult({
  post,
  product,
  activePostId,
  isProductizing,
  onToggleProductize,
  onProductize,
  onPublish,
  isPublishing,
  isCrafting,
}: PostResultProps) {
  const [copied, setCopied] = useState(false);
  const displayContent = post.content_body;

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(displayContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // fallback
    }
  };

  return (
    <div className={styles.postResult}>
      <div className={styles.postResultHeader}>
        <div className={styles.platformTitle}>Generated {post.platform_type} Post:</div>
        <button className={styles.copyBtn} onClick={handleCopy} title="Copy content">
          {copied ? <><Check size={14} /><span style={{ marginLeft: 4 }}>Copied!</span></> : <Copy size={14} />}
        </button>
      </div>
      
      {/* Conversational timeline for posts */}
      {(!post.refinement_history || post.refinement_history.length === 0) && !isCrafting ? (
        <div className={styles.postBody}>{post.content_body}</div>
      ) : (
        <div className={styles.chatThread} style={{ marginBottom: "20px" }}>
          {/* Turn 0: Original Post */}
          <div className={styles.chatMessageAgent}>
            <div className={styles.chatMessageHeader}>
              <span>ContentCrafter (Original)</span>
            </div>
            <div style={{ whiteSpace: "pre-wrap" }}>{post.content_body}</div>
          </div>

          {/* Turn 1+: Refinements */}
          {post.refinement_history && post.refinement_history.map((ref, idx) => (
            <div key={idx} style={{ display: "contents" }}>
              {/* User Instruction */}
              <div className={styles.chatMessageUser}>
                {ref.instruction}
              </div>

              {/* AI Response */}
              <div className={styles.chatMessageAgent}>
                <div className={styles.chatMessageHeader}>
                  <span>ContentCrafter (Rev. {idx + 1})</span>
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{ref.content}</div>
              </div>
            </div>
          ))}

          {/* Turn Active: Agent Writing Bubble */}
          {isCrafting && (
            <div className={styles.chatMessageAgent} style={{ opacity: 0.8 }}>
              <div className={styles.chatMessageHeader}>
                <span>ContentCrafter is writing...</span>
              </div>
              <div className={styles.loadingText} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={styles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px', margin: 0 }}></span>
                <span>Thinking...</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.postMeta}>
        Predicted Engagement: {Math.round((typeof post.engagement_prediction_score === 'number' && !isNaN(post.engagement_prediction_score) ? post.engagement_prediction_score : 0.85) * 100)}% Match
      </div>
    </div>
    </div>
  );
}
