"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Package, 
  Search, 
  BookOpen,
  Rocket,
  FileText,
  Plus,
  Trash2,
  X
} from "lucide-react";
import styles from "../dashboard.module.css";

interface ProductItem {
  product_id: string;
  product_type: string;
  title: string;
  content_structure: any;
  monetization_price_suggestion: number;
  status: string;
  source_post: { 
    content_body: string; 
    platform_type: string;
    idea?: {
      created_at?: string;
    };
  };
}

type Tab = "all" | "draft" | "published";
type SortField = "name" | "price" | "type";
type SortOrder = "asc" | "desc";

export default function ProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToPublish, setProductToPublish] = useState<string | null>(null);

  // Layout and control states
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
      fetch(`/api/products`)
      .then(r => r.json())
      .then(data => setProducts(data.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const handlePublish = (productId: string) => {
    setProductToPublish(productId);
    setShowConfirmModal(true);
  };

  const executePublish = async (productId: string) => {
    setPublishing(productId);
    try {
      const res = await fetch('/api/agent/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to publish');
      setProducts(prev => prev.map(p => p.product_id === productId ? { ...p, status: 'published' } : p));
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setPublishing(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products?ids=${Array.from(selectedIds).join(',')}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts(prev => prev.filter(p => !selectedIds.has(p.product_id)));
      setSelectedIds(new Set());
      setShowDeleteModal(false);
    } catch (err: any) {
      alert('Error deleting products: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Selection managers
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === sortedItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedItems.map(i => i.product_id)));
    }
  };

  const getProductIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "ebook":
        return <BookOpen size={16} />;
      case "checklist":
        return <FileText size={16} />;
      case "course":
        return <Rocket size={16} />;
      case "template":
        return <Package size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  // Filter items by tab and search query
  const getFilteredItems = (): ProductItem[] => {
    // Only show published digital products
    let filtered = products.filter(p => p.status === "published");

    // Search query filter
    if (!searchQuery.trim()) return filtered;
    const query = searchQuery.toLowerCase();
    return filtered.filter(p => 
      p.title.toLowerCase().includes(query) ||
      p.product_type.toLowerCase().includes(query) ||
      (p.source_post?.content_body && p.source_post.content_body.toLowerCase().includes(query))
    );
  };

  // Sort filtered items
  const getSortedItems = (filteredItems: ProductItem[]): ProductItem[] => {
    return [...filteredItems].sort((a, b) => {
      let comparison = 0;
      if (sortField === "name") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === "price") {
        comparison = a.monetization_price_suggestion - b.monetization_price_suggestion;
      } else if (sortField === "type") {
        comparison = a.product_type.localeCompare(b.product_type);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  };

  if (status === "loading" || !userId) {
    return <div className={styles.loader}><div className={styles.spinner}></div></div>;
  }

  const filteredItems = getFilteredItems();
  const sortedItems = getSortedItems(filteredItems);

  return (
    <>
      <div className={`${styles.libraryWrapper} ${styles.productsPage}`} style={{ paddingTop: "88px", paddingLeft: "16px", paddingRight: "16px" }}>
      {/* Header matching Content Library */}
      <header className={`${styles.libraryHeader} ${styles.productsHeader}`}>
        <div className={styles.libraryTitleSec}>
          <h1 className={styles.libraryTitle} style={{ margin: 0, lineHeight: 1.2, marginBottom: 2 }}>Products</h1>
          <p className={styles.librarySubtitle} style={{ margin: 0 }}>Your published digital products</p>
        </div>

        <div className={styles.libraryControls}>
          {/* Real-time search */}
          <div className={styles.librarySearchWrap}>
            <Search size={16} />
            <input 
              type="text" 
              className={styles.librarySearchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button 
            className={`${styles.libraryNewBtn} ${styles.productsCreateBtn}`}
            onClick={() => router.push("/dashboard")}
          >
            <Plus size={16} />
            <span>Create Product</span>
          </button>
        </div>
      </header>

      {/* Filter pills & view toggle bar */}
      {/* Sleek Floating Bottom Bulk Bar for Multiple Selections */}
      {selectedIds.size > 1 && (
        <div className={styles.floatingBulkBar}>
          <div className={styles.floatingBulkInfo}>
            <span className={styles.floatingBulkBadge}>{selectedIds.size}</span>
            <span>selected</span>
          </div>
          <div className={styles.floatingBulkActions}>
            <button
              className={styles.floatingDeleteBtn}
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
            <button
              className={styles.floatingCancelBtn}
              onClick={() => setSelectedIds(new Set())}
              title="Clear selection"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Main content rendering */}
      <div className={styles.libraryContent}>
        {loading ? (
          <div className={styles.loader}><div className={styles.spinner}></div></div>
        ) : sortedItems.length === 0 ? (
          <div className={styles.libraryEmpty}>
            <div style={{ marginBottom: 8 }}><Package size={40} style={{ opacity: 0.3 }} /></div>
            <p className={styles.productsEmptyText} style={{ margin: 0 }}>No products found. Turn your posts into digital products from the Idea Architect.</p>
          </div>
        ) : (
          /* Grid Layout (Cards) */
          <div className={styles.libraryGrid}>
            {sortedItems.map(product => {
              const isSelected = selectedIds.has(product.product_id);
              return (
                <div 
                  key={product.product_id}
                  className={`${styles.libraryGridCard} ${isSelected ? styles.libraryGridCardSelected : ""}`}
                >
                  <div className={styles.libraryGridCardHeader}>
                    <input 
                      type="checkbox" 
                      className={styles.libraryCheckbox}
                      checked={isSelected}
                      onChange={() => handleToggleSelect(product.product_id)}
                    />
                    <div className={`${styles.libraryTypeIcon} ${styles.libraryTypeIconProduct}`} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "2px 10px", borderRadius: "100px", width: "auto", height: "24px" }}>
                      {getProductIcon(product.product_type)}
                      <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "capitalize" }}>{product.product_type}</span>
                    </div>
                  </div>

                  <div className={styles.libraryGridCardBody}>
                    <p className={styles.libraryGridCardTitle} title={product.title}>
                      {product.title}
                    </p>
                    <p className={styles.libraryGridCardDesc}>
                      Source: {product.source_post?.platform_type} Post
                    </p>
                    <div className={styles.libraryGridCardPriceRow}>
                      <span className={styles.libraryGridCardPrice}>
                        <span className={styles.currencySymbol}>&#8358;</span>{(product.monetization_price_suggestion / 100).toLocaleString()}
                      </span>
                        {product.status === "published" ? (
                          <Link
                            href={`/products/${product.product_id}`}
                            target="_blank"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "2px 12px",
                              borderRadius: "100px",
                              height: "24px",
                              fontSize: "12px",
                              fontWeight: 600,
                              textDecoration: "none",
                              color: "var(--color-primary)",
                              background: "color-mix(in srgb, var(--color-primary) 12%, transparent)",
                            }}
                          >
                            View <span style={{ fontSize: "14px", lineHeight: 1 }}>&#8599;</span>
                          </Link>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "2px 10px", borderRadius: "100px", height: "24px", width: "auto", background: "color-mix(in srgb, var(--color-palette-neutral-90) 40%, transparent)" }}>
                            <FileText size={14} />
                            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "capitalize", color: "var(--color-on-surface)" }}>{product.status}</span>
                          </div>
                        )}
                      </div>
                  </div>

                  <div className={styles.libraryGridCardFooter} style={{ borderTop: "none", paddingTop: 0 }}>
                    {isSelected && selectedIds.size === 1 && (
                      <div style={{ marginTop: "12px", width: "100%" }}>
                        <button
                          className={styles.singleCardDeleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteModal(true);
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Delete Product</span>
                        </button>
                      </div>
                    )}
                    {product.status === "draft" && !(isSelected && selectedIds.size === 1) ? (
                      <button
                        className={styles.libraryNewBtn}
                        style={{ width: "100%", justifyContent: "center", marginTop: "16px" }}
                        onClick={() => handlePublish(product.product_id)}
                        disabled={publishing === product.product_id}
                      >
                        <Rocket size={14} />
                        <span>{publishing === product.product_id ? "Publishing..." : "Publish Product"}</span>
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>

    {showConfirmModal && (
      <div className={styles.modalOverlay} onClick={() => { setShowConfirmModal(false); setProductToPublish(null); }}>
        <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
          <Rocket size={34} className={styles.modalIcon} />
          <h2 className={styles.modalTitle}>Publish Product?</h2>
          <p className={styles.modalText}>
            You are about to publish an AI-generated product. Ensure it meets your quality standards and does not impersonate others.
          </p>
          <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "16px" }}>
            <button 
              className={styles.secondaryBtn} 
              style={{ flex: 1, justifyContent: "center" }} 
              onClick={() => { setShowConfirmModal(false); setProductToPublish(null); }}
            >
              Cancel
            </button>
            <button 
              className={styles.libraryNewBtn} 
              style={{ flex: 1, justifyContent: "center" }} 
              onClick={() => {
                if (productToPublish) {
                  executePublish(productToPublish);
                }
                setShowConfirmModal(false);
                setProductToPublish(null);
              }}
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    )}

    {showDeleteModal && (
      <div className={styles.modalOverlay} onClick={() => { setShowDeleteModal(false); }}>
        <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
          <Trash2 size={34} className={styles.modalIcon} style={{ color: "var(--color-error)" }} />
          <h2 className={styles.modalTitle}>Delete Products?</h2>
          <p className={styles.modalText}>
            Are you sure you want to delete {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.
          </p>
          <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "16px" }}>
            <button 
              className={styles.secondaryBtn} 
              style={{ flex: 1, justifyContent: "center" }} 
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </button>
            <button 
              className={styles.libraryNewBtn} 
              style={{ flex: 1, justifyContent: "center", background: "var(--color-error)", borderColor: "var(--color-error)" }} 
              onClick={handleDeleteSelected}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
