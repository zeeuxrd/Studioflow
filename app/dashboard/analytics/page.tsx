"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  DollarSign, 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  HelpCircle, 
  ChevronDown, 
  Calendar,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import dashStyles from "../dashboard.module.css";
import styles from './analytics.module.css';

interface Event {
  tracking_id: string;
  conversion_type: string;
  revenue_estimate: number;
  created_at: string;
  content_id: string;
}

interface ProductItem {
  product_id: string;
  title: string;
  product_type: string;
  monetization_price_suggestion: number;
  status: string;
}

interface UserProfile {
  name: string | null;
  email: string | null;
  niche: string | null;
  tone_preference: string | null;
  platform_focus: string | null;
  monetization_goal: string | null;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id ?? null;

  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    productsPublished: 0,
    totalSales: 0
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "publications" | "sales">("all");
  const [sortField, setSortField] = useState<"date" | "price">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [timeRange, setTimeRange] = useState("All Time");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Analytics Metrics & Events
        const analyticsRes = await fetch(`/api/analytics?user_id=${userId}`);
        const analyticsData = await analyticsRes.json();
        if (!analyticsRes.ok) throw new Error(analyticsData.error || 'Failed to load analytics');

        setMetrics(analyticsData.metrics || { totalRevenue: 0, productsPublished: 0, totalSales: 0 });
        setEvents(analyticsData.events || []);

        // 2. Fetch Products for lookup mapping
        const productsRes = await fetch(`/api/products?user_id=${userId}`);
        const productsData = await productsRes.json();
        if (productsRes.ok) {
          setProducts(productsData.products || []);
        }

        // 3. Fetch Creator Profile
        const profileRes = await fetch(`/api/auth/onboarding`);
        const profileData = await profileRes.json();
        if (profileRes.ok && profileData.user) {
          setProfile(profileData.user);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Product ID to Title map helper
  const productMap = products.reduce((acc, p) => {
    acc[p.product_id] = p.title;
    return acc;
  }, {} as Record<string, string>);

  const handleSort = (field: "date" | "price") => {
    if (sortField === field) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const renderSortIndicator = (field: "date" | "price") => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} style={{ opacity: 0.4 }} />;
    }
    return sortOrder === "asc" 
      ? <ArrowUp size={14} style={{ color: "var(--color-primary)" }} /> 
      : <ArrowDown size={14} style={{ color: "var(--color-primary)" }} />;
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "SF";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // 1. Tab filter
  const getFilteredEvents = (): Event[] => {
    let filtered = events;
    if (activeTab === "publications") {
      filtered = filtered.filter(e => e.conversion_type === "product_creation");
    } else if (activeTab === "sales") {
      filtered = filtered.filter(e => e.conversion_type === "purchase");
    }

    // 2. Search query filter
    if (!searchQuery.trim()) return filtered;
    const query = searchQuery.toLowerCase();
    return filtered.filter(e => {
      const title = productMap[e.content_id] || "Digital Product";
      return (
        title.toLowerCase().includes(query) ||
        e.conversion_type.toLowerCase().includes(query) ||
        e.tracking_id.toLowerCase().includes(query)
      );
    });
  };

  const filteredEvents = getFilteredEvents();

  // 3. Sort
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let comparison = 0;
    if (sortField === "date") {
      comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortField === "price") {
      comparison = (a.revenue_estimate || 0) - (b.revenue_estimate || 0);
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  if (status === "loading" || loading) {
    return (
      <div className={dashStyles.libraryWrapper}>
        <div style={{ color: "var(--color-on-surface-variant)", padding: "2rem", textAlign: "center" }}>
          Loading Revenue Data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={dashStyles.libraryWrapper}>
        <div style={{ color: "var(--color-error)", padding: "2rem", textAlign: "center" }}>
          Error: {error}
        </div>
      </div>
    );
  }

  const recentActivityEvents = events.slice(0, 5);

  return (
    <div className={dashStyles.libraryWrapper}>
      {/* Redesigned Header with actions matching reference */}
      <header className={dashStyles.libraryHeader}>
        <div className={dashStyles.libraryTitleSec}>
          <h1 className={dashStyles.libraryTitle} style={{ margin: 0, lineHeight: 1.68 }}>Revenue & Analytics</h1>
          <p className={dashStyles.librarySubtitle} style={{ lineHeight: 0.84 }}>Monitor your digital product sales, creations, and creator metrics</p>
        </div>

        <div className={dashStyles.libraryControls}>
          {/* Search bar inside header */}
          <div className={dashStyles.librarySearchWrap}>
            <Search size={16} />
            <input 
              type="text" 
              className={dashStyles.librarySearchInput}
              placeholder="Search conversions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Time range selector dropdown matching reference */}
          <div style={{ position: "relative" }}>
            <button
              className={dashStyles.libraryTab}
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "100px", width: "130px" }}
            >
              <Calendar size={14} style={{ opacity: 0.7 }} />
              <span style={{ flex: 1, textAlign: "left", fontSize: "14px" }}>{timeRange}</span>
              <ChevronDown size={14} />
            </button>
            {showTimeDropdown && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "4px", minWidth: "180px", background: "var(--color-background)", border: "1px solid var(--color-outline-variant)", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", overflow: "hidden", zIndex: 10 }}>
                {["All Time", "Last 365 Days", "Last 30 Days", "Last 7 Days"].map((option) => (
                  <button
                    key={option}
                    className={dashStyles.libraryTab}
                    onClick={() => { setTimeRange(option); setShowTimeDropdown(false); }}
                    style={{ width: "100%", borderRadius: 0, border: "none", justifyContent: "flex-start", padding: "10px 16px", background: timeRange === option ? "var(--color-primary-container)" : "transparent", color: timeRange === option ? "var(--color-on-primary-container)" : "var(--color-on-surface-variant)" }}
                    onMouseEnter={(e) => { if (timeRange !== option) e.currentTarget.style.background = "color-mix(in srgb, var(--color-on-surface) 8%, transparent)"; }}
                    onMouseLeave={(e) => { if (timeRange !== option) e.currentTarget.style.background = "transparent"; }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Metrics Grid matching Cost / Order / Completed indicators */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricCardHeader}>
            <span className={styles.metricLabel}>Total Cost (Revenue)</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "color-mix(in srgb, #2e7d32 15%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <DollarSign size={16} style={{ color: "#2e7d32" }} />
            </div>
          </div>
          <div className={`${styles.metricValue} ${styles.metricValuePrimary}`}>
            ${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className={styles.metricSubtitle}>New cost last 365 days</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricCardHeader}>
            <span className={styles.metricLabel}>Total Orders</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "color-mix(in srgb, #ef6c00 12%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={16} style={{ color: "#ef6c00" }} />
            </div>
          </div>
          <div className={styles.metricValue}>
            {metrics.totalSales}
          </div>
          <p className={styles.metricSubtitle}>Total order last 365 days</p>
        </div>

        <div className={styles.metricCard}>
          <div className={styles.metricCardHeader}>
            <span className={styles.metricLabel}>Completed (Published)</span>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "color-mix(in srgb, var(--color-primary) 12%, transparent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle size={16} style={{ color: "var(--color-primary)" }} />
            </div>
          </div>
          <div className={styles.metricValue}>
            {metrics.productsPublished}
          </div>
          <p className={styles.metricSubtitle}>Completed creations last 365 days</p>
        </div>
      </div>

      {/* Split pane layout */}
      <div className={styles.splitLayout}>
        


        {/* Right Column: Tabbed Data Table matching reference */}
        <div className={styles.rightCol}>
          
          <div className={dashStyles.libraryTabsSec} style={{ margin: 0, display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid color-mix(in srgb, var(--color-outline-variant) 60%, transparent)", padding: "16px 16px", borderRadius: "10px 10px 0 0", background: "var(--color-background)", borderBottom: "none" }}>
            <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--color-on-surface)" }}>Conversion History</span>
            <div style={{ position: "relative" }}>
              <button
                className={`${dashStyles.libraryTab} ${dashStyles.libraryTabActive}`}
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                {activeTab === "all" ? "All Conversions" : activeTab === "publications" ? "Publications" : "Sales"}
                <ChevronDown size={14} />
              </button>
              {showDropdown && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "4px", minWidth: "180px", background: "var(--color-background)", border: "1px solid var(--color-outline-variant)", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", overflow: "hidden", zIndex: 10 }}>
                  {(["all", "publications", "sales"] as const).map((tab) => (
                    <button
                      key={tab}
                      className={dashStyles.libraryTab}
                      onClick={() => { setActiveTab(tab); setShowDropdown(false); }}
                      style={{ width: "100%", borderRadius: 0, border: "none", justifyContent: "flex-start", padding: "10px 16px", background: activeTab === tab ? "var(--color-primary-container)" : "transparent", color: activeTab === tab ? "var(--color-on-primary-container)" : "var(--color-on-surface-variant)" }}
                      onMouseEnter={(e) => { if (activeTab !== tab) e.currentTarget.style.background = "color-mix(in srgb, var(--color-on-surface) 8%, transparent)"; }}
                      onMouseLeave={(e) => { if (activeTab !== tab) e.currentTarget.style.background = "transparent"; }}
                    >
                      {tab === "all" ? "All Conversions" : tab === "publications" ? "Publications" : "Sales"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ border: "1px solid color-mix(in srgb, var(--color-outline-variant) 60%, transparent)", borderRadius: "0 0 10px 10px", background: "var(--color-background)", overflow: "hidden" }}>
            <table className={dashStyles.libraryTable}>
              <thead>
                <tr>
                  <th className={dashStyles.libraryTh}>ID</th>
                  <th className={dashStyles.libraryTh}>Product Title</th>
                  <th className={dashStyles.libraryTh} onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      Date {renderSortIndicator("date")}
                    </div>
                  </th>
                  <th className={dashStyles.libraryTh}>Type</th>
                  <th className={dashStyles.libraryTh}>Status</th>
                  <th className={dashStyles.libraryTh} onClick={() => handleSort("price")} style={{ cursor: "pointer", textAlign: "right" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                      Revenue {renderSortIndicator("price")}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
                      No conversion events match your criteria.
                    </td>
                  </tr>
                ) : (
                  sortedEvents.map((evt) => {
                    const isPurchase = evt.conversion_type === "purchase";
                    return (
                      <tr key={evt.tracking_id} className={dashStyles.libraryRow}>
                        <td className={dashStyles.libraryTd} style={{ fontWeight: "700" }}>
                          #{evt.tracking_id.slice(0, 8)}
                        </td>
                        <td className={evt.content_id ? dashStyles.libraryTd : `${dashStyles.libraryTd} styles.libraryTdEmpty`} style={{ maxWidth: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {productMap[evt.content_id] || "Digital Product"}
                        </td>
                        <td className={dashStyles.libraryTd}>
                          {formatDate(evt.created_at)}
                        </td>
                        <td className={dashStyles.libraryTd} style={{ textTransform: "capitalize" }}>
                          {isPurchase ? "Sale" : "Publication"}
                        </td>
                        <td className={dashStyles.libraryTd}>
                          <span className={isPurchase ? styles.statusCompleted : styles.statusPublished}>
                            {isPurchase ? "Completed" : "Published"}
                          </span>
                        </td>
                        <td className={dashStyles.libraryTd} style={{ textAlign: "right", color: isPurchase ? "var(--color-primary)" : "inherit" }}>
                          ${evt.revenue_estimate.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>

    </div>
  );
}
