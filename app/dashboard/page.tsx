"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  Zap,
  Sun,
  Moon,
  CheckCircle,
  MessageSquarePlus,
  MoreVertical
} from 'lucide-react';
import type { Idea, Post, Product } from "@/components/dashboard/types";
import IdeaCard from "@/components/dashboard/IdeaCard";
import styles from './dashboard.module.css';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id ?? null;
  const userName = session?.user?.name ?? 'Creator';
  const firstName = userName.split(' ')[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const [niche, setNiche] = useState('');
  const [formatStyle, setFormatStyle] = useState<'all' | 'how-to' | 'controversial' | 'listicle' | 'story'>('all');
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  
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
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedProductId, setPublishedProductId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("studioflow-theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("studioflow-theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  // Close three-dot menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Listen to select-idea and new-chat events from sidebar
  useEffect(() => {
    const loadSelectedChat = (chat: any) => {
      if (!chat) return;

      const parentIdea = {
        idea_id: chat.idea_id || chat.idea?.idea_id,
        idea_text: chat.idea?.idea_text || chat.content_body,
        niche: chat.idea?.niche || chat.niche || "",
        category: chat.idea?.category || "General",
        status: chat.idea?.status || "used",
        created_at: chat.idea?.created_at || new Date().toISOString()
      };

      setIdeas([parentIdea]);
      setNiche(parentIdea.niche);
      setActiveIdeaId(parentIdea.idea_id);

      if (chat.post_id) {
        // Show the post immediately from chat data
        setPosts(prev => ({
          ...prev,
          [parentIdea.idea_id]: chat
        }));
        setActivePostId(chat.post_id);

        // Refresh from server to get latest refinement_history
        if (userId && chat.post_id) {
          fetch(`/api/posts?post_id=${chat.post_id}`)
            .then(r => r.json())
            .then(data => {
              if (data.post) {
                setPosts(prev => ({
                  ...prev,
                  [parentIdea.idea_id]: data.post
                }));
              }
            })
            .catch(() => {});
        }

        if (userId) {
          fetch(`/api/products`)
            .then(r => r.json())
            .then(data => {
              const matchedProduct = (data.products || []).find((p: any) => p.source_post_id === chat.post_id);
              if (matchedProduct) {
                setProducts(prev => ({
                  ...prev,
                  [chat.post_id]: matchedProduct
                }));
              }
            })
            .catch(console.error);
        }
      }
    };

    const handleSelectIdea = (e: Event) => {
      const customEvent = e as CustomEvent;
      const chat = customEvent.detail;
      if (chat) {
        loadSelectedChat(chat);
      }
    };

    const handleNewChat = () => {
      setIdeas([]);
      setNiche('');
      setPosts({});
      setProducts({});
      setActiveIdeaId(null);
      setActivePostId(null);
      setError(null);
    };

    window.addEventListener("select-idea", handleSelectIdea);
    window.addEventListener("new-chat", handleNewChat);

    // Handle loaded idea stored in localStorage from sidebar redirects
    if (typeof window !== "undefined" && userId) {
      const storedIdea = localStorage.getItem("selected-idea-onload");
      if (storedIdea) {
        localStorage.removeItem("selected-idea-onload");
        try {
          const chatObj = JSON.parse(storedIdea);
          loadSelectedChat(chatObj);
        } catch (e) {
          console.error(e);
        }
      }
    }

    return () => {
      window.removeEventListener("select-idea", handleSelectIdea);
      window.removeEventListener("new-chat", handleNewChat);
    };
  }, [userId]);

  if (status === "loading" || !userId) {
    return <div style={{ color: "var(--color-on-surface-variant)", padding: "2rem", textAlign: "center" }}>Loading...</div>;
  }

  const handleGenerate = async (nicheOverride?: string) => {
    const activeNiche = nicheOverride ?? niche;
    if (!activeNiche.trim() || !userId) return;
    
    console.log("Generating ideas for niche:", activeNiche);
    setIsGenerating(true);
    setError(null);
    setIdeas([]);
    setPosts({});
    setActiveIdeaId(null);

    try {
      const res = await fetch('/api/agent/idea-architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: activeNiche, format_style: formatStyle })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to generate ideas');
      
      const generatedIdeas = data.output.ideas || [];
      setIdeas(generatedIdeas);
      if (generatedIdeas.length > 0) {
        setActiveIdeaId(generatedIdeas[0].idea_id);
      }
      // Dispatch refresh event to update recent ideas list in layout
      window.dispatchEvent(new Event("refresh-ideas"));
    } catch (err: any) {
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
        body: JSON.stringify({ idea_id: ideaId, platform_type: platform, format_style: formatStyle })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to craft post');
      
      setPosts(prev => ({ ...prev, [ideaId]: data.output }));
      window.dispatchEvent(new Event("refresh-ideas"));
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
      setActivePostId(null);
      window.dispatchEvent(new Event("refresh-ideas"));
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
        body: JSON.stringify({ product_id: productId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to publish product');
      
      setPublishedProductId(productId);
      setShowPublishModal(true);
      window.dispatchEvent(new Event("refresh-ideas"));
    } catch (err: any) {
      alert("Error publishing: " + err.message);
    } finally {
      setIsPublishing(null);
    }
  };

  const handleRefinePost = async (postId: string, prompt: string, styleOverride?: string) => {
    setIsCrafting(true);
    const activeStyle = styleOverride ?? formatStyle;
    try {
      const res = await fetch('/api/agent/content-crafter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          post_id: postId, 
          refinement_prompt: prompt,
          format_style: activeStyle 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to refine post');
      
      const updatedPost = data.output;
      setPosts(prev => {
        const next = { ...prev };
        const ideaId = Object.keys(next).find(k => next[k].post_id === postId);
        if (ideaId) {
          next[ideaId] = updatedPost;
        }
        return next;
      });
      setNiche('');
    } catch (err: any) {
      alert("Error refining post: " + err.message);
    } finally {
      setIsCrafting(false);
    }
  };

  const handleRefineProduct = async (productId: string, prompt: string) => {
    const productItem = Object.values(products).find(p => p.product_id === productId);
    if (!productItem) return;
    const postId = productItem.source_post_id;
    
    setIsProductizing(postId);
    try {
      const res = await fetch('/api/agent/product-alchemist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, refinement_prompt: prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to refine product');
      
      const updatedProduct = data.output;
      setProducts(prev => ({
        ...prev,
        [postId]: updatedProduct
      }));
      setNiche('');
    } catch (err: any) {
      alert("Error refining product: " + err.message);
    } finally {
      setIsProductizing(null);
    }
  };

  const handleSubmitMessage = () => {
    const prompt = niche.trim();
    if (!prompt) return;

    const activeIdea = ideas.find(i => i.idea_id === activeIdeaId);
    const activePost = activeIdea ? posts[activeIdea.idea_id] : null;
    const activeProduct = activePost ? products[activePost.post_id] : null;

    if (activeIdeaId && activePost && activeProduct) {
      handleRefineProduct(activeProduct.product_id, prompt);
    } else if (activeIdeaId && activePost) {
      handleRefinePost(activePost.post_id, prompt);
    } else {
      handleGenerate(prompt);
    }
  };

  const focusCommandInput = (nicheSuggestion?: string) => {
    if (nicheSuggestion) {
      setNiche(nicheSuggestion);
    }
    inputRef.current?.focus();
  };

  const renderCommandInput = (isSticky: boolean) => {
    return (
      <div className={isSticky ? styles.commandBarSticky : styles.commandBarInline}>
        <div className={isSticky ? styles.commandBarBordered : ""}>
          <div className={styles.commandInputRow}>
            <input
              ref={isSticky ? null : inputRef}
              type="text"
              className={styles.commandInput}
              placeholder={
                activeIdeaId && posts[activeIdeaId] && products[posts[activeIdeaId].post_id]
                  ? "Refine product outline..."
                  : activeIdeaId && posts[activeIdeaId]
                  ? "Refine content post..."
                  : ideas.length > 0
                  ? "Refine ideas or suggest a topic..."
                  : "Type a topic or niche..."
              }
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && niche.trim() && !isGenerating && !isCrafting && !isProductizing) {
                  handleSubmitMessage();
                }
              }}
            />
            <div className={styles.commandInputRight}>
              {!isSticky && (
                <div className={styles.customDropdownWrapper}>
                  <button
                    type="button"
                    className={styles.styleSelect}
                    onClick={() => setStyleMenuOpen(!styleMenuOpen)}
                    title="Select Format Style"
                    disabled={isGenerating || isCrafting || !!isProductizing}
                  >
                    <span>
                      {formatStyle === "all" ? "Select Style" : formatStyle.charAt(0).toUpperCase() + formatStyle.slice(1)}
                    </span>
                  </button>

                  {styleMenuOpen && (
                    <div className={styles.customDropdownMenu}>
                      {[
                        { value: "all", label: "Select Style" },
                        { value: "how-to", label: "How-To" },
                        { value: "controversial", label: "Controversial" },
                        { value: "listicle", label: "Listicle" },
                        { value: "story", label: "Story" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`${styles.customDropdownItem} ${formatStyle === option.value ? styles.customDropdownItemActive : ""}`}
                          onClick={() => {
                            const newStyle = option.value as any;
                            setFormatStyle(newStyle);
                            setStyleMenuOpen(false);
                            
                            // Auto-rewrite the active post when changing the format style dropdown
                            const activeIdea = ideas.find(i => i.idea_id === activeIdeaId);
                            const activePost = activeIdea ? posts[activeIdea.idea_id] : null;
                            if (activeIdeaId && activePost && !products[activePost.post_id]) {
                              handleRefinePost(activePost.post_id, "", newStyle);
                            }
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button
                className={styles.sendBtn}
                onClick={handleSubmitMessage}
                disabled={!niche.trim() || isGenerating || isCrafting || !!isProductizing}
                title="Send Prompt"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Top Bar matching mockup */}
      <div className={styles.topBar}>
        <span className={styles.pageTitle}>Idea Architect</span>
        <div className={styles.topActions}>
          <div className={styles.threeDotMenu} ref={menuRef}>
            <button className={styles.topActionIcon} onClick={() => setMenuOpen(!menuOpen)} title="Menu">
              <MoreVertical size={18} strokeWidth={1} />
            </button>
            {menuOpen && (
              <div className={styles.threeDotDropdown}>
                <button className={styles.threeDotItem} onClick={() => { setMenuOpen(false); /* help action */ }}>
                  <HelpCircle size={16} /> Help
                </button>
                <button className={styles.threeDotItem} onClick={() => { setMenuOpen(false); /* new chat */ }}>
                  <MessageSquarePlus size={16} /> New Chat
                </button>
                <button className={styles.threeDotItem} onClick={() => { setMenuOpen(false); toggleTheme(); }}>
                  {theme === "light" ? <Moon size={16} /> : <Sun size={16} />} {theme === "light" ? "Dark" : "Light"} Mode
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.canvasBody}>
        {/* Welcome Dashboard when no ideas generated */}
        {ideas.length === 0 && !isGenerating && (
          <div className={styles.welcomeContainer}>
            <h1 className={styles.welcomeTitle}>{firstName}, your next big idea awaits</h1>

            {/* Inline input bar inside welcome container */}
            {renderCommandInput(false)}

            <div className={styles.welcomeGrid}>
              {[
                { label: "AI for Beginners", color: styles.cardPurple },
                { label: "Productivity Hacks", color: styles.cardOrange },
                { label: "Health & Wellness", color: styles.cardGreen },
                { label: "Digital Marketing", color: styles.cardBlue },
              ].map((suggestion) => (
                <div 
                  key={suggestion.label}
                  className={`${styles.welcomeCard} ${suggestion.color}`}
                  onClick={() => { setNiche(suggestion.label); handleGenerate(suggestion.label); }}
                >
                  <div className={styles.welcomeCardLeft}>
                    <span className={styles.welcomeCardTitle}>{suggestion.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isGenerating && (
          <div className={styles.loader}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>StudioFlow is architecting your ideas...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{ color: 'var(--color-error)', margin: '20px 0', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        {/* Generated Ideas Grid */}
        {ideas.length > 0 && !isGenerating && (
          <div className={styles.ideasGrid} style={{ flex: 1, width: "100%", paddingBottom: "24px" }}>
            {ideas.map((idea, idx) => (
              <IdeaCard
                key={idea.idea_id}
                idea={idea}
                colorIndex={idx}
                post={posts[idea.idea_id]}
                product={posts[idea.idea_id] ? products[posts[idea.idea_id].post_id] : undefined}
                activeIdeaId={activeIdeaId}
                activePostId={activePostId}
                isCrafting={isCrafting}
                isProductizing={isProductizing}
                isPublishing={isPublishing}
                onCraftPost={handleCraftPost}
                onToggleProductize={(id) => setActivePostId(activePostId === id ? null : id)}
                onProductize={handleProductize}
                onPublish={handlePublish}
              />
            ))}
          </div>
        )}

        {/* Sticky bottom input ONLY when ideas are active */}
        {ideas.length > 0 && !isGenerating && renderCommandInput(true)}
      </div>

      {showPublishModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowPublishModal(false); setPublishedProductId(null); }}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <CheckCircle size={34} className={styles.modalIcon} />
            <h2 className={styles.modalTitle}>Published!</h2>
            <p className={styles.modalText}>Published! Revenue tracking active.</p>
            <div className={styles.modalActions}>
              {publishedProductId && (
                <Link href={`/products/${publishedProductId}`} className={styles.primaryBtn}>
                  View Public Page
                </Link>
              )}
              <button className={styles.secondaryBtn} onClick={() => { setShowPublishModal(false); setPublishedProductId(null); }}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
