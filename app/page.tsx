'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ArrowUpRight, Sparkles, Music, Play, Star, Check, ChevronDown, ChevronRight, MessageSquarePlus, Search, Package, BarChart3, MessageCircle, Sun, Send, Crown, Lightbulb, PenLine, Mic, Smile, ThumbsUp, Download, FileText, Share2, CreditCard, ShieldCheck, Menu, X } from "lucide-react";
import styles from './page.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Draggable } from 'gsap/Draggable';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(ScrollTrigger, Draggable, TextPlugin);

function AnimatedPrice({ value, duration = 400 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);

  useEffect(() => {
    const start = prevRef.current;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(start + diff * progress));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    prevRef.current = value;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{display}</>;
}

const pillWords = [
  { text: 'products', color: '#a88aed' },
];

export default function MarketingPage() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [faqActiveIndex, setFaqActiveIndex] = useState<number | null>(0);
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const heroContainerRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroCtaRef = useRef<HTMLAnchorElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const hiwSectionRef = useRef<HTMLElement>(null);
  const hiwHeaderRef = useRef<HTMLDivElement>(null);
  const hiwGridRef = useRef<HTMLDivElement>(null);
  const pricingSectionRef = useRef<HTMLElement>(null);
  const pricingGridRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const dashboardPreviewRef = useRef<HTMLDivElement>(null);
  const dpCanvasRef = useRef<HTMLDivElement>(null);
  const demoCursorRef = useRef<HTMLDivElement>(null);
  const demoInputRowRef = useRef<HTMLDivElement>(null);
  const demoSendBtnRef = useRef<HTMLSpanElement>(null);
  const demoChatEndRef = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 88, opacity: 0, scale: 1 });
  const [demoInputText, setDemoInputText] = useState('');
  const [demoChatOpen, setDemoChatOpen] = useState(false);
  const [demoUserMsg, setDemoUserMsg] = useState('');
  const [demoAiTyping, setDemoAiTyping] = useState(false);
  const [demoAiReply, setDemoAiReply] = useState('');
  const [demoIdeas, setDemoIdeas] = useState<string[]>([]);
  const [demoSelectedIdea, setDemoSelectedIdea] = useState<number | null>(null);
  const [demoUserPick, setDemoUserPick] = useState('');
  const [demoGenerating, setDemoGenerating] = useState(false);
  const [demoPost, setDemoPost] = useState('');

  useEffect(() => {
    const canvas = dpCanvasRef.current;
    if (!canvas) return;
    canvas.scrollTo({ top: canvas.scrollHeight, behavior: 'smooth' });
  }, [demoChatOpen, demoUserMsg, demoAiTyping, demoAiReply, demoIdeas, demoSelectedIdea, demoUserPick, demoGenerating, demoPost]);

  const DEMO_NICHE = 'Productivity tips for remote workers';
  const DEMO_AI_REPLY = "Here are a few ideas tailored to your niche:";
  const DEMO_POST = "🌅 Struggling to focus at home? Here's what actually works: block your first hour every morning for deep work — no email, no Slack, no notifications.\n\nStart small: even 60 focused minutes beats a scattered 8-hour day. Pair it with a 5-minute planning ritual the night before so you know exactly what you're diving into.\n\nDo this for 2 weeks straight and watch your output (and your sanity) completely transform. 🚀";
  const DEMO_IDEAS = [
    '5 Morning Habits That Boost Remote Productivity',
    'The Ultimate WFH Workspace Setup Checklist',
    'How to Avoid Burnout Working From Home',
  ];

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const runDemo = async () => {
      await sleep(600);

      while (!cancelled) {
        setDemoInputText('');
        setDemoChatOpen(false);
        setDemoUserMsg('');
        setDemoAiTyping(false);
        setDemoAiReply('');
        setDemoIdeas([]);
        setDemoSelectedIdea(null);
        setDemoUserPick('');
        setDemoGenerating(false);
        setDemoPost('');
        setCursorPos({ x: 50, y: 88, opacity: 0, scale: 1 });

        await sleep(500);
        if (cancelled) break;

        // Move cursor to input box center
        setCursorPos({ x: 50, y: 88, opacity: 1, scale: 1 });
        await sleep(450);
        if (cancelled) break;

        // Pulse click input box
        setCursorPos((prev) => ({ ...prev, scale: 0.75 }));
        await sleep(100);
        setCursorPos((prev) => ({ ...prev, scale: 1 }));
        await sleep(200);

        // Type prompt text
        for (let i = 0; i <= DEMO_NICHE.length; i++) {
          if (cancelled) break;
          setDemoInputText(DEMO_NICHE.slice(0, i));
          await sleep(24);
        }
        if (cancelled) break;
        await sleep(350);

        // Move cursor to Send button
        setCursorPos({ x: 93, y: 88, opacity: 1, scale: 1 });
        await sleep(450);
        if (cancelled) break;

        // Click Send button
        setCursorPos((prev) => ({ ...prev, scale: 0.75 }));
        await sleep(100);
        setCursorPos((prev) => ({ ...prev, scale: 1 }));
        await sleep(200);

        // Open chat thread & user message
        setDemoChatOpen(true);
        setDemoUserMsg(DEMO_NICHE);
        setDemoInputText('');
        await sleep(350);
        if (cancelled) break;

        // AI thinking dots
        setDemoAiTyping(true);
        await sleep(600);
        if (cancelled) break;

        // Stream AI reply header
        setDemoAiTyping(false);
        for (let i = 0; i <= DEMO_AI_REPLY.length; i++) {
          if (cancelled) break;
          setDemoAiReply(DEMO_AI_REPLY.slice(0, i));
          await sleep(20);
        }
        if (cancelled) break;
        await sleep(200);

        // Stream idea cards
        for (const idea of DEMO_IDEAS) {
          if (cancelled) break;
          setDemoIdeas((prev) => [...prev, idea]);
          await sleep(200);
        }
        if (cancelled) break;
        await sleep(400);

        // Move cursor to first idea card
        setCursorPos({ x: 50, y: 48, opacity: 1, scale: 1 });
        await sleep(500);
        if (cancelled) break;

        // Click first idea card
        setCursorPos((prev) => ({ ...prev, scale: 0.75 }));
        await sleep(100);
        setCursorPos((prev) => ({ ...prev, scale: 1 }));
        setDemoSelectedIdea(0);
        await sleep(350);
        if (cancelled) break;

        // User picks idea
        setDemoUserPick(`I'll go with this one: "${DEMO_IDEAS[0]}"`);
        await sleep(450);
        if (cancelled) break;

        // AI generating post dots
        setDemoGenerating(true);
        await sleep(700);
        if (cancelled) break;

        // Stream generated post content
        setDemoGenerating(false);
        for (let i = 0; i <= DEMO_POST.length; i++) {
          if (cancelled) break;
          setDemoPost(DEMO_POST.slice(0, i));
          await sleep(12);
        }
        if (cancelled) break;

        // Hold and fade out cursor before restart
        await sleep(4000);
        setCursorPos((prev) => ({ ...prev, opacity: 0 }));
        await sleep(800);
      }
    };

    runDemo();
    return () => {
      cancelled = true;
    };
  }, []);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const sections = [
        hiwSectionRef.current,
        featuresRef.current,
        testimonialsRef.current,
        pricingSectionRef.current,
      ].filter(Boolean) as HTMLElement[];

      sections.forEach((sec) => {
        const isTall = sec.offsetHeight > window.innerHeight + 40;
        const startCond = isTall ? 'bottom bottom' : 'top top';

        ScrollTrigger.create({
          trigger: sec,
          start: startCond,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const handleCtaEnter = () => {
    gsap.to(heroCtaRef.current, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleCtaLeave = () => {
    gsap.to(heroCtaRef.current, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  useLayoutEffect(() => {
    const section = featuresRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const grid = section.querySelector(`.${styles.featuresGrid}`);
      const header = section.querySelector(`.${styles.featuresHeader}`);
      if (!grid || !header) return;

      const headerChildren = Array.from(header.children);
      const cards = Array.from(grid.children);
      if (cards.length === 0) return;

      gsap.set(headerChildren, { y: 30, opacity: 0 });
      gsap.set(cards, { y: 30, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
        },
      });

      tl.to(headerChildren, { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }, 0);
      tl.to(cards, { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: 'power3.out' }, 0.3);
    });

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const cleanupFns: (() => void)[] = [];

    const ctx = gsap.context(() => {
      const container = hero.closest(`.${styles.headerHeroContainer}`) as HTMLElement | null;
      const headline = hero.querySelector(`.${styles.heroContent}`);
      if (!headline) return;

      const lines = headline.querySelectorAll(`.${styles.headlineLine}`);
      const desc = headline.querySelector(`.${styles.heroDescBottom}`);
      const cta = headline.querySelector(`.${styles.heroCta}`);
      const logoBar = headline.querySelector(`.${styles.logoBar}`);
      const navCta = container?.querySelector(`.${styles.navCta}`) as HTMLElement | null;
      const targets = [...lines, desc, cta, logoBar].filter(Boolean);
      if (targets.length === 0) return;

      gsap.set(targets, { y: 50, opacity: 0 });

      const tl = gsap.timeline({ delay: 0.3 });

      tl.to(lines, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        ease: 'power4.out',
      });

      tl.to([desc, cta, logoBar].filter(Boolean), {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
      }, '-=0.3');

      const lineArr = Array.from(lines);

      // --- Ambient Floating ---
      const sparkle = hero.querySelector(`.${styles.sparkle}`);
      const wavy = hero.querySelector(`.${styles.pillYellow}`);
      if (sparkle) {
        const tween = gsap.to(sparkle, {
          y: '+=6',
          duration: 3.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          paused: true,
        });
        tl.call(() => tween.play(), [], 1.5);
      }
      if (wavy) {
        const tween = gsap.to(wavy, {
          y: '+=6',
          duration: 4.3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          paused: true,
        });
        tl.call(() => tween.play(), [], 2.0);
      }

      // --- Magnetic Buttons ---
      const magneticBtns = [cta, navCta].filter(Boolean) as HTMLElement[];

      magneticBtns.forEach((btn) => {
        const onMove = (e: MouseEvent) => {
          const rect = btn.getBoundingClientRect();
          const offsetX = e.clientX - rect.left - rect.width / 2;
          const offsetY = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, {
            x: offsetX * 0.3,
            y: offsetY * 0.3,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };
        const onLeave = () => {
          gsap.to(btn, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'back.out(1.7)',
            overwrite: 'auto',
          });
        };
        btn.addEventListener('mousemove', onMove);
        btn.addEventListener('mouseleave', onLeave);
        cleanupFns.push(() => {
          btn.removeEventListener('mousemove', onMove);
          btn.removeEventListener('mouseleave', onLeave);
        });
      });

      // --- Grid Parallax + Headline Parallax ---
      const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;

        if (container) {
          gsap.to(container, {
            backgroundPosition: `${50 - x * 3}% 50%`,
            duration: 1.2,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      cleanupFns.push(() => window.removeEventListener('mousemove', handleMouseMove));
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const pill = hero.querySelector(`.${styles.pillPurple}`) as HTMLElement | null;
    const wordSpan = pill?.querySelector(`.${styles.pillWord}`);
    const sparkle = pill?.querySelector(`.${styles.sparkle}`);
    if (!pill || !wordSpan) return;

    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % pillWords.length;
      const next = pillWords[index];

      gsap.to(pill, {
        backgroundColor: next.color,
        duration: 0.4,
        ease: 'power2.out',
      });

      gsap.to(wordSpan, {
        text: { value: next.text, speed: 0.5 },
        duration: 0.3,
        ease: 'power2.out',
      });

      if (sparkle) {
        gsap.to(sparkle, {
          rotation: '+=90',
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  useLayoutEffect(() => {
    const header = hiwHeaderRef.current;
    if (!header) return;

    const ctx = gsap.context(() => {
      const children = Array.from(header.children);
      if (children.length === 0) return;

      gsap.set(children, { y: 15, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          once: true,
        },
      });

      tl.to(children, {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
      });
    });

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const el = pricingGridRef.current;
    if (!el) return;

    const hoverCleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      const cards = Array.from(el.children);
      if (cards.length === 0) return;

      gsap.set(cards, { scale: 0.95, opacity: 0, rotation: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });

      tl.to(cards, {
        scale: 1,
        opacity: 1,
        duration: 0.7,
        stagger: 0.15,
        ease: 'back.out(1.7)',
      });

      cards.forEach((card) => {
        const onEnter = () => {
          gsap.to(card, {
            scale: 1.03,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };
        const onLeave = () => {
          gsap.to(card, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };
        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mouseleave', onLeave);
        hoverCleanups.push(() => {
          card.removeEventListener('mouseenter', onEnter);
          card.removeEventListener('mouseleave', onLeave);
        });
      });
    });

    return () => {
      ctx.revert();
      hoverCleanups.forEach((fn) => fn());
    };
  }, []);

  useLayoutEffect(() => {
    const section = testimonialsRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const header = section.querySelector(`.${styles.testimonialsHeader}`);
      const cluster = section.querySelector(`.${styles.testimonialsCluster}`);
      if (!header || !cluster) return;
      const title = header.querySelector(`.${styles.testimonialsTitle}`);
      const desc = header.querySelector(`.${styles.testimonialsDesc}`);
      gsap.set([title, desc], { y: 30, opacity: 0 });
      gsap.set(cluster, { opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 80%', once: true } });
      tl.to(title, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' });
      tl.to(desc, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }, '-=0.3');
      tl.to(cluster, { opacity: 1, duration: 0.8, ease: 'power2.out' }, '-=0.2');
    });

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const el = hiwGridRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const hiwCards = Array.from(el.children);
      if (hiwCards.length === 0) return;
      gsap.set(hiwCards, { y: 40, opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      tl.to(hiwCards, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' });
    });

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    const section = faqRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const title = section.querySelector(`.${styles.faqTitle}`);
      const desc = section.querySelector(`.${styles.faqDesc}`);
      const items = section.querySelectorAll(`.${styles.faqAccordionItem}`);

      gsap.set([title, desc], { y: 30, opacity: 0 });
      gsap.set(items, { y: 20, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      });

      tl.to([title, desc], { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' });
      tl.to(items, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, '-=0.2');
    });

    return () => ctx.revert();
  }, []);

  const initialRender = useRef(true);

  useEffect(() => {
    const section = faqRef.current;
    if (!section) return;

    const items = section.querySelectorAll(`.${styles.faqAccordionItem}`);

    items.forEach((item, index) => {
      const wrapper = item.querySelector(`.${styles.faqAnswerWrapper}`) as HTMLElement | null;
      const chevron = item.querySelector(`.${styles.faqChevronCircle}`);
      const isOpen = faqActiveIndex === index;

      if (wrapper) {
        if (initialRender.current) {
          gsap.set(wrapper, {
            maxHeight: isOpen ? wrapper.scrollHeight : 0,
            opacity: isOpen ? 1 : 0,
            padding: isOpen ? '0 1.5rem 1.25rem 1.5rem' : '0 1.5rem',
          });
        } else {
          gsap.to(wrapper, {
            maxHeight: isOpen ? wrapper.scrollHeight : 0,
            opacity: isOpen ? 1 : 0,
            padding: isOpen ? '0 1.5rem 1.25rem 1.5rem' : '0 1.5rem',
            duration: 0.35,
            ease: 'power3.inOut',
            overwrite: 'auto',
          });
        }
      }
      if (chevron) {
        if (initialRender.current) {
          gsap.set(chevron, {
            rotation: isOpen ? 180 : 0,
            backgroundColor: isOpen ? 'var(--color-primary)' : 'transparent',
            color: isOpen ? '#ffffff' : '',
          });
        } else {
          gsap.to(chevron, {
            rotation: isOpen ? 180 : 0,
            backgroundColor: isOpen ? 'var(--color-primary)' : 'transparent',
            color: isOpen ? '#ffffff' : '',
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      }
      if (initialRender.current) {
        gsap.set(item, {
          backgroundColor: '#1A1A1A',
        });
      } else {
        gsap.to(item, {
          backgroundColor: '#1A1A1A',
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    });

    initialRender.current = false;
  }, [faqActiveIndex]);

  useLayoutEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const footerCleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      gsap.set(footer, { opacity: 0 });

      gsap.to(footer, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footer,
          start: 'top bottom-=40',
          toggleActions: 'play none none none',
        },
      });

      const links = footer.querySelectorAll<HTMLElement>(
        `.${styles.footerLink}, .${styles.footerSocialIcon}`
      );

      links.forEach((el) => {
        const onEnter = () => {
          gsap.to(el, {
            y: -2,
            opacity: 1,
            duration: 0.2,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };
        const onLeave = () => {
          gsap.to(el, {
            y: 0,
            opacity: '',
            duration: 0.2,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
        footerCleanups.push(() => {
          el.removeEventListener('mouseenter', onEnter);
          el.removeEventListener('mouseleave', onLeave);
        });
      });
    });

    return () => {
      footerCleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  async function handleSubscribe(plan: string) {
    setSubscribing(plan);
    try {
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billing_period: billingPeriod }),
      });

      if (res.status === 401) {
        router.push(`/signup?plan=${plan}&period=${billingPeriod}`);
        return;
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Subscription failed');

      if (data.link) window.location.href = data.link;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      alert(msg);
    } finally {
      setSubscribing(null);
    }
  }

  const faqs = [
    {
      question: 'What is StudioFlow?',
      answer: 'StudioFlow is an AI-powered creator workspace designed to turn your social media posts and ideas into ready-to-sell digital products, short ebooks, checklists, and courses instantly.'
    },
    {
      question: 'How does StudioFlow match my writing voice?',
      answer: 'By analyzing your past posts or articles, our AI Tone Architect creates a custom semantic voice profile, ensuring all generated drafts match your style, vocabulary, and phrasing.'
    },
    {
      question: 'Do I own the generated content and products?',
      answer: 'Yes, absolutely. You retain 100% ownership of all posts generated and every digital product compiled. StudioFlow output is yours to sell, publish, or use as you wish.'
    },
    {
      question: 'What platforms are supported for content generation?',
      answer: 'StudioFlow currently exports content drafts tailored and optimized specifically for Twitter/X, LinkedIn, Instagram, and TikTok.'
    },
    {
      question: 'Is my profile and audience data secure?',
      answer: 'Yes, we follow strict privacy regulations. Your data is stored securely in-session, is never sold to third parties, and is aligned with GDPR deletion and access requirements.'
    }
  ];

  return (
    <div className={styles.page}>
      <div className={styles.headerHeroContainer} ref={heroContainerRef}>
        <video
          autoPlay
          loop
          muted
          playsInline
          className={styles.heroVideoBackground}
        >
          <source src="/images/assets/hero-video.mp4" type="video/mp4" />
        </video>
        {/* ——— NAV ——— */}
        <header className={styles.nav}>
          <div className={styles.logoContainer}>
            <Image src="/images/assets/favicon.svg" alt="" width={24} height={24} className={styles.logoIcon} />
            <span className={styles.logoText}>StudioFlow</span>
          </div>

          <nav className={`${styles.navLinks} ${mobileNavOpen ? styles.navLinksOpen : ''}`}>
            <Link href="/#how-it-works" className={styles.navLink} onClick={() => setMobileNavOpen(false)}>How it works</Link>
            <Link href="/#features" className={styles.navLink} onClick={() => setMobileNavOpen(false)}>Features</Link>
            <Link href="/#pricing" className={styles.navLink} onClick={() => setMobileNavOpen(false)}>Pricing</Link>
            <Link href="/signup" className={styles.navLinkMobileCta} onClick={() => setMobileNavOpen(false)}>Sign up</Link>
          </nav>

          <div className={styles.navRight}>
            <Link href="/signup" className={styles.navCta}>
              Sign up <span className={styles.navCtaArrow}><ArrowUpRight size={14} /></span>
            </Link>
            <button
              type="button"
              className={styles.navHamburgerBtn}
              onClick={() => setMobileNavOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* ——— HERO ——— */}
        <main className={styles.hero} ref={heroRef}>
          <div className={styles.heroContent} ref={headlineRef}>
            <div className={styles.headlineLine}>
              <h1 className={styles.headlineText}>Turning posts into products<br />and digital revenue.</h1>
            </div>

            <p className={styles.heroDescBottom}>
              Turn your social media content into sellable digital products with AI that writes in your voice.
            </p>

            <div className={styles.heroCtaRow}>
              <Link href="/signup" className={styles.heroCta} ref={heroCtaRef} onMouseEnter={handleCtaEnter} onMouseLeave={handleCtaLeave}>
                Get Started <span className={styles.navCtaArrow}><ArrowUpRight size={14} /></span>
              </Link>
            </div>
          </div>

          {/* ——— Live dashboard preview mockup ——— */}
          <div className={styles.dashboardPreviewGlow}>
            <div className={styles.dashboardPreview} ref={dashboardPreviewRef}>
              <div
                className={styles.demoCursor}
                ref={demoCursorRef}
                style={{
                  left: `${cursorPos.x}%`,
                  top: `${cursorPos.y}%`,
                  opacity: cursorPos.opacity,
                  transform: `translate(-50%, -50%) scale(${cursorPos.scale})`,
                }}
              >
                <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2.5L4 21.5L9.2 16.8L12.5 23.5L15.8 22L12.6 15.2L19.5 15L4 2.5Z" fill="#1a1a1a" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <aside className={styles.dpSidebar}>
                <div className={styles.dpBrand}>
                  <Image src="/images/assets/favicon.svg" alt="" width={20} height={20} />
                  <span className={styles.dpBrandName}>StudioFlow</span>
                </div>

                <div className={styles.dpLink}><MessageSquarePlus size={16} /><span>New Chat</span></div>
                <div className={styles.dpLink}><Search size={16} /><span>Search chats</span></div>

                <nav className={styles.dpNav}>
                  <div className={`${styles.dpLink} ${styles.dpLinkActive}`}><Package size={16} /><span>Products</span></div>
                  <div className={styles.dpLink}><BarChart3 size={16} /><span>Analytics</span></div>
                  <div className={styles.dpLink}><MessageCircle size={16} /><span>Chats</span><ChevronRight size={12} className={styles.dpLinkChevron} /></div>
                </nav>

                <div className={styles.dpFreeBadge}>
                  <div className={styles.dpFreeRow}><span>Free</span><span>0 / 7</span></div>
                  <div className={styles.dpFreeBar}><div className={styles.dpFreeBarFill}></div></div>
                </div>
              </aside>

              <div className={styles.dpMain}>
                <div className={styles.dpMainHeader}>
                  <div className={styles.dpHeaderActions}>
                    <span className={styles.dpThemeToggle}><Sun size={15} /></span>
                    <span className={styles.dpUpgradeBtn}>Upgrade <Crown size={12} /></span>
                  </div>
                </div>

                <div className={`${styles.dpCanvas} ${demoChatOpen ? styles.dpCanvasChat : ''}`} ref={dpCanvasRef}>
                  {!demoChatOpen && (
                    <h2 className={styles.dpGreeting}>Where should we begin?</h2>
                  )}

                  {demoChatOpen && (
                    <div className={styles.dpChatThread}>
                      <div className={styles.dpChatBubbleUser}>{demoUserMsg}</div>

                      {demoAiTyping && (
                        <div className={`${styles.dpChatBubbleAi} ${styles.dpThinkingBubble}`}>
                          <span></span><span></span><span></span>
                        </div>
                      )}

                      {!demoAiTyping && demoAiReply && (
                        <div className={styles.dpChatBubbleAi}>
                          <p>{demoAiReply}</p>
                          {demoIdeas.length > 0 && (
                            <div className={styles.dpIdeaList}>
                              {demoIdeas.map((idea, i) => (
                                <div
                                  key={i}
                                  className={`${styles.dpIdeaCard} ${demoSelectedIdea === i ? styles.dpIdeaCardSelected : ''}`}
                                >
                                  <Sparkles size={13} />
                                  <span>{idea}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {demoUserPick && (
                        <div className={styles.dpChatBubbleUser}>{demoUserPick}</div>
                      )}

                      {demoGenerating && (
                        <div className={`${styles.dpChatBubbleAi} ${styles.dpThinkingBubble}`}>
                          <span></span><span></span><span></span>
                        </div>
                      )}

                      {!demoGenerating && demoPost && (
                        <div className={styles.dpChatBubbleAi}>
                          <span className={styles.dpPostLabel}><Sparkles size={12} /> Generated post</span>
                          <p>{demoPost}</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.dpInputRow} ref={demoInputRowRef}>
                    {demoInputText ? (
                      <span className={styles.dpInputText}>{demoInputText}</span>
                    ) : (
                      <span className={styles.dpInputPlaceholder}>Type a topic or niche...</span>
                    )}
                    <div className={styles.dpInputRight}>
                      <span className={styles.dpSelectStyle}>Select Style <ChevronDown size={12} /></span>
                      <span className={styles.dpSendBtn} ref={demoSendBtnRef}><Send size={13} /></span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ——— HOW IT WORKS ——— */}
      <section className={styles.howItWorks} id="how-it-works" ref={hiwSectionRef}>
        <div className={styles.hiwHeaderContainer} ref={hiwHeaderRef}>
          <h2 className={styles.hiwTitle}>From idea to<br /><span className={styles.hiwTitleAccent}>digital product</span></h2>
          <p className={styles.hiwSubtitle}>
            Package your insights into revenue-generating assets in minutes.
          </p>
        </div>

        <div className={styles.hiwGrid} ref={hiwGridRef}>
          <div className={`${styles.hiwCard} ${styles.hiwCardSide} ${styles.hiwCardWhite}`}>
            <div className={styles.hiwCardImgWrap}>
              <Image src="/images/assets/hiw-card1.jpg" alt="Idea Architect" fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized className={styles.hiwCardImg} />
              <span className={`${styles.hiwCardIcon} ${styles.hiwCardIconPurple}`}><Lightbulb size={16} /></span>
            </div>
            <div className={styles.hiwCardCaptionWhite}>
              <h3 className={styles.hiwCardLabelDark}>Idea Architect</h3>
              <p className={styles.hiwCardDescDark}>Produce endless niche ideas tailored for your audience.<br />Never run out of content ideas again.</p>
            </div>
          </div>

          <div className={`${styles.hiwCard} ${styles.hiwCardMiddle}`}>
            <Image src="/images/assets/hiw-card2.jpg" alt="Content Crafter" fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized className={styles.hiwCardImg} />
            <div className={`${styles.hiwCardOverlay} ${styles.hiwCardOverlayBlue}`} />
            <span className={`${styles.hiwCardIcon} ${styles.hiwCardIconBlue}`}><PenLine size={16} /></span>
            <div className={styles.hiwCardCaption}>
              <h3 className={styles.hiwCardLabel}>Content Crafter</h3>
              <p className={styles.hiwCardDesc}>Convert your ideas into platform-ready posts instantly.<br />Publish-ready copy in seconds, not hours.</p>
            </div>
          </div>

          <div className={`${styles.hiwCard} ${styles.hiwCardSide} ${styles.hiwCardWhite}`}>
            <div className={styles.hiwCardImgWrap}>
              <Image src="/images/assets/hiw-card3.jpg" alt="Product Generator" fill sizes="(max-width: 768px) 100vw, 33vw" unoptimized className={styles.hiwCardImg} />
              <span className={`${styles.hiwCardIcon} ${styles.hiwCardIconOrange}`}><Package size={16} /></span>
            </div>
            <div className={styles.hiwCardCaptionWhite}>
              <h3 className={styles.hiwCardLabelDark}>Product Generator</h3>
              <p className={styles.hiwCardDescDark}>Package your best content into digital products easily.<br />Launch and sell without extra design work.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— FEATURES ——— */}
      <section className={styles.features} ref={featuresRef}>
        <div className={styles.featuresSky}>
          <div className={styles.featuresHeader}>
            <h2 className={styles.featuresTitle}>Everything you need<br />to monetize</h2>
            <p className={styles.featuresDesc}>
              We're on a mission to help creators turn ideas into revenue. Turn niche
              ideas into posts and digital products — all in one workspace.
            </p>
          </div>

          {/* 3 Cards Grid */}
          <div className={styles.featuresGrid}>
            {/* Card 1: Performance Analytics */}
            <div className={styles.featuresCard}>
              <BarChart3 size={48} strokeWidth={1.25} className={styles.featuresCardIcon} />
              <h3 className={styles.featuresCardLabel}>Performance Analytics</h3>
              <p className={styles.featuresCardDesc}>
                Track which posts and products convert best with real-time insights into views, sales, and revenue.
                <br />Spot trends before they peak.
                <br />Make data-driven content decisions daily.
              </p>
            </div>

            {/* Card 2: Built-in Monetization */}
            <div className={styles.featuresCard}>
              <CreditCard size={48} strokeWidth={1.25} className={styles.featuresCardIcon} />
              <h3 className={styles.featuresCardLabel}>Built-in Monetization</h3>
              <p className={styles.featuresCardDesc}>
                Sell directly to your audience with secure, built-in checkout — no third-party setup required.
                <br />Accept payments in multiple currencies.
                <br />Get paid out fast, with zero integration hassle.
              </p>
            </div>

            {/* Card 3: Full Content Ownership */}
            <div className={styles.featuresCard}>
              <ShieldCheck size={48} strokeWidth={1.25} className={styles.featuresCardIcon} />
              <h3 className={styles.featuresCardLabel}>Full Content Ownership</h3>
              <p className={styles.featuresCardDesc}>
                Everything you create is 100% yours, with transparent pricing and no hidden platform fees.
                <br />Export or migrate your content anytime.
                <br />No lock-in, no surprise charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— TESTIMONIALS SECTION ——— */}
      <section className={styles.testimonialsSection} ref={testimonialsRef} id="testimonials">
        <div className={styles.testimonialsHeader}>
          <h2 className={styles.testimonialsTitle}>Trusted by <span className={styles.testimonialsTitleAccent}>creators</span></h2>
          <p className={styles.testimonialsDesc}>See what creators are saying about turning their content into revenue with StudioFlow.</p>
        </div>

        <div className={styles.testimonialsCluster}>
          <div className={styles.marqueeTrack}>
            {/* ── First set ── */}
            <div className={`${styles.testimonialCard} ${styles.testimonialCardBlack}`}>
              <span className={styles.testimonialQuote}>&ldquo;</span>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Within minutes of starting, I turned my LinkedIn post drafts into a $15 checklist. Made my first sale within 2 hours. Extremely simple tool!</p>
              <div className={styles.testimonialAuthor}>Stephen A.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardLavender}`}>
              <span className={styles.testimonialQuote}>&ldquo;</span>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Super professional and clean. Converting my X threads into monetized PDF checklists is a 1-click process now. Highly recommended!</p>
              <div className={styles.testimonialAuthor}>Sara L.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardWhite1}`}>
              <span className={styles.testimonialQuote}>&ldquo;</span>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>I recently used StudioFlow to compile my guide. The workflow is incredibly smooth and the output ownership structure is 100% transparent.</p>
              <div className={styles.testimonialAuthor}>Alex M.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardWhite2}`}>
              <span className={styles.testimonialQuote}>&ldquo;</span>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Really useful system. The AI Tone Architect matches my writing voice perfectly. I don&apos;t sound like a generic chatbot anymore.</p>
              <div className={styles.testimonialAuthor}>Barry W.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardChartreuse}`}>
              <span className={styles.testimonialQuote}>&ldquo;</span>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Converted three of my newsletter articles into a short course outline. StudioFlow handled the pricing suggestion and structure instantly. Exceptional.</p>
              <div className={styles.testimonialAuthor}>Simon F.</div>
            </div>
            {/* ── Duplicate set for seamless loop ── */}
            <div className={`${styles.testimonialCard} ${styles.testimonialCardBlack}`} aria-hidden="true">
              <span className={styles.testimonialQuote}>&ldquo;</span>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Within minutes of starting, I turned my LinkedIn post drafts into a $15 checklist. Made my first sale within 2 hours. Extremely simple tool!</p>
              <div className={styles.testimonialAuthor}>Stephen A.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardLavender}`} aria-hidden="true">
              <span className={styles.testimonialQuote}>&ldquo;</span>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Super professional and clean. Converting my X threads into monetized PDF checklists is a 1-click process now. Highly recommended!</p>
              <div className={styles.testimonialAuthor}>Sara L.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardWhite1}`} aria-hidden="true">
              <span className={styles.testimonialQuote}>&ldquo;</span>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>I recently used StudioFlow to compile my guide. The workflow is incredibly smooth and the output ownership structure is 100% transparent.</p>
              <div className={styles.testimonialAuthor}>Alex M.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardWhite2}`} aria-hidden="true">
              <span className={styles.testimonialQuote}>&ldquo;</span>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Really useful system. The AI Tone Architect matches my writing voice perfectly. I don&apos;t sound like a generic chatbot anymore.</p>
              <div className={styles.testimonialAuthor}>Barry W.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardChartreuse}`} aria-hidden="true">
              <span className={styles.testimonialQuote}>&ldquo;</span>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Converted three of my newsletter articles into a short course outline. StudioFlow handled the pricing suggestion and structure instantly. Exceptional.</p>
              <div className={styles.testimonialAuthor}>Simon F.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— PRICING SECTION ——— */}
      <section className={styles.pricingSection}>
        <div className={styles.pricingHeader}>
          <h2 className={styles.pricingTitle}>
            Simple pricing for<br /><span className={styles.pricingTitleAccent}>content creators</span>
          </h2>
          <p className={styles.pricingSubtitle}>
            Scale your content workflow with AI-powered tools designed for creators, by creators.
          </p>
        </div>

        {/* Billing Toggle Switch */}
        <div className={styles.pricingToggleContainer}>
          <div className={styles.pricingTogglePill}>
            <button
              type="button"
              className={`${styles.pricingToggleButton} ${billingPeriod === 'monthly' ? styles.pricingToggleActive : ''}`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`${styles.pricingToggleButton} ${billingPeriod === 'yearly' ? styles.pricingToggleActive : ''}`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className={styles.pricingGrid} ref={pricingGridRef}>
          {/* Card 1: Essential plan (Standard on Left) */}
          <div className={styles.pricingCardStandard}>
            <div className={styles.pricingCardHeader}>
              <h3 className={styles.pricingCardTitle}>Starter</h3>
              <p className={styles.pricingCardDesc}>
                Perfect for solo creators starting their content journey.
              </p>
              <div className={styles.pricingPriceRow}>
                <span className={styles.pricingPrice}>
                  ₦{billingPeriod === 'monthly' ? <AnimatedPrice value={7000} key="starter" /> : <AnimatedPrice value={20000} key="starter" />}
                </span>
                <div className={styles.pricingPeriodCol}>
                  <span className={styles.pricingPeriod}>monthly</span>
                  <span className={styles.pricingBilledPeriod}>billed annually</span>
                </div>
              </div>
              <button
                type="button"
                className={`${styles.pricingCardButton} ${styles.pricingCardButtonOutline}`}
                onClick={() => handleSubscribe('starter')}
                disabled={subscribing === 'starter'}
                style={{ cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {subscribing === 'starter' ? 'Redirecting...' : 'Start free trial'}
              </button>
            </div>

            <div className={styles.pricingCardDivider}></div>

            <ul className={styles.pricingFeaturesList}>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                50 AI content generations/mo
              </li>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                2 platform integrations
              </li>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                Basic analytics
              </li>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                Idea Architect tool
              </li>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                Email support
              </li>
            </ul>
          </div>

          {/* Card 2: Advanced (Standard in Middle) */}
          <div className={styles.pricingCardStandard}>
            <div className={styles.pricingCardHeader}>
              <h3 className={styles.pricingCardTitle}>Creator</h3>
              <p className={styles.pricingCardDesc}>
                For growing creators ready to scale their content output.
              </p>
              <div className={styles.pricingPriceRow}>
                <span className={styles.pricingPrice}>
                  ₦{billingPeriod === 'monthly' ? <AnimatedPrice value={14000} key="creator" /> : <AnimatedPrice value={50000} key="creator" />}
                </span>
                <div className={styles.pricingPeriodCol}>
                  <span className={styles.pricingPeriod}>monthly</span>
                  <span className={styles.pricingBilledPeriod}>billed annually</span>
                </div>
              </div>
              <button
                type="button"
                className={`${styles.pricingCardButton} ${styles.pricingCardButtonOutline}`}
                onClick={() => handleSubscribe('creator')}
                disabled={subscribing === 'creator'}
                style={{ cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {subscribing === 'creator' ? 'Redirecting...' : 'Start free trial'}
              </button>
            </div>

            <div className={styles.pricingCardDivider}></div>

            <ul className={styles.pricingFeaturesList}>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                200 AI content generations/mo
              </li>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                All platform integrations
              </li>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                Advanced analytics
              </li>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                Content Crafter + Product Generator
              </li>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                Priority support
              </li>
            </ul>
          </div>

          {/* Card 3: Global plan (Standard on Right) */}
          <div className={styles.pricingCardStandard}>
            <div className={styles.pricingCardHeader}>
              <h3 className={styles.pricingCardTitle}>Pro</h3>
              <p className={styles.pricingCardDesc}>
                For teams and agencies managing multiple client accounts.
              </p>
              <div className={styles.pricingPriceRow}>
                <span className={styles.pricingPrice}>
                  ₦{billingPeriod === 'monthly' ? <AnimatedPrice value={30000} key="pro" /> : <AnimatedPrice value={100000} key="pro" />}
                </span>
                <div className={styles.pricingPeriodCol}>
                  <span className={styles.pricingPeriod}>monthly</span>
                  <span className={styles.pricingBilledPeriod}>billed annually</span>
                </div>
              </div>
              <button
                type="button"
                className={`${styles.pricingCardButton} ${styles.pricingCardButtonOutline}`}
                onClick={() => handleSubscribe('pro')}
                disabled={subscribing === 'pro'}
                style={{ cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {subscribing === 'pro' ? 'Redirecting...' : 'Start free trial'}
              </button>
            </div>

            <div className={styles.pricingCardDivider}></div>

            <ul className={styles.pricingFeaturesList}>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                Unlimited AI generations
              </li>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                Multi-account management
              </li>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                Custom branding
              </li>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                All AI agent tools
              </li>
              <li className={styles.pricingFeatureItem}>
                <Check className={styles.pricingCheckmark} size={20} />
                Dedicated account manager
              </li>
            </ul>
          </div>
        </div>

      </section>

      {/* ——— FAQ SECTION ——— */}
      <section className={styles.faqMockupSection} ref={faqRef}>
        <div className={styles.faqMockupCard}>
          <div className={styles.faqMockupGrid}>

            {/* Left: Gradient CTA card */}
            <div className={styles.faqCtaCard}>
              <div>
                <h3 className={styles.faqCtaTitle}>Ready to turn ideas into revenue?</h3>
                <p className={styles.faqCtaDesc}>Turn your content into sellable digital products in minutes.</p>
                <Link href="/signup" className={styles.faqCtaButton}>Get Started Today</Link>
              </div>

              <div className={styles.faqCtaStat}>
                <span className={styles.faqCtaStatNumber}>2,500+</span>
                <span className={styles.faqCtaStatLabel}>creators already earning with StudioFlow</span>
              </div>
            </div>

            {/* Right: Header + Accordion */}
            <div className={styles.faqRightCol}>
              <div className={styles.faqHeaderCol}>
                <h2 className={styles.faqTitle}>
                  Frequently asked <span className={styles.faqTitleAccent}>questions</span>
                </h2>
                <p className={styles.faqDesc}>
                  Have questions about StudioFlow? Learn how our AI-powered creator workspace helps you turn ideas into platform-ready posts and monetized digital products.
                </p>
              </div>

              <div className={styles.faqAccordionContainer}>
                {faqs.map((faq, index) => {
                  const isOpen = faqActiveIndex === index;
                  return (
                    <div key={index} className={styles.faqAccordionItem}>
                      <button
                        type="button"
                        className={styles.faqQuestionBtn}
                        onClick={() => setFaqActiveIndex(isOpen ? null : index)}
                        aria-expanded={isOpen}
                      >
                        <span className={styles.faqQuestionText}>{faq.question}</span>
                        <div className={styles.faqChevronCircle}>
                          <ChevronDown className={styles.faqChevronSvg} size={16} />
                        </div>
                      </button>

                      <div className={styles.faqAnswerWrapper}>
                        <div className={styles.faqAnswerText}>
                          {faq.answer}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ——— FOOTER ——— */}
      <footer className={styles.footerMockupSection} ref={footerRef}>

        <div className={styles.footerGrid}>

          {/* Column 1: Brand Logo & Tagline */}
          <div className={styles.footerLogoCol}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="15" r="5" />
                  <circle cx="6" cy="9" r="3" />
                  <circle cx="18" cy="9" r="3" />
                  <circle cx="12" cy="5" r="2.5" />
                </svg>
              </div>
              <span className={styles.footerBrandName}>StudioFlow</span>
            </div>

            <p className={styles.footerTagline}>
              Turning creator content into sellable digital products, powered by AI.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className={styles.footerNavCol}>
            <h3 className={styles.footerColHeading}>Navigation</h3>
            <Link href="/#how-it-works" className={styles.footerLink}>How It Works</Link>
            <Link href="/#features" className={styles.footerLink}>Features</Link>
            <Link href="/#testimonials" className={styles.footerLink}>Testimonials</Link>
            <Link href="/#pricing" className={styles.footerLink}>Pricing</Link>
          </div>

          {/* Column 3: Pages */}
          <div className={styles.footerNavCol}>
            <h3 className={styles.footerColHeading}>Pages</h3>
            <Link href="/" className={styles.footerLink}>Home</Link>
            <Link href="/dashboard" className={styles.footerLink}>Dashboard</Link>
            <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
            <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
          </div>

          {/* Column 4: Newsletter */}
          <div className={styles.footerNewsletterCol}>
            <h3 className={styles.footerColHeading}>Newsletter</h3>
            <p className={styles.footerNewsletterText}>
              Join our newsletter and get notified about product updates.
            </p>
            <form
              className={styles.footerNewsletterForm}
              onSubmit={(e) => {
                e.preventDefault();
                setNewsletterSubscribed(true);
              }}
            >
              <input
                type="email"
                required
                placeholder="Enter your email..."
                className={styles.footerNewsletterInput}
                disabled={newsletterSubscribed}
              />
              <button type="submit" className={styles.footerNewsletterButton} disabled={newsletterSubscribed}>
                {newsletterSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </form>
          </div>

        </div>

        {/* Compliance disclaimers row */}
        <div className={styles.footerComplianceRow}>
          <p className={styles.footerComplianceText}>
            &copy; 2026 StudioFlow. All rights reserved.
          </p>
          <p className={styles.footerComplianceText}>
            Everything you create with StudioFlow is yours to keep, sell, or share (non-exclusive license). Your data, your rules — access, export, or delete it anytime.
          </p>
        </div>


      </footer>
    </div>
  );
}
