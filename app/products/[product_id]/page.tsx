import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from '../product.module.css';
import CheckoutSection from '@/components/checkout/CheckoutSection';

interface Props {
  params: Promise<{ product_id: string }>;
}

interface Obj {
  [key: string]: unknown;
}

function getStr(val: unknown, ...keys: string[]): string | undefined {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object') {
    for (const k of keys) {
      const v = (val as Obj)[k];
      if (typeof v === 'string') return v;
    }
  }
  return undefined;
}

function mapItems(arr: unknown[]): string[] {
  return arr.map((item) => {
    return getStr(item, 'title', 'name', 'chapter', 'module') ?? JSON.stringify(item);
  });
}

function renderStructure(structure: unknown): { label: string; items: string[] } {
  if (Array.isArray(structure)) {
    return { label: 'What\u2019s Inside', items: mapItems(structure) };
  }

  if (structure && typeof structure === 'object') {
    const obj = structure as Obj;
    for (const [key, label] of [['chapters', 'Chapters'], ['modules', 'Modules'], ['sections', 'Sections'], ['items', 'Includes']] as const) {
      if (key in obj && Array.isArray(obj[key])) {
        return { label, items: mapItems(obj[key] as unknown[]) };
      }
    }
    const entries = Object.entries(obj);
    if (entries.length > 0) {
      return {
        label: 'Structure',
        items: entries.map(([k, v]) => `${k}${typeof v === 'string' ? `: ${v}` : ''}`)
      };
    }
  }

  if (typeof structure === 'string') {
    return { label: 'What\u2019s Inside', items: [structure] };
  }

  return { label: 'What\u2019s Inside', items: [] };
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default async function ProductPage({ params }: Props) {
  const { product_id } = await params;

  const product = await prisma.productDefinition.findUnique({
    where: { product_id },
    include: { source_post: true },
  });

  if (!product || product.status !== 'published') {
    notFound();
  }

  const { label: structureLabel, items: structureItems } = renderStructure(product.content_structure);

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon} />
          <span className={styles.logoText}>StudioFlow</span>
        </Link>
        <Link href="/" className={styles.backLink}>
          &larr; Back
        </Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          <span className={styles.badge}>{capitalize(product.product_type)}</span>

          <h1 className={styles.title}>{product.title}</h1>

          <div className={styles.priceRow}>
            <span className={styles.priceSymbol}>&#8358;</span>
            <span className={styles.priceAmount}>{(product.monetization_price_suggestion / 100).toLocaleString()}</span>
            <span className={styles.priceLabel}>one-time payment</span>
          </div>

          <hr className={styles.divider} />

          {structureItems.length > 0 && (
            <>
              <div className={styles.sectionLabel}>{structureLabel}</div>
              <ul className={styles.structureList}>
                {structureItems.map((item, idx) => (
                  <li key={idx} className={styles.structureItem}>
                    <span className={styles.structureItemNumber}>{idx + 1}</span>
                    <span className={styles.structureItemText}>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {product.source_post && (
            <div className={styles.sourceSection}>
              <hr className={styles.divider} />
              <div className={styles.sectionLabel}>From This Post</div>
              <div className={styles.sourcePost}>
                &ldquo;{product.source_post.content_body.slice(0, 200)}{product.source_post.content_body.length > 200 ? '...' : ''}&rdquo;
              </div>
            </div>
          )}

          <div className={styles.ctaSection}>
            <CheckoutSection productId={product.product_id} price={product.monetization_price_suggestion} />
          </div>
        </div>
      </main>
    </div>
  );
}
