"use client";

import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';

interface Idea {
  idea_id: string;
  idea_text: string;
  category: string;
}

interface Post {
  post_id: string;
  idea_id: string;
  platform_type: string;
  content_body: string;
  engagement_prediction_score: number;
}

interface Product {
  product_id: string;
  source_post_id: string;
  product_type: string;
  title: string;
  content_structure: any;
  monetization_price_suggestion: number;
}

const PLATFORMS = ['X', 'LinkedIn', 'Instagram', 'TikTok'];

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [niche, setNiche] = useState('');
  const [tone, setTone] = useState<'casual' | 'professional' | 'educational'>('casual');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [posts, setPosts] = useState<Record<string, Post>>({});

  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isProductizing, setIsProductizing] = useState<string | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [isPublishing, setIsPublishing] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem('studioflow_user_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('studioflow_user_id', id);
    }
    setUserId(id);
  }, []);

  const handleGenerate = async () => {
    if (!niche.trim() || !userId) return;
    
    console.log("Generating ideas for niche:", niche);
    setIsGenerating(true);
    setError(null);
    setIdeas([]);
    setPosts({});
    setActiveIdeaId(null);

    try {
      console.log("Fetching /api/agent/idea-architect...");
      const res = await fetch('/api/agent/idea-architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, niche, tone_preference: tone })
      });
      
      console.log("Response status:", res.status);
      const text = await res.text();
      console.log("Raw response text length:", text.length);
      
      let data;
      try { data = JSON.parse(text); } catch (e) {
        throw new Error("Server returned an invalid HTML page. Make sure you are on the right port (e.g. localhost:3000 vs 3001) and the server restarted.");
      }

      console.log("Parsed JSON data:", data);

      if (!res.ok) throw new Error(data?.error || 'Failed to generate ideas');
      
      console.log("Setting ideas state...", data.output.ideas);
      setIdeas(data.output.ideas);
    } catch (err: any) {
      console.error("Caught error:", err.message);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCraftPost = async (ideaId: string, platform: string) => {
    setIsCrafting(true);
    try {
      const res = await fetch('/api/agent/content-crafter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_id: ideaId, platform_type: platform })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to craft post');
      
      setPosts(prev => ({ ...prev, [ideaId]: data.output }));
      setActiveIdeaId(null); // Close dropdown
    } catch (err: any) {
      alert("Error crafting post: " + err.message);
    } finally {
      setIsCrafting(false);
    }
  };

  const handleProductize = async (postId: string, productType: string) => {
    setIsProductizing(postId);
    try {
      const res = await fetch('/api/agent/product-alchemist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, product_type: productType })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create product');
      
      setProducts(prev => ({ ...prev, [postId]: data.output }));
      setActivePostId(null); // Close dropdown
    } catch (err: any) {
      alert("Error creating product: " + err.message);
    } finally {
      setIsProductizing(null);
    }
  };

  const handlePublish = async (productId: string) => {
    setIsPublishing(productId);
    try {
      const res = await fetch('/api/agent/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, user_id: userId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to publish product');
      
      alert("Product published successfully! Revenue tracking activated.");
    } catch (err: any) {
      alert("Error publishing: " + err.message);
    } finally {
      setIsPublishing(null);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Idea Architect</h1>
        <p className={styles.subtitle}>Tell us what you do, and we'll generate your next viral post instantly.</p>
        <div style={{ marginTop: '20px' }}>
          <a href="/dashboard/analytics" className={styles.secondaryBtn} style={{ textDecoration: 'none', display: 'inline-block' }}>
            View Revenue Analytics &rarr;
          </a>
        </div>
      </header>

      <div className={styles.formContainer}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Your Niche</label>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="e.g. AI for Beginners, Personal Finance for Gen Z..." 
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && niche.trim() && !isGenerating) {
                handleGenerate();
              }
            }}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Tone of Voice</label>
          <div className={styles.toneSelector}>
            {(['casual', 'professional', 'educational'] as const).map((t) => (
              <button 
                key={t}
                className={`${styles.tonePill} ${tone === t ? styles.tonePillActive : ''}`}
                onClick={() => setTone(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <button 
          className={styles.generateBtn} 
          onClick={handleGenerate}
          disabled={!niche.trim() || isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Ideas ✨'}
        </button>
        
        {error && <p style={{ color: 'var(--color-error)', marginTop: '12px', textAlign: 'center' }}>{error}</p>}
      </div>

      {isGenerating && (
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>DeepSeek is architecting your ideas...</p>
        </div>
      )}

      {ideas.length > 0 && (
        <div className={styles.ideasGrid}>
          {ideas.map((idea) => {
            const hasPost = posts[idea.idea_id];

            return (
              <div key={idea.idea_id} className={styles.ideaCard}>
                <div className={styles.cardHeader}>
                  <span className={styles.categoryTag}>{idea.category}</span>
                </div>
                <p className={styles.ideaText}>{idea.idea_text}</p>
                
                {!hasPost && (
                  <div className={styles.actionRow}>
                    <button 
                      className={styles.secondaryBtn} 
                      onClick={() => setActiveIdeaId(activeIdeaId === idea.idea_id ? null : idea.idea_id)}
                      disabled={isCrafting}
                    >
                      {isCrafting && activeIdeaId === idea.idea_id ? 'Crafting...' : 'Use Idea (Content Crafter)'}
                    </button>
                  </div>
                )}

                {activeIdeaId === idea.idea_id && !hasPost && (
                  <div className={styles.platformDropdown}>
                    <p className={styles.platformTitle}>Select Platform to Auto-Generate:</p>
                    <div className={styles.platformButtons}>
                      {PLATFORMS.map(platform => (
                        <button 
                          key={platform} 
                          className={styles.platformBtn}
                          onClick={() => handleCraftPost(idea.idea_id, platform)}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {hasPost && (
                  <div className={styles.postResult}>
                    <div className={styles.platformTitle}>Generated {hasPost.platform_type} Post:</div>
                    <div className={styles.postBody}>{hasPost.content_body}</div>
                    <div className={styles.postMeta}>
                      Predicted Engagement: {Math.round(hasPost.engagement_prediction_score * 100)}% Match
                    </div>

                    {!products[hasPost.post_id] && (
                      <div className={styles.actionRow} style={{ marginTop: '16px' }}>
                        <button 
                          className={styles.secondaryBtn} 
                          onClick={() => setActivePostId(activePostId === hasPost.post_id ? null : hasPost.post_id)}
                          disabled={isProductizing === hasPost.post_id}
                        >
                          {isProductizing === hasPost.post_id ? 'Alchemizing...' : 'Turn into Digital Product ✨'}
                        </button>
                      </div>
                    )}

                    {activePostId === hasPost.post_id && !products[hasPost.post_id] && (
                      <div className={styles.platformDropdown}>
                        <p className={styles.platformTitle}>Select Product Type:</p>
                        <div className={styles.platformButtons}>
                          {['ebook', 'checklist', 'course', 'template'].map(type => (
                            <button 
                              key={type} 
                              className={styles.platformBtn}
                              onClick={() => handleProductize(hasPost.post_id, type)}
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {products[hasPost.post_id] && (
                      <div className={styles.premiumProductCard}>
                        <div className={styles.premiumHeader}>
                          <span className={styles.premiumBadge}>Premium {products[hasPost.post_id].product_type}</span>
                          <span className={styles.premiumPrice}>${products[hasPost.post_id].monetization_price_suggestion} Est. Value</span>
                        </div>
                        <h3 className={styles.premiumTitle}>{products[hasPost.post_id].title}</h3>
                        <div className={styles.premiumStructure}>
                          <pre>{JSON.stringify(products[hasPost.post_id].content_structure, null, 2)}</pre>
                        </div>
                        <div className={styles.postMeta}>* This is an estimate. Actual earnings may vary.</div>
                        <div className={styles.actionRow} style={{ marginTop: '16px' }}>
                          <button 
                            className={styles.generateBtn} 
                            style={{ width: 'auto', padding: '12px 24px', fontSize: 'var(--typography-body-medium-font-size)' }}
                            onClick={() => handlePublish(products[hasPost.post_id].product_id)}
                            disabled={isPublishing === products[hasPost.post_id].product_id}
                          >
                            {isPublishing === products[hasPost.post_id].product_id ? 'Publishing...' : 'Publish & Track Revenue 🚀'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
