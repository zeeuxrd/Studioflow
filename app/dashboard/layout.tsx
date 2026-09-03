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
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [mobilePlanTab, setMobilePlanTab] = useState<"starter" | "creator">("creator");
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
              borderRadius: 24 
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ textAlign: "center", marginBottom: 28, position: "relative" }}>
              <button
                onClick={() => setUpgradeModalOpen(false)}
                style={{
                  position: "absolute",
                  top: -12,
                  right: -12,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-on-surface-variant)"
                }}
              >
                <X size={24} />
              </button>

              <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", color: "var(--color-on-surface)" }}>
                Flexible plans for every creator
              </h2>
              <p style={{ fontSize: 15, color: "var(--color-on-surface-variant)", margin: "0 0 20px" }}>
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
                    background: billingPeriod === "monthly" ? "var(--color-primary)" : "transparent",
                    color: billingPeriod === "monthly" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
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
                    background: billingPeriod === "yearly" ? "var(--color-primary)" : "transparent",
                    color: billingPeriod === "yearly" ? "var(--color-on-primary)" : "var(--color-on-surface-variant)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer"
                  }}
                >
                  Yearly <span style={{ fontSize: 10, background: "rgba(255,255,255,0.2)", padding: "2px 6px", borderRadius: 8, marginLeft: 4 }}>20% OFF</span>
                </button>
              </div>
            </div>

            {/* Pricing Cards Grid (All 3 Plans) */}
            <div className={styles.modalDesktopGrid} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
              {/* Starter */}
              <div style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-outline)",
                borderRadius: 20,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px", color: "var(--color-on-surface)" }}>Starter</h3>
                  <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: "0 0 16px" }}>
                    Perfect for solo creators starting their content journey.
                  </p>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--color-on-surface)", marginBottom: 16 }}>
                    &#8358;{billingPeriod === "monthly" ? "7,000" : "20,000"}
                    <span style={{ fontSize: 12, fontWeight: 400, color: "var(--color-on-surface-variant)" }}>/{billingPeriod === "monthly" ? "mo" : "yr"}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", fontSize: 13, display: "flex", flexDirection: "column", gap: 10 }}>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> 50 AI content generations/mo</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> 2 platform integrations</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> Basic analytics</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> Idea Architect tool</li>
                  </ul>
                </div>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => handleSubscribePlan("starter")}
                  disabled={subscribing === "starter"}
                >
                  {subscribing === "starter" ? "Redirecting..." : "Choose Starter"}
                </button>
              </div>

              {/* Creator (Featured Popular) */}
              <div style={{
                background: "color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))",
                border: "2px solid var(--color-primary)",
                borderRadius: 20,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative"
              }}>
                <span style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--color-primary)",
                  color: "var(--color-on-primary)",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.8px",
                  padding: "4px 12px",
                  borderRadius: 100
                }}>MOST POPULAR</span>

                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: "8px 0 6px", color: "var(--color-on-surface)" }}>Creator</h3>
                  <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: "0 0 16px" }}>
                    For growing creators ready to scale their content output.
                  </p>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--color-primary)", marginBottom: 16 }}>
                    &#8358;{billingPeriod === "monthly" ? "14,000" : "50,000"}
                    <span style={{ fontSize: 12, fontWeight: 400, color: "var(--color-on-surface-variant)" }}>/{billingPeriod === "monthly" ? "mo" : "yr"}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", fontSize: 13, display: "flex", flexDirection: "column", gap: 10 }}>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> 200 AI content generations/mo</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> All platform integrations</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> Advanced analytics</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> Content Crafter + Product Generator</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> Priority support</li>
                  </ul>
                </div>
                <button
                  className={styles.primaryBtn}
                  onClick={() => handleSubscribePlan("creator")}
                  disabled={subscribing === "creator"}
                >
                  {subscribing === "creator" ? "Redirecting..." : "Upgrade to Creator"}
                </button>
              </div>

              {/* Pro */}
              <div style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-outline)",
                borderRadius: 20,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 6px", color: "var(--color-on-surface)" }}>Pro</h3>
                  <p style={{ fontSize: 13, color: "var(--color-on-surface-variant)", margin: "0 0 16px" }}>
                    For teams & agencies managing multiple client accounts.
                  </p>
                  <div style={{ fontSize: 28, fontWeight: 800, color: "var(--color-on-surface)", marginBottom: 16 }}>
                    &#8358;{billingPeriod === "monthly" ? "30,000" : "100,000"}
                    <span style={{ fontSize: 12, fontWeight: 400, color: "var(--color-on-surface-variant)" }}>/{billingPeriod === "monthly" ? "mo" : "yr"}</span>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", fontSize: 13, display: "flex", flexDirection: "column", gap: 10 }}>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> Unlimited AI generations</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> Multi-account management</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> Custom branding & exports</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> All AI agent tools</li>
                    <li style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--color-on-surface)" }}><Check size={16} color="var(--color-primary)" /> Dedicated account manager</li>
                  </ul>
                </div>
                <button
                  className={styles.secondaryBtn}
                  onClick={() => handleSubscribePlan("pro")}
                  disabled={subscribing === "pro"}
                >
                  {subscribing === "pro" ? "Redirecting..." : "Choose Pro"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
