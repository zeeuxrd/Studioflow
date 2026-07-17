'use client';

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { ArrowUpRight, Sparkles, Music, Play, Star, Check, ChevronDown, MapPin, Phone, Mail } from "lucide-react";
import styles from './page.module.css';
import Link from 'next/link';
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
  const featuresRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroCtaRef = useRef<HTMLAnchorElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const hiwHeaderRef = useRef<HTMLDivElement>(null);
  const hiwGridRef = useRef<HTMLDivElement>(null);
  const pricingGridRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  const handleCtaEnter = () => {
    gsap.to(heroCtaRef.current, {
      scale: 1.05,
      backgroundColor: '#a88aed',
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleCtaLeave = () => {
    gsap.to(heroCtaRef.current, {
      scale: 1,
      backgroundColor: 'var(--color-primary)',
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

      const title = header.querySelector(`.${styles.featuresTitle}`);
      const desc = header.querySelector(`.${styles.featuresDesc}`);

      const cards = Array.from(grid.children);
      if (cards.length === 0) return;

      const rotations = [-1.5, 1.2, -1];

      const sparkle = title?.querySelector(`.${styles.featuresTitleIcon}`);

      gsap.set([title, desc], { y: 40, opacity: 0 });
      if (sparkle) gsap.set(sparkle, { scale: 0, rotation: 0 });
      gsap.set(cards, { scale: 0.9, opacity: 0, rotation: 0 });
      gsap.set([cards[0], cards[2]], { y: 40, scale: 1 });
      gsap.set(cards[1], { y: 0 });

      cards.forEach((card) => {
        const els = card.querySelectorAll(
          `.${styles.featuresCardStep}, .${styles.featuresCardLabel}, .${styles.featuresCardDesc}`
        );
        gsap.set(els, { y: 15, opacity: 0 });
        const arrow = card.querySelector(`.${styles.featuresCardArrow}`);
        if (arrow) gsap.set(arrow, { x: -10, y: 10, opacity: 0 });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          once: true,
        },
      });

      tl.to(title, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, 0);
      if (sparkle) {
        tl.to(sparkle, { scale: 1, rotation: 90, duration: 0.6, ease: 'back.out(2)' }, 0);
      }
      tl.to(desc, { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }, '-=0.3');

      cards.forEach((card, i) => {
        const cardStart = i * 0.25;

        if (i === 1) {
          tl.to(card, {
            scale: 1,
            opacity: 1,
            rotation: rotations[i],
            duration: 0.7,
            ease: 'back.out(1.5)',
          }, cardStart);
        } else {
          tl.to(card, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power3.out',
          }, cardStart);
        }

        const internal = card.querySelectorAll(
          `.${styles.featuresCardStep}, .${styles.featuresCardLabel}, .${styles.featuresCardDesc}`
        );
        if (internal.length > 0) {
          tl.to(internal, {
            y: 0,
            opacity: 1,
            duration: 0.35,
            stagger: 0.08,
            ease: 'power2.out',
          }, cardStart + 0.4);
        }

        const arrow = card.querySelector(`.${styles.featuresCardArrow}`);
        if (arrow) {
          tl.to(arrow, {
            x: 0,
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power3.out',
          }, cardStart);
        }
      });
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
            boxShadow: '0 15px 40px rgba(255, 255, 255, 0.096)',
            duration: 0.3,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        };
        const onLeave = () => {
          gsap.to(card, {
            scale: 1,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
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
      const cols = Array.from(el.children);
      const hiwCards = cols.map((col) => col.querySelector(`.${styles.hiwCard}`)).filter(Boolean);
      if (hiwCards.length === 0) return;
      const rotations = [-3, 2, 1.5];
      const tapes = cols.map((col) => col.querySelector(`.${styles.hiwTape}`)).filter(Boolean);
      const graphics = cols.map((col) => col.querySelector(`.${styles.hiwGraphic}`)).filter(Boolean);
      const icons = cols.map((col) => { const g = col.querySelector(`.${styles.hiwGraphic}`); return g ? Array.from(g.children) : []; });
      gsap.set(hiwCards, { scale: 0.95, rotation: 0 });
      gsap.set(tapes, { scaleY: 1.6, transformOrigin: 'top center' });
      icons.forEach((group) => gsap.set(group, { scale: 0.3, opacity: 0 }));
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      hiwCards.forEach((card, i) => {
        tl.to(card, { scale: 1, opacity: 1, rotation: rotations[i], duration: 0.9, ease: 'back.out(1.7)' }, i * 0.4);
        if (tapes[i]) tl.to(tapes[i], { scaleY: 1, duration: 0.25, ease: 'back.out(2)' }, '-=0.35');
        if (icons[i]?.length > 0) tl.to(icons[i], { scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' }, '-=0.1');
        if (graphics[i]) tl.call(() => { const tw = gsap.to(graphics[i], { scale: 1.06, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: -1 }); ctx.add(tw.revert.bind(tw)); });
      });
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
          backgroundColor: isOpen ? '#1A1A1A' : '',
        });
      } else {
        gsap.to(item, {
          backgroundColor: isOpen ? '#1A1A1A' : '',
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
      <div className={styles.headerHeroContainer}>
        {/* ——— NAV ——— */}
        <header className={styles.nav}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}></div>
            <span className={styles.logoText}>StudioFlow</span>
          </div>

          <div className={styles.navRight}>
            <Link href="/signup" className={styles.navCta}>
              Sign up <span className={styles.navCtaArrow}><ArrowUpRight size={14} /></span>
            </Link>
          </div>
        </header>

        {/* ——— HERO ——— */}
        <main className={styles.hero} ref={heroRef}>
          <div className={styles.heroContent} ref={headlineRef}>
            {/* Line 1 */}
            <div className={styles.headlineLine}>
              <h1 className={styles.headlineText}>Turning posts</h1>
            </div>

            {/* Line 2 */}
            <div className={styles.headlineLine}>
              <h1 className={styles.headlineText}>
                <span className={styles.pushDown}>into</span>{' '}
                <span className={styles.pillPurple}>
                  <span className={styles.sparkle}><Sparkles size={14} /></span>
                  <span className={styles.pillWord}>products</span>
                </span>
              </h1>
            </div>

            {/* Line 3 */}
            <div className={styles.headlineLine}>
              <h1 className={styles.headlineText}>
                and digital{' '}
                <span className={styles.pillYellow}>revenue<Sparkles size={12} /></span>
              </h1>
            </div>

            <p className={styles.heroDescBottom}>
              Turn your social media content into sellable digital products with AI that writes in your voice.
            </p>

            <Link href="/signup" className={styles.heroCta} ref={heroCtaRef} onMouseEnter={handleCtaEnter} onMouseLeave={handleCtaLeave}>
              Get Started <span className={styles.navCtaArrow}><ArrowUpRight size={14} /></span>
            </Link>

            <div className={styles.logoBar}>
              <div className={styles.logoBarItem}>
                <span className={`${styles.logoBarIcon} ${styles.logoBarIconSmall}`} style={{ fontSize: '12.48px' }}>𝕏</span>
                <span>Twitter / X</span>
              </div>
              <div className={styles.logoBarItem}>
                <span className={styles.logoBarIcon}>in</span>
                <span>LinkedIn</span>
              </div>
              <div className={styles.logoBarItem}>
                <span className={styles.logoBarIcon}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </span>
                <span>Instagram</span>
              </div>
              <div className={styles.logoBarItem}>
                <span className={`${styles.logoBarIcon} ${styles.logoBarIconSmall}`}><Music size={16} /></span>
                <span>TikTok</span>
              </div>
              <div className={styles.logoBarItem}>
                <span className={styles.logoBarIcon}><Play size={16} /></span>
                <span>YouTube</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ——— HOW IT WORKS ——— */}
      <section className={styles.howItWorks}>
        <div className={styles.hiwHeaderContainer} ref={hiwHeaderRef}>
          <h2 className={styles.hiwTitle}>From <span className={styles.hiwTitleAccent}>idea</span> to digital product</h2>
          <p className={styles.hiwSubtitle}>
            Package your insights into revenue-generating assets in minutes.
          </p>
        </div>

        <div className={styles.hiwGrid} ref={hiwGridRef}>
          {/* Column 1 */}
          <div className={styles.hiwCol}>
            <div className={styles.hiwHeader}>
              <div className={styles.hiwHeaderLeft}>
                <span className={styles.hiwBarPurple}></span>
                <span>Brainstorming</span>
              </div>
              <span className={styles.hiwStepNum}>1</span>
            </div>
            <div className={`${styles.hiwCard} ${styles.hiwCardPurple}`}>
              <div className={styles.hiwTape}></div>
              <div className={styles.hiwGraphic}>
                {/* Abstract geometric shape representing "Idea/Brainstorming (Lightbulb)" */}
                <div className={styles.hiwBulbCentered}>
                  <div className={styles.geoBulbGlass}></div>
                  <div className={styles.geoBulbBase}></div>
                  <div className={styles.geoBulbFilament}></div>
                  <div className={styles.geoBulbRay1}></div>
                  <div className={styles.geoBulbRay2}></div>
                  <div className={styles.geoBulbRay3}></div>
                  <div className={styles.geoBulbRay4}></div>
                  <div className={styles.geoBulbRay5}></div>
                </div>
              </div>
              <div className={styles.hiwCardLabel}>Idea Architect</div>
              <p className={styles.hiwCardDesc}>Produce endless niche ideas tailored for your audience.</p>
            </div>
          </div>

          {/* Column 2 */}
          <div className={styles.hiwCol}>
            <div className={styles.hiwHeader}>
              <div className={styles.hiwHeaderLeft}>
                <span className={styles.hiwBarBlue}></span>
                <span>Creation</span>
              </div>
              <span className={styles.hiwStepNum}>2</span>
            </div>
            <div className={`${styles.hiwCard} ${styles.hiwCardBlue}`}>
              <div className={styles.hiwTape}></div>
              <div className={styles.hiwGraphic}>
                {/* Abstract geometric shape representing "Speech/Content" */}
                <div className={styles.geoSpeechBubble}></div>
                <div className={styles.geoSpeechTail}></div>
                <div className={styles.geoSpeechDot1}></div>
                <div className={styles.geoSpeechDot2}></div>
                <div className={styles.geoSpeechDot3}></div>
              </div>
              <div className={styles.hiwCardLabel}>Content Crafter</div>
              <p className={styles.hiwCardDesc}>Convert your ideas into platform-ready posts instantly.</p>
            </div>
          </div>

          {/* Column 3 */}
          <div className={styles.hiwCol}>
            <div className={styles.hiwHeader}>
              <div className={styles.hiwHeaderLeft}>
                <span className={styles.hiwBarOrange}></span>
                <span>Monetization</span>
              </div>
              <span className={styles.hiwStepNum}>3</span>
            </div>
            <div className={`${styles.hiwCard} ${styles.hiwCardOrange}`}>
              <div className={styles.hiwTape}></div>
              <div className={styles.hiwGraphic}>
                {/* Abstract geometric shape representing "Digital Product" */}
                <div className={styles.geoCardBack}></div>
                <div className={styles.geoCardFront}></div>
                <div className={styles.geoSparkle}></div>
              </div>
              <div className={styles.hiwCardLabel}>Product Generator</div>
              <p className={styles.hiwCardDesc}>Package your best content into digital products easily.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— FEATURES ——— */}
      <section className={styles.features} ref={featuresRef}>
        {/* Split Header */}
        <div className={styles.featuresHeader}>
          <div className={styles.featuresHeaderLeft}>
            <h2 className={styles.featuresTitle}>
              Everything you need to <span className={styles.featuresTitleAccent}>
                <span className={styles.featuresTitleIcon}><Sparkles size={16} /></span>monetize
              </span>
            </h2>
          </div>
          <div className={styles.featuresHeaderRight}>
            <p className={styles.featuresDesc}>
              Turn niche ideas into posts and digital products — all in one workspace.
            </p>
          </div>
        </div>

        {/* 3 Cards Grid */}
        <div className={styles.featuresGrid}>
          {/* Card 1: Tone & Niche Architect */}
          <div className={`${styles.featuresCard} ${styles.featuresCardGrey}`}>
            <div className={styles.featuresCardHeader}>
              <span className={styles.featuresCardStep}>01</span>
              <span className={styles.featuresCardArrow}><ArrowUpRight size={14} /></span>
            </div>
            <h3 className={styles.featuresCardLabel}>Tone & Niche Architect</h3>
            <p className={styles.featuresCardDesc}>
              Define your brand voice and select target niches to align all generated content automatically.
            </p>
          </div>

          {/* Card 2: Multi-Platform Crafter */}
          <div className={`${styles.featuresCard} ${styles.featuresCardGreen}`}>
            <div className={styles.featuresCardHeader}>
              <span className={styles.featuresCardStep}>02</span>
              <span className={styles.featuresCardArrow}><ArrowUpRight size={14} /></span>
            </div>
            <h3 className={styles.featuresCardLabel}>Multi-Platform Crafter</h3>
            <p className={styles.featuresCardDesc}>
              Create tailored drafts for all major social channels simultaneously with just a single click.
            </p>
          </div>

          {/* Card 3: Product Suite Compiler */}
          <div className={`${styles.featuresCard} ${styles.featuresCardGrey}`}>
            <div className={styles.featuresCardHeader}>
              <span className={styles.featuresCardStep}>03</span>
              <span className={styles.featuresCardArrow}><ArrowUpRight size={14} /></span>
            </div>
            <h3 className={styles.featuresCardLabel}>Product Suite Compiler</h3>
            <p className={styles.featuresCardDesc}>
              Convert your post drafts into templates, checklists, or short ebooks to sell them instantly.
            </p>
          </div>
        </div>
      </section>

      {/* ——— TESTIMONIALS SECTION ——— */}
      <section className={styles.testimonialsSection} ref={testimonialsRef}>
        <div className={styles.testimonialsHeader}>
          <h2 className={styles.testimonialsTitle}>Trusted by <span className={styles.testimonialsTitleAccent}>creators</span></h2>
          <p className={styles.testimonialsDesc}>See what creators are saying about turning their content into revenue with StudioFlow.</p>
        </div>

        <div className={styles.testimonialsCluster}>
          <div className={styles.marqueeTrack}>
            {/* ── First set ── */}
            <div className={`${styles.testimonialCard} ${styles.testimonialCardBlack}`}>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Within minutes of starting, I turned my LinkedIn post drafts into a $15 checklist. Made my first sale within 2 hours. Extremely simple tool!</p>
              <div className={styles.testimonialAuthor}>Stephen A.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardLavender}`}>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Super professional and clean. Converting my X threads into monetized PDF checklists is a 1-click process now. Highly recommended!</p>
              <div className={styles.testimonialAuthor}>Sara L.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardWhite1}`}>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>I recently used StudioFlow to compile my guide. The workflow is incredibly smooth and the output ownership structure is 100% transparent.</p>
              <div className={styles.testimonialAuthor}>Alex M.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardWhite2}`}>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Really useful system. The AI Tone Architect matches my writing voice perfectly. I don&apos;t sound like a generic chatbot anymore.</p>
              <div className={styles.testimonialAuthor}>Barry W.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardChartreuse}`}>
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Converted three of my newsletter articles into a short course outline. StudioFlow handled the pricing suggestion and structure instantly. Exceptional.</p>
              <div className={styles.testimonialAuthor}>Simon F.</div>
            </div>
            {/* ── Duplicate set for seamless loop ── */}
            <div className={`${styles.testimonialCard} ${styles.testimonialCardBlack}`} aria-hidden="true">
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Within minutes of starting, I turned my LinkedIn post drafts into a $15 checklist. Made my first sale within 2 hours. Extremely simple tool!</p>
              <div className={styles.testimonialAuthor}>Stephen A.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardLavender}`} aria-hidden="true">
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Super professional and clean. Converting my X threads into monetized PDF checklists is a 1-click process now. Highly recommended!</p>
              <div className={styles.testimonialAuthor}>Sara L.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardWhite1}`} aria-hidden="true">
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>I recently used StudioFlow to compile my guide. The workflow is incredibly smooth and the output ownership structure is 100% transparent.</p>
              <div className={styles.testimonialAuthor}>Alex M.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardWhite2}`} aria-hidden="true">
              <div className={styles.testimonialStars}><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /><Star size={14} /></div>
              <p className={styles.testimonialText}>Really useful system. The AI Tone Architect matches my writing voice perfectly. I don&apos;t sound like a generic chatbot anymore.</p>
              <div className={styles.testimonialAuthor}>Barry W.</div>
            </div>
            <div className={`${styles.testimonialCard} ${styles.testimonialCardChartreuse}`} aria-hidden="true">
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
                style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
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
                style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
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
                style={{ cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
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
          
          {/* Header section (centered layout) */}
          <div className={styles.faqHeaderCol}>
            <h2 className={styles.faqTitle}>
              Frequently asked <span className={styles.faqTitleAccent}>questions</span>
            </h2>
            <p className={styles.faqDesc}>
              Have questions about StudioFlow? Learn how our AI-powered creator workspace helps you turn ideas into platform-ready posts and monetized digital products.
            </p>
          </div>

          {/* Accordion Items Container */}
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
      </section>

      {/* ——— FOOTER ——— */}
      <footer className={styles.footerMockupSection} ref={footerRef}>
          
          <div className={styles.footerGrid}>
            
            {/* Column 1: Brand Logo & Title + Socials */}
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
              
              {/* Social Media Links */}
              <div className={styles.footerSocials}>
                <a href="#" className={styles.footerSocialIcon} aria-label="Twitter/X">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="#" className={styles.footerSocialIcon} aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className={styles.footerSocialIcon} aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Navigation Links 1 */}
            <div className={styles.footerNavCol}>
              <Link href="/" className={styles.footerLink}>Home</Link>
              <Link href="/#how-it-works" className={styles.footerLink}>How It Works</Link>
              <Link href="/#features" className={styles.footerLink}>Features</Link>
              <Link href="/#pricing" className={styles.footerLink}>Pricing</Link>
              <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
            </div>

            {/* Column 3: Navigation Links 2 */}
            <div className={styles.footerNavCol}>
              <Link href="/dashboard" className={styles.footerLink}>Idea Architect</Link>
              <Link href="/dashboard" className={styles.footerLink}>Content Crafter</Link>
              <Link href="/dashboard" className={styles.footerLink}>Product Generator</Link>
              <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
              <span className={styles.footerLinkDummy}>GDPR Compliant</span>
            </div>

            {/* Column 4: Contact & Info with Pink Circle Icons */}
            <div className={styles.footerContactCol}>
              
              <div className={styles.footerContactItem}>
                <div className={styles.footerContactCircle}>
                  <MapPin size={14} />
                </div>
                <span className={styles.footerContactText}>Antigravity Workspace, Chennai</span>
              </div>

              <div className={styles.footerContactItem}>
                <div className={styles.footerContactCircle}>
                  <Phone size={14} />
                </div>
                <span className={styles.footerContactText}>+91 0123456789</span>
              </div>

              <div className={styles.footerContactItem}>
                <div className={styles.footerContactCircle}>
                  <Mail size={14} />
                </div>
                <span className={styles.footerContactText}>support@studioflow.ai</span>
              </div>

            </div>

          </div>

          {/* Compliance disclaimers row */}
          <div className={styles.footerComplianceRow}>
            <p className={styles.footerComplianceText}>
              Generated by StudioFlow AI. You own this content (non-exclusive). GDPR: Access, export, or delete your data anytime.
            </p>
            <p className={styles.footerComplianceText}>
              &copy; 2026 StudioFlow. All Rights Reserved.
            </p>
          </div>


      </footer>
    </div>
  );
}
