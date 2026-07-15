"use client";

import type { Idea, Post, Product } from "./types";
import PostResult from "./PostResult";
import styles from "@/app/dashboard/dashboard.module.css";

const PLATFORMS = ["X", "LinkedIn", "Instagram", "TikTok"];

interface IdeaCardProps {
  idea: Idea;
  post: Post | undefined;
  product: Product | undefined;
  activeIdeaId: string | null;
  activePostId: string | null;
  isCrafting: boolean;
  isProductizing: string | null;
  isPublishing: string | null;
  onCraftPost: (ideaId: string, platform: string) => void;
  onToggleProductize: (postId: string) => void;
  onProductize: (postId: string, productType: string) => void;
  onPublish: (productId: string) => void;
  colorIndex?: number;
}

export default function IdeaCard({
  idea,
  post,
  product,
  activeIdeaId,
  activePostId,
  isCrafting,
  isProductizing,
  isPublishing,
  onCraftPost,
  onToggleProductize,
  onProductize,
  onPublish,
  colorIndex = 0,
}: IdeaCardProps) {
  const categoryColorMap: Record<string, string> = {
    "Controversial Take": styles.pillPrimary,
    "How-To": styles.pillGreen,
    "Listicle": styles.pillBlue,
    "Story": styles.pillOrange,
  };
  const pillClass = categoryColorMap[idea.category] ?? styles.pillPurple;

  return (
    <div key={idea.idea_id} className={styles.ideaCard}>
      <div className={styles.cardHeader}>
        <span className={`${styles.categoryTag} ${pillClass}`}>{idea.category}</span>
      </div>
      <p className={styles.ideaText}>
        {idea.idea_text}
      </p>

      {!post && (
        <div className={styles.platformDropdown} style={{ marginTop: "16px" }}>
          <p className={styles.platformTitle}>
            {isCrafting ? "Crafting..." : "Select Platform to Auto-Generate:"}
          </p>
          <div className={styles.platformButtons}>
            {PLATFORMS.map((platform) => (
              <button
                key={platform}
                className={styles.platformBtn}
                onClick={() => onCraftPost(idea.idea_id, platform)}
                disabled={isCrafting}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      )}

      {post && (
        <PostResult
          post={post}
          product={product}
          activePostId={activePostId}
          isProductizing={isProductizing}
          onToggleProductize={onToggleProductize}
          onProductize={onProductize}
          onPublish={onPublish}
          isPublishing={isPublishing}
          isCrafting={isCrafting}
        />
      )}
    </div>
  );
}
