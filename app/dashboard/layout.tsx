"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
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
  X
} from "lucide-react";
import styles from "./dashboard.module.css";

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
          <span className={styles.sidebarLogo}>SF</span>
          <span className={styles.sidebarBrandName}>StudioFlow</span>
        </div>

        {/* New Chat Button */}
        <button className={styles.sidebarLink} onClick={handleNewChat} style={{ marginBottom: '8px' }}>
          <MessageSquarePlus size={18} />
          <span>New Chat</span>
        </button>

        {/* Search button styled like menu links */}
          <button
            className={styles.sidebarLink}
            style={{ marginBottom: '16px' }}
            title="Search"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setSearchQuery("");
              setTimeout(() => searchInputRef.current?.focus(), 100);
            }}
          >
            <Search size={18} />
            <span>Search chats</span>
          </button>

          {searchOpen && (
            <div className={styles.searchSection}>
              <div className={styles.searchInputWrap}>
                <Search size={12} />
                <input
                  ref={searchInputRef}
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchQuery && filteredChats.length === 0 && (
                <span className={styles.searchEmpty}>No results found</span>
              )}
              {searchQuery && filteredChats.map((chat) => (
                <button
                  key={chat.post_id}
                  className={styles.chatItem}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (typeof window !== "undefined") {
                      localStorage.setItem("selected-idea-onload", JSON.stringify(chat));
                    }
                    const event = new CustomEvent("select-idea", { detail: chat });
                    window.dispatchEvent(event);
                    if (pathname !== "/dashboard") {
                      router.push("/dashboard");
                    }
                  }}
                >
                  <span className={styles.chatItemTitle}>{chat.idea?.idea_text || chat.content_body?.slice(0, 80)}</span>
                </button>
              ))}
            </div>
          )}

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button
            className={`${styles.sidebarLink} ${styles.chatsToggle}`}
            onClick={() => {
              setChatsOpen(!chatsOpen);
              if (!chatsOpen && chats.length === 0) fetchChats();
            }}
          >
            <MessageCircle size={18} />
            <span>Chats</span>
            {chatsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {chatsOpen && (
            <div className={styles.chatsDropdown}>
              {chats.length === 0 ? (
                <span className={styles.chatsEmpty}>No chat history yet</span>
              ) : (
                recentChats.map((chat) => (
                  <button
                    key={chat.post_id}
                    className={styles.chatItem}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("selected-idea-onload", JSON.stringify(chat));
                      }
                      const event = new CustomEvent("select-idea", { detail: chat });
                      window.dispatchEvent(event);
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
        </nav>

        <div className={styles.sidebarFooter}>
          {/* User Profile Info */}
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

      {/* Main Workspace (Middle) - wrapped in its layout */}
      <main className={styles.mainWorkspace}>
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        {children}
      </main>

    </div>
  );
}
