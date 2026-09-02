"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { 
  Package, 
  BarChart3, 
  LogOut,
  MessageSquarePlus,
  Search,
  MessageCircle,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Zap,
  HelpCircle,
  Moon,
  Sun,
  CheckCircle,
  Check
} from "lucide-react";
import styles from "./dashboard.module.css";
import landingStyles from "../page.module.css";
import UsageBadge from '@/components/dashboard/UsageBadge';

const NAV_ITEMS = [
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [chatsOpen, setChatsOpen] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const handleSubscribePlan = async (planKey: string) => {
    setSubscribing(planKey);
    try {
      const res = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billing_period: billingPeriod }),
      });
      const data = await res.json();
      if (res.ok && data.link) {
        window.location.href = data.link;
      } else {
        alert(data.error || `Upgrading to ${planKey.toUpperCase()} plan initiated.`);
        setUpgradeModalOpen(false);
      }
    } catch (err: any) {
      alert("Error initiating upgrade: " + err.message);
    } finally {
      setSubscribing(null);
    }
  };
  const searchInputRef = useRef<HTMLInputElement>(null);
  const recentChats = chats.slice(0, 5);
  const filteredChats = recentChats.filter((chat) =>
    (chat.idea?.idea_text || chat.content_body || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const userId = session?.user?.id;

  const fetchChats = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/posts`);
      const data = await res.json();
      if (res.ok) {
        setChats(data.posts || []);
      }
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchChats();
    }
  }, [userId]);

  useEffect(() => {
    const handleRefresh = () => fetchChats();
    window.addEventListener("refresh-ideas", handleRefresh);
    return () => window.removeEventListener("refresh-ideas", handleRefresh);
  }, [userId]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleNewChat = () => {
    setMobileMenuOpen(false);
    window.dispatchEvent(new Event("new-chat"));
    if (pathname !== "/dashboard") {
      router.push("/dashboard");
    }
  };

  const userName = session?.user?.name || "Creator";
  const userEmail = session?.user?.email || "creator@studioflow.ai";

  // Load and apply theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("studioflow-theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <div className={`${styles.dashboardLayout} ${theme === "dark" ? "dark-theme" : ""}`}>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar (Left) */}
      <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarBrand}>
          <span className={styles.sidebarLogo}>
            <Image src="/images/assets/favicon.svg" alt="StudioFlow" width={20} height={20} />
          </span>
          <span className={styles.sidebarBrandName}>StudioFlow</span>
          <button 
            className={styles.mobileCloseBtn}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Chat Button */}
        <button className={styles.sidebarLink} onClick={handleNewChat} style={{ marginBottom: '8px' }}>
          <MessageSquarePlus size={18} />
          <span>New Chat</span>
        </button>



        {/* Navigation Items */}
        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ""}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Search Chats Section */}
          <div className={styles.searchSection}>
            <div className={styles.searchInputWrap}>
              <Search size={14} className={styles.searchIcon} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          {/* Recent Chats Expandable List */}
          <button 
            className={`${styles.sidebarLink} ${styles.chatsToggle}`}
            onClick={() => setChatsOpen(!chatsOpen)}
          >
            <div className={styles.chatsToggleLeft} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={16} />
              <span>Recent Chats</span>
            </div>
            {chatsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>

          {chatsOpen && (
            <div className={styles.chatsDropdown}>
              {filteredChats.length === 0 ? (
                <div className={styles.chatsEmpty}>
                  {searchQuery ? "No matching chats" : "No recent chats"}
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <button
                    key={chat.post_id || chat.idea_id}
                    className={styles.chatItem}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("selected-idea-onload", JSON.stringify(chat));
                        const event = new CustomEvent("select-idea", { detail: chat });
                        window.dispatchEvent(event);
                      }
                      if (pathname !== "/dashboard") {
                        router.push("/dashboard");
                      }
                    }}
                  >
                    <span className={styles.chatItemTitle}>{chat.idea?.idea_text || chat.content_body?.slice(0, 80)}</span>
                  </button>
                ))
              )}
            </div>
          )}

          <button
            className={styles.sidebarLink}
            onClick={() => {
              setMobileMenuOpen(false);
              alert("Need help? Reach out to support@studioflow.ai");
            }}
          >
            <HelpCircle size={18} />
            <span>Help</span>
          </button>
        </nav>

        <UsageBadge />
        <div className={styles.sidebarFooter}>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {getInitials(userName)}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userEmail}>{userEmail}</span>
            </div>
            <button 
              className={styles.topActionIcon} 
              onClick={() => {
                localStorage.removeItem("selected-idea-onload");
                signOut({ redirectTo: "/signin" });
              }}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace (Middle) */}
      <main className={styles.mainWorkspace}>
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Global Solid Top Bar */}
        <div className={styles.topBar}>
          <div className={styles.topActions}>
            <button 
              className={styles.upgradeBtn}
              onClick={() => setUpgradeModalOpen(true)}
              title="Upgrade Plan"
            >
              <Zap size={15} />
              <span>Upgrade</span>
            </button>
            <button 
              className={styles.topActionIcon} 
              onClick={() => {
                const nextTheme = theme === "light" ? "dark" : "light";
                setTheme(nextTheme);
                document.documentElement.setAttribute("data-theme", nextTheme);
              }}
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>

        {children}
      </main>

      {/* High-End Hero-Styled Pricing Modal */}
      {upgradeModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setUpgradeModalOpen(false)}>
          <div 
            className={styles.modalCard} 
            style={{ 
              maxWidth: 980, 
              width: "95%", 
              maxHeight: "90vh", 
              overflowY: "auto", 
              padding: "36px 28px", 
              borderRadius: 24,
              position: "relative"
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Right Circular Close X Button */}
            <button
              onClick={() => setUpgradeModalOpen(false)}
              aria-label="Close upgrade modal"
              style={{
                position: "absolute",
                top: 18,
                right: 20,
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "var(--color-surface-variant)",
                border: "1px solid var(--color-outline-variant)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--color-on-surface)",
                transition: "all 0.2s ease",
                zIndex: 10
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className={styles.modalHeaderBox}>
              <h2 className={styles.modalHeaderTitle}>
                Flexible plans for every creator
              </h2>
              <p className={styles.modalHeaderSub}>
                Start creating AI-driven posts & digital products today. Cancel anytime.
              </p>

              {/* Monthly / Yearly Toggle */}
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--color-surface-variant)", padding: 4, borderRadius: 100 }}>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("monthly")}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 100,
                    border: "none",
                    background: billingPeriod === "monthly" ? "#1a1a1a" : "transparent",
                    color: billingPeriod === "monthly" ? "#ffffff" : "var(--color-on-surface-variant)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("yearly")}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 100,
                    border: "none",
                    background: billingPeriod === "yearly" ? "#1a1a1a" : "transparent",
                    color: billingPeriod === "yearly" ? "#ffffff" : "var(--color-on-surface-variant)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  Yearly
                </button>
              </div>
            </div>

            {/* Desktop & Mobile Pricing Cards Grid (Fluid Clamp Typography + Responsive Vertical Stacking) */}
            <div className={styles.modalDesktopGrid} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", width: "100%", alignItems: "stretch", marginTop: "12px" }}>
              {/* Card 1: Starter */}
              <div className={landingStyles.pricingCardStandard} style={{ margin: 0, height: "100%", padding: "2.2rem 1.6rem 1.6rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 className={`${landingStyles.pricingCardTitle} ${styles.clampTitle}`}>Starter</h3>
                  <p className={`${landingStyles.pricingCardDesc} ${styles.clampDesc}`} style={{ minHeight: "40px" }}>
                    Perfect for solo creators starting their content journey.
                  </p>
                  <div className={landingStyles.pricingPriceRow} style={{ minHeight: "48px", marginBottom: "1.2rem" }}>
                    <span className={`${landingStyles.pricingPrice} ${styles.clampPrice}`}>
                      &#8358;{billingPeriod === "monthly" ? "7,000" : "20,000"}
                    </span>
                    <div className={landingStyles.pricingPeriodCol}>
                      <span className={landingStyles.pricingPeriod}>monthly</span>
                      <span className={landingStyles.pricingBilledPeriod}>billed {billingPeriod === "monthly" ? "monthly" : "annually"}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`${landingStyles.pricingCardButton} ${landingStyles.pricingCardButtonOutline}`}
                    onClick={() => handleSubscribePlan("starter")}
                    disabled={subscribing === "starter"}
                    style={{ cursor: 'pointer', fontFamily: 'inherit', width: "100%" }}
                  >
                    {subscribing === "starter" ? "Redirecting..." : "Choose Starter"}
                  </button>
                </div>
                
                <div>
                  <div className={landingStyles.pricingCardDivider} style={{ margin: "1.5rem 0 1.2rem" }}></div>
                  <ul className={landingStyles.pricingFeaturesList} style={{ margin: 0 }}>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      50 AI content generations/mo
                    </li>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      2 platform integrations
                    </li>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      Basic analytics
                    </li>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      Idea Architect tool
                    </li>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      Email support
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card 2: Creator (Featured Popular) */}
              <div className={landingStyles.pricingCardStandard} style={{ margin: 0, height: "100%", padding: "2.2rem 1.6rem 1.6rem", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", border: "2px solid var(--color-primary)", backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, var(--color-surface))" }}>
                <span className={styles.mostPopularBadge}>
                  MOST POPULAR
                </span>

                <div>
                  <h3 className={`${landingStyles.pricingCardTitle} ${styles.clampTitle}`}>Creator</h3>
                  <p className={`${landingStyles.pricingCardDesc} ${styles.clampDesc}`} style={{ minHeight: "40px" }}>
                    For growing creators ready to scale their content output.
                  </p>
                  <div className={landingStyles.pricingPriceRow} style={{ minHeight: "48px", marginBottom: "1.2rem" }}>
                    <span className={`${landingStyles.pricingPrice} ${styles.clampPrice}`} style={{ color: "var(--color-primary)" }}>
                      &#8358;{billingPeriod === "monthly" ? "14,000" : "50,000"}
                    </span>
                    <div className={landingStyles.pricingPeriodCol}>
                      <span className={landingStyles.pricingPeriod}>monthly</span>
                      <span className={landingStyles.pricingBilledPeriod}>billed {billingPeriod === "monthly" ? "monthly" : "annually"}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`${landingStyles.pricingCardButton} ${landingStyles.pricingCardButtonPrimary}`}
                    onClick={() => handleSubscribePlan("creator")}
                    disabled={subscribing === "creator"}
                    style={{ cursor: 'pointer', fontFamily: 'inherit', width: "100%" }}
                  >
                    {subscribing === "creator" ? "Redirecting..." : "Upgrade to Creator"}
                  </button>
                </div>
                
                <div>
                  <div className={landingStyles.pricingCardDivider} style={{ margin: "1.5rem 0 1.2rem" }}></div>
                  <ul className={landingStyles.pricingFeaturesList} style={{ margin: 0 }}>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      200 AI content generations/mo
                    </li>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      All platform integrations
                    </li>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      Advanced analytics
                    </li>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      Content Crafter + Product Generator
                    </li>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      Priority support
                    </li>
                  </ul>
                </div>
              </div>

              {/* Card 3: Pro (Hidden on Mobile) */}
              <div className={`${landingStyles.pricingCardStandard} ${styles.hideOnMobile}`} style={{ margin: 0, height: "100%", padding: "2.2rem 1.6rem 1.6rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 className={`${landingStyles.pricingCardTitle} ${styles.clampTitle}`}>Pro</h3>
                  <p className={`${landingStyles.pricingCardDesc} ${styles.clampDesc}`} style={{ minHeight: "40px" }}>
                    For teams & agencies managing multiple client accounts.
                  </p>
                  <div className={landingStyles.pricingPriceRow} style={{ minHeight: "48px", marginBottom: "1.2rem" }}>
                    <span className={`${landingStyles.pricingPrice} ${styles.clampPrice}`}>
                      &#8358;{billingPeriod === "monthly" ? "30,000" : "100,000"}
                    </span>
                    <div className={landingStyles.pricingPeriodCol}>
                      <span className={landingStyles.pricingPeriod}>monthly</span>
                      <span className={landingStyles.pricingBilledPeriod}>billed {billingPeriod === "monthly" ? "monthly" : "annually"}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`${landingStyles.pricingCardButton} ${landingStyles.pricingCardButtonOutline}`}
                    onClick={() => handleSubscribePlan("pro")}
                    disabled={subscribing === "pro"}
                    style={{ cursor: 'pointer', fontFamily: 'inherit', width: "100%" }}
                  >
                    {subscribing === "pro" ? "Redirecting..." : "Choose Pro"}
                  </button>
                </div>
                
                <div>
                  <div className={landingStyles.pricingCardDivider} style={{ margin: "1.5rem 0 1.2rem" }}></div>
                  <ul className={landingStyles.pricingFeaturesList} style={{ margin: 0 }}>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      Unlimited AI generations
                    </li>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      Multi-account management
                    </li>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      Custom branding & exports
                    </li>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      All AI agent tools
                    </li>
                    <li className={`${landingStyles.pricingFeatureItem} ${styles.clampFeature}`}>
                      <Check className={landingStyles.pricingCheckmark} size={20} />
                      Dedicated account manager
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
