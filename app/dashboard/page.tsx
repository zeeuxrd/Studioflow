"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  Send 
} from 'lucide-react';
import type { Idea, Post, Product, ChatTurn } from "@/components/dashboard/types";
import IdeaCard from "@/components/dashboard/IdeaCard";
import PostResult from "@/components/dashboard/PostResult";
import { isGreetingPrompt, detectPlatformFromPrompt } from "@/lib/config/platforms";
import styles from './dashboard.module.css';

export default function DashboardPage() {
  return <Suspense fallback={null}><DashboardContent /></Suspense>;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id ?? null;
  const userName = (session?.user?.name || 'Creator').trim();
  const firstName = userName.split(' ')[0] || 'Creator';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const THOUGHTFUL_QUESTIONS = [
    (name: string) => `${name}, where should we begin?`,
    (name: string) => `What's on your mind today, ${name}?`,
    (name: string) => `What are we creating today, ${name}?`,
    (name: string) => `Ready to create, ${name}?`,
  ];
  const GREETING_STORAGE_KEY = "sf-dashboard-greeting-v2";
  const GREETING_STALE_MS = 6 * 60 * 60 * 1000; // refresh after 6h away, or a new login

  const [greeting, setGreeting] = useState<string | null>(null);

  const [niche, setNiche] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [styleMenuOpen, setStyleMenuOpen] = useState(false);
  
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const [activeIdeaId, setActiveIdeaId] = useState<string | null>(null);
  const [isCrafting, setIsCrafting] = useState(false);
  const [posts, setPosts] = useState<Record<string, Post>>({});

  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isProductizing, setIsProductizing] = useState<string | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [isPublishing, setIsPublishing] = useState<string | null>(null);

  useEffect(() => {
    if (!firstName) return;
    try {
      const stored = localStorage.getItem(GREETING_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { question: string; ts: number };
        if (Date.now() - parsed.ts < GREETING_STALE_MS) {
          setGreeting(parsed.question);
          return;
        }
      }
    } catch {}

    const pick = THOUGHTFUL_QUESTIONS[Math.floor(Math.random() * THOUGHTFUL_QUESTIONS.length)];
    const question = pick(firstName);
    setGreeting(question);
    try {
      localStorage.setItem(GREETING_STORAGE_KEY, JSON.stringify({ question, ts: Date.now() }));
    } catch {}
  }, [firstName]);

  const searchParams = useSearchParams();
  const [subVerifying, setSubVerifying] = useState(false);
  const [subSuccess, setSubSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('subscription') !== 'success') return;
    setSubVerifying(true);
    let attempts = 0;

    const check = () => {
      attempts++;
      fetch('/api/subscriptions/status')
        .then((r) => r.json())
        .then((data) => {
          if (data.status === 'active' && data.plan !== 'free') {
            setSubSuccess(true);
            setSubVerifying(false);
            window.history.replaceState({}, '', '/dashboard');
          } else if (attempts >= 5) {
            setSubVerifying(false);
            window.history.replaceState({}, '', '/dashboard');
          }
        })
        .catch(() => {
          if (attempts >= 5) {
            setSubVerifying(false);
            window.history.replaceState({}, '', '/dashboard');
          }
        });
    };

    const interval = setInterval(check, 2000);
    check();
    return () => clearInterval(interval);
  }, [searchParams]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedProductId, setPublishedProductId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleNewChat = () => {
    setIdeas([]);
    setNiche('');
    setActiveIdeaId(null);
    setPosts({});
    setProducts({});
    setError(null);
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isDockedBottom, setIsDockedBottom] = useState(false);

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

      const promptText = chat.idea?.idea_text || chat.content_body || chat.idea?.niche || "";
      if (promptText) {
        setTurns([{ id: `turn_${Date.now()}`, prompt: promptText, timestamp: Date.now(), type: 'initial' }]);
      }

      setIdeas([parentIdea]);
      setNiche(parentIdea.niche);
      setActiveIdeaId(parentIdea.idea_id);
      setIsDockedBottom(true);

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
      setTurns([]);
      setIdeas([]);
      setNiche('');
      setPosts({});
      setProducts({});
      setActiveIdeaId(null);
      setActivePostId(null);
      setError(null);
      setIsDockedBottom(false);
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

  const handleGeneratePost = async (topicText: string, platform: string = "LinkedIn", customPromptText?: string) => {
    if (!topicText.trim() || !userId) return;

    const displayPrompt = customPromptText || topicText;
    const turnId = `turn_${Date.now()}`;
    setTurns(prev => [
      ...prev,
      {
        id: turnId,
        userPrompt: displayPrompt,
        timestamp: Date.now(),
        intent: 'post',
        platform,
        isLoading: true
      }
    ]);
    setNiche('');
    setIsDockedBottom(true);
    setIsCrafting(true);

    try {
      const res = await fetch('/api/agent/content-crafter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: topicText, platform_type: platform, format_style: selectedCategory })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to generate post');

      if (data.is_chat) {
        setTurns(prev => prev.map(t => t.id === turnId ? {
          ...t,
          isLoading: false,
          isChat: true,
          conversationalText: data.conversational_text
        } : t));
      } else {
        setPosts(prev => ({ ...prev, [data.output.post_id || turnId]: data.output }));
        setTurns(prev => prev.map(t => t.id === turnId ? {
          ...t,
          isLoading: false,
          post: data.output,
          conversationalText: data.conversational_text
        } : t));
        window.dispatchEvent(new Event("refresh-ideas"));
      }
    } catch (err: any) {
      setTurns(prev => prev.map(t => t.id === turnId ? { ...t, isLoading: false, error: err.message } : t));
    } finally {
      setIsCrafting(false);
    }
  };

  const handleProductize = async (postId: string, productType: string = "ebook", customPrompt?: string) => {
    const promptText = customPrompt || `Turn this post into a digital ${productType} product outline`;

    const turnId = `turn_${Date.now()}`;
    setTurns(prev => [
      ...prev,
      {
        id: turnId,
        userPrompt: promptText,
        timestamp: Date.now(),
        intent: 'product',
        isLoading: true
      }
    ]);
    setNiche('');
    setIsDockedBottom(true);
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
      setTurns(prev => prev.map(t => t.id === turnId ? { ...t, isLoading: false, product: data.output } : t));
      window.dispatchEvent(new Event("refresh-ideas"));
    } catch (err: any) {
      setTurns(prev => prev.map(t => t.id === turnId ? { ...t, isLoading: false, error: err.message } : t));
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

  const handleSubmitMessage = () => {
    const prompt = niche.trim();
    if (!prompt) return;

    if (isGreetingPrompt(prompt)) {
      handleGeneratePost(prompt, "LinkedIn");
      return;
    }

    const detectedPlatform = detectPlatformFromPrompt(prompt);
    const lower = prompt.toLowerCase();
    const isProductReq = lower.includes("ebook") || lower.includes("product") || lower.includes("lead magnet") || lower.includes("checklist") || lower.includes("course");

    const latestPost = Object.values(posts).reverse()[0];

    if (isProductReq && (latestPost || activePostId)) {
      const targetPostId = latestPost?.post_id || activePostId || "latest";
      handleProductize(targetPostId, "ebook", prompt);
    } else if (detectedPlatform) {
      handleGeneratePost(prompt, detectedPlatform);
    } else {
      // General topic without platform specified -> Present platform selection chips!
      const turnId = `turn_${Date.now()}`;
      setTurns(prev => [
        ...prev,
        {
          id: turnId,
          userPrompt: prompt,
          timestamp: Date.now(),
          intent: 'platform_select',
          conversationalText: `Great topic! Which platform would you like to create content for?`,
          isLoading: false
        }
      ]);
      setNiche('');
      setIsDockedBottom(true);
    }
  };

  const focusCommandInput = (nicheSuggestion?: string) => {
    if (nicheSuggestion) {
      setNiche(nicheSuggestion);
    }
    inputRef.current?.focus();
  };

  const CATEGORY_OPTIONS = [
    { id: 'all', label: '✨ All' },
    { id: 'Actionable Tip', label: '💡 Actionable Tip' },
    { id: 'Step-by-Step Guide', label: '📝 Guide' },
    { id: 'Key Insight', label: '🧠 Insight' },
    { id: 'Story', label: '📖 Story' },
    { id: 'Hot Take', label: '🔥 Hot Take' }
  ];

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
      {(subVerifying || subSuccess) && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: 24, padding: '48px 40px',
            maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          }}>
            {subVerifying && (
              <>
                <div style={{
                  width: 40, height: 40,
                  border: '3px solid var(--color-outline)',
                  borderTopColor: 'var(--color-primary)', borderRadius: '50%',
                  margin: '0 auto 20px',
                  animation: 'subSpin 0.8s linear infinite',
                }} />
                <style>{`@keyframes subSpin { to { transform: rotate(360deg) } }`}</style>
                <p style={{ fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 4px' }}>Verifying subscription...</p>
                <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', margin: '0 0 18px' }}>Please wait while we confirm your payment</p>
                <button
                  onClick={() => {
                    setSubVerifying(false);
                    window.history.replaceState({}, '', '/dashboard');
                  }}
                  className={styles.secondaryBtn}
                  style={{ height: 38, fontSize: 13 }}
                >
                  Cancel Verification
                </button>
              </>
            )}
            {subSuccess && (
              <>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'var(--color-primary)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, color: '#fff', margin: '0 auto 16px',
                }}>&#10003;</div>
                <p style={{ fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 4px' }}>Subscription active!</p>
                <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', margin: '0 0 16px' }}>Your plan is now active. Enjoy the upgraded features!</p>
                <button
                  onClick={() => setSubSuccess(false)}
                  style={{
                    background: 'transparent', color: 'var(--color-on-surface)',
                    border: '1.5px solid var(--color-outline)', borderRadius: 8,
                    padding: '10px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  }}
                >Got it</button>
              </>
            )}
          </div>
        </div>
      )}

      <div className={styles.canvasBody}>
        {/* Welcome Dashboard when no turns & no ideas generated & not docked */}
        {turns.length === 0 && ideas.length === 0 && !isGenerating && !isDockedBottom && (
          <div className={styles.welcomeContainer}>
            <h1 className={styles.welcomeTitle}>
              <span className={styles.desktopGreeting}>{greeting ?? `${firstName}, where should we begin?`}</span>
              <span className={styles.mobileGreeting}>Let's jump in, {firstName}</span>
            </h1>

            {/* Inline input bar inside welcome container */}
            {renderCommandInput(false)}
          </div>
        )}

        {/* Welcome title when docked at bottom before turns generate */}
        {turns.length === 0 && ideas.length === 0 && !isGenerating && isDockedBottom && (
          <div className={styles.welcomeContainer} style={{ marginBottom: "auto" }}>
            <h1 className={styles.welcomeTitle}>
              <span className={styles.desktopGreeting}>{greeting ?? `${firstName}, where should we begin?`}</span>
              <span className={styles.mobileGreeting}>Let's jump in, {firstName}</span>
            </h1>
          </div>
        )}
        {/* Rate Limit / Error Modal Overlay */}
        {error && (
          <div className={styles.modalOverlay} onClick={() => setError(null)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "color-mix(in srgb, var(--color-error) 15%, transparent)",
                color: "var(--color-error)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px"
              }}>
                <Zap size={24} />
              </div>
              <h2 className={styles.modalTitle}>Limit Reached</h2>
              <p className={styles.modalText} style={{ margin: "8px 0 20px" }}>{error}</p>
              <div className={styles.modalActions}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => {
                    setError(null);
                    window.location.href = "/#pricing";
                  }}
                >
                  Upgrade Plan
                </button>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => setError(null)}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Conversational Chat Thread */}
        {turns.length > 0 && (
          <div className={styles.chatThread}>
            {turns.map((turn, index) => {
              const isLatestTurn = index === turns.length - 1;
              return (
                <React.Fragment key={turn.id}>
                {/* User Prompt Message Bubble */}
                <div className={styles.userMsgRow}>
                  <div className={styles.userMsgBubble}>
                    {turn.userPrompt}
                  </div>
                </div>

                {/* AI Response Block for this turn */}
                <div className={styles.aiMsgRow}>
                  {/* Animated Typing Bubble Indicator */}
                  {turn.isLoading && (
                    <div className={styles.typingBubble}>
                      <span className={styles.typingDot}></span>
                      <span className={styles.typingDot}></span>
                      <span className={styles.typingDot}></span>
                    </div>
                  )}

                  {/* Error State */}
                  {turn.error && (
                    <p style={{ color: "var(--color-error)", fontSize: "14px", margin: "4px 0" }}>
                      {turn.error}
                    </p>
                  )}

                  {/* Conversational Text Intro Bubble */}
                  {turn.conversationalText && !turn.isLoading && (
                    <div style={{
                      fontSize: "14.5px",
                      lineHeight: 1.5,
                      color: "var(--color-on-surface)",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-outline-variant)",
                      borderRadius: "16px",
                      borderTopLeftRadius: "4px",
                      padding: "14px 18px",
                      maxWidth: "85%",
                      margin: "0 0 8px 0",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                    }}>
                      {turn.conversationalText}
                    </div>
                  )}

                  {/* Platform Selection Chips for General Topic Entry */}
                  {turn.intent === 'platform_select' && !turn.isLoading && isLatestTurn && (
                    <div className={styles.aiActionChipsRow} style={{ marginTop: "4px" }}>
                      <button
                        className={styles.aiActionChip}
                        onClick={() => handleGeneratePost(turn.userPrompt, 'LinkedIn', `Craft a LinkedIn post on "${turn.userPrompt}"`)}
                      >
                        💼 LinkedIn Post
                      </button>
                      <button
                        className={styles.aiActionChip}
                        onClick={() => handleGeneratePost(turn.userPrompt, 'X', `Create an X / Twitter thread on "${turn.userPrompt}"`)}
                      >
                        🧵 X / Twitter Thread
                      </button>
                      <button
                        className={styles.aiActionChip}
                        onClick={() => handleGeneratePost(turn.userPrompt, 'Instagram', `Draft an Instagram caption for "${turn.userPrompt}"`)}
                      >
                        📸 Instagram Caption
                      </button>
                      <button
                        className={styles.aiActionChip}
                        onClick={() => handleGeneratePost(turn.userPrompt, 'TikTok', `Write a TikTok script on "${turn.userPrompt}"`)}
                      >
                        🎵 TikTok Script
                      </button>
                    </div>
                  )}

                  {/* Ideas Output */}
                  {turn.ideas && turn.ideas.length > 0 && !turn.isLoading && (
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-on-surface-variant)", margin: "0 0 4px" }}>
                        Here are tailored content ideas architected for your topic:
                      </p>
                      <div className={styles.ideasGrid} style={{ width: "100%" }}>
                        {turn.ideas.map((idea, idx) => (
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

                      {/* Contextual Action Chips for Ideas */}
                      {isLatestTurn && (
                        <div className={styles.aiActionChipsRow}>
                          {turn.ideas[0] && (
                            <button
                              className={styles.aiActionChip}
                              onClick={() => handleCraftPost(turn.ideas![0].idea_id, 'LinkedIn')}
                            >
                              📝 Draft Idea #1 for LinkedIn
                            </button>
                          )}
                          {turn.ideas[1] && (
                            <button
                              className={styles.aiActionChip}
                              onClick={() => handleCraftPost(turn.ideas![1].idea_id, 'X')}
                            >
                              🧵 Turn Idea #2 into X Thread
                            </button>
                          )}
                          {turn.ideas[2] && (
                            <button
                              className={styles.aiActionChip}
                              onClick={() => handleCraftPost(turn.ideas![2].idea_id, 'Instagram')}
                            >
                              📸 Draft Idea #3 for Instagram
                            </button>
                          )}
                          <button
                            className={styles.aiActionChip}
                            onClick={() => handleGenerate(turn.userPrompt)}
                          >
                            🔄 Generate 3 More Ideas
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Post Output */}
                  {turn.post && !turn.isLoading && (
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-on-surface-variant)", margin: "0 0 4px" }}>
                        Here is your crafted {turn.post.platform_type || turn.platform || "social"} post:
                      </p>
                      <PostResult
                        post={turn.post}
                        product={products[turn.post.post_id]}
                        activePostId={activePostId}
                        isProductizing={isProductizing}
                        onToggleProductize={(id) => setActivePostId(activePostId === id ? null : id)}
                        onProductize={handleProductize}
                        onPublish={handlePublish}
                        isPublishing={isPublishing}
                      />

                      {/* Contextual Action Chips for Posts */}
                      {isLatestTurn && (
                        <div className={styles.aiActionChipsRow}>
                          <button
                            className={styles.aiActionChip}
                            onClick={() => handleProductize(turn.post!.post_id, 'ebook', 'Turn this post into an Ebook digital product outline')}
                          >
                            📚 Turn Post into Ebook / Digital Product
                          </button>
                          <button
                            className={styles.aiActionChip}
                            onClick={() => handleGeneratePost(turn.userPrompt, 'X', 'Adapt this post into an X / Twitter thread')}
                          >
                            🧵 Adapt for X / Twitter Thread
                          </button>
                          <button
                            className={styles.aiActionChip}
                            onClick={() => handleGeneratePost(turn.userPrompt, 'Instagram', 'Adapt this post for Instagram')}
                          >
                            📸 Adapt for Instagram
                          </button>
                          <button
                            className={styles.aiActionChip}
                            onClick={() => handleGeneratePost(turn.userPrompt, 'TikTok', 'Adapt this post into a TikTok video script')}
                          >
                            🎵 Adapt for TikTok Script
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Digital Product Output */}
                  {turn.product && !turn.isLoading && (
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--color-on-surface-variant)", margin: "0 0 4px" }}>
                        Here is your generated digital product outline ({turn.product.product_type || "ebook"}):
                      </p>

                      <div style={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-outline-variant)",
                        borderRadius: "16px",
                        padding: "20px",
                        width: "100%",
                        boxSizing: "border-box"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                          <span style={{
                            padding: "4px 12px",
                            borderRadius: "100px",
                            background: "color-mix(in srgb, #ec4899 15%, transparent)",
                            color: "#db2777",
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: "0.03em",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px"
                          }}>
                            📚 EBOOK
                          </span>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-primary)" }}>
                            Est. Price: ${turn.product.monetization_price_suggestion}
                          </span>
                        </div>

                        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 12px", color: "var(--color-on-surface)" }}>
                          {turn.product.title}
                        </h3>
                        
                        {/* Chapters / Structure */}
                        {turn.product.content_structure && (
                          <div style={{ whiteSpace: "pre-wrap", fontSize: "13.5px", lineHeight: 1.6, color: "var(--color-on-surface)" }}>
                            {typeof turn.product.content_structure === 'string' 
                              ? turn.product.content_structure 
                              : JSON.stringify(turn.product.content_structure, null, 2)}
                          </div>
                        )}

                        <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
                          <button
                            className={styles.primaryBtn}
                            onClick={() => handlePublish(turn.product!.product_id)}
                          >
                            🚀 Publish Product Page
                          </button>
                        </div>
                      </div>

                      {/* Contextual Action Chips for Digital Products */}
                      {isLatestTurn && (
                        <div className={styles.aiActionChipsRow}>
                          <button
                            className={styles.aiActionChip}
                            onClick={() => handleProductize(turn.product!.source_post_id, 'ebook', 'Add 2 more detailed chapters to this ebook outline')}
                          >
                            📖 Add 2 More Chapters
                          </button>
                          <button
                            className={styles.aiActionChip}
                            onClick={() => handleProductize(turn.product!.source_post_id, 'ebook', 'Suggest pricing and monetization launch strategy')}
                          >
                            💡 Suggest Monetization Strategy
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
          </div>
        )}
      </div>

      {/* Sticky bottom input when docked OR when ideas are active - stretches 100% to screen edges */}
      {(isDockedBottom || ideas.length > 0) && !isGenerating && renderCommandInput(true)}

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
