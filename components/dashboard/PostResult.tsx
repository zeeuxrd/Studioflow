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
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
        Predicted Engagement: {Math.round(post.engagement_prediction_score * 100)}% Match
      </div>

      {!product && (
        <div className={styles.actionRow}>
          <button
            className={styles.secondaryBtn}
            onClick={() => onToggleProductize(post.post_id)}
            disabled={isProductizing === post.post_id}
          >
            {isProductizing === post.post_id
              ? "Alchemizing..."
              : <>Turn into Digital Product <Sparkles size={16} /></>}
          </button>
        </div>
      )}

      {activePostId === post.post_id && !product && (
        <div className={styles.platformDropdown}>
          <p className={styles.platformTitle}>Select Product Type:</p>
          <div className={styles.platformButtons}>
            {PRODUCT_TYPES.map((type) => (
              <button
                key={type}
                className={styles.platformBtn}
                onClick={() => onProductize(post.post_id, type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {product && (
        <div className={styles.premiumProductCard}>
          <div className={styles.premiumHeader}>
            <span className={styles.premiumBadge}>Premium {product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1)}</span>
            <span className={styles.premiumPrice}>&#8358;{(product.monetization_price_suggestion / 100).toLocaleString()} Est. Value</span>
          </div>

          {/* Conversational timeline for products */}
          {(!product.refinement_history || product.refinement_history.length === 0) && isProductizing !== product.source_post_id ? (
            <>
              <h3 className={styles.premiumTitle}>{product.title}</h3>
              <div className={styles.premiumStructure}>
                <pre>{JSON.stringify(product.content_structure, null, 2)}</pre>
              </div>
            </>
          ) : (
            <div className={styles.chatThread} style={{ marginBottom: "20px" }}>
              {/* Turn 0: Original Product */}
              <div className={styles.chatMessageAgent}>
                <div className={styles.chatMessageHeader}>
                  <span>ProductAlchemist (Original)</span>
                </div>
                <h3 className={styles.premiumTitle} style={{ fontSize: "14px", margin: "4px 0 8px 0" }}>{product.title}</h3>
                <div className={styles.premiumStructure}>
                  <pre>{JSON.stringify(product.content_structure, null, 2)}</pre>
                </div>
              </div>

              {/* Turn 1+: Refinements */}
              {product.refinement_history && product.refinement_history.map((ref, idx) => (
                <div key={idx} style={{ display: "contents" }}>
                  {/* User Instruction */}
                  <div className={styles.chatMessageUser}>
                    {ref.instruction}
                  </div>

                  {/* AI Response */}
                  <div className={styles.chatMessageAgent}>
                    <div className={styles.chatMessageHeader}>
                      <span>ProductAlchemist (Rev. {idx + 1}) - &#8358;{(ref.monetization_price_suggestion / 100).toLocaleString()}</span>
                    </div>
                    <h3 className={styles.premiumTitle} style={{ fontSize: "14px", margin: "4px 0 8px 0" }}>{ref.title}</h3>
                    <div className={styles.premiumStructure}>
                      <pre>{JSON.stringify(ref.content_structure, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              ))}

              {/* Turn Active: Agent Thinking Bubble */}
              {isProductizing === product.source_post_id && (
                <div className={styles.chatMessageAgent} style={{ opacity: 0.8 }}>
                  <div className={styles.chatMessageHeader}>
                    <span>ProductAlchemist is thinking...</span>
                  </div>
                  <div className={styles.loadingText} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={styles.spinner} style={{ width: '16px', height: '16px', borderWidth: '2px', margin: 0 }}></span>
                    <span>Alchemizing outline...</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className={styles.postMeta}>* This is an estimate. Actual earnings may vary.</div>
          <div className={styles.actionRow}>
            <button
              className={`${styles.secondaryBtn} ${styles.generateBtn}`}
              onClick={() => onPublish(product.product_id)}
              disabled={isPublishing === product.product_id}
            >
              {isPublishing === product.product_id
                ? "Publishing..."
                : "Publish & Track Revenue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
