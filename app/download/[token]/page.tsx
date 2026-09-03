import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from '../../products/product.module.css';
import DownloadActions from '@/components/download/DownloadActions';

interface Props {
  params: Promise<{ token: string }>;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default async function DownloadPage({ params }: Props) {
  const { token } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { download_token: token },
    include: {
      product: {
        include: { source_post: true },
      },
    },
  });

  if (!transaction || transaction.status !== 'successful') {
    notFound();
  }

  if (!transaction.downloaded_at) {
    await prisma.transaction.update({
      where: { download_token: token },
      data: { downloaded_at: new Date() },
    });
  }

  const product = transaction.product;

  function renderFullContent(content: unknown): React.ReactNode {
    if (!content) return null;
    const str = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    const blocks = str.split(/\n\s*\n/);
    return blocks.map((block, idx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;
      if (trimmed.startsWith('##')) {
        return (
          <h2 key={idx} style={{ fontSize: '20px', fontWeight: 800, margin: '32px 0 14px', color: 'var(--color-on-surface, #fff)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            {trimmed.replace(/^##\s*/, '')}
          </h2>
        );
      }
      if (trimmed.startsWith('---')) {
        return <hr key={idx} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '32px 0' }} />;
      }
      if (trimmed.startsWith('**Key Takeaways') || trimmed.startsWith('**Action Steps')) {
        return (
          <h4 key={idx} style={{ fontSize: '15px', fontWeight: 700, color: '#a88aed', margin: '24px 0 10px' }}>
            {trimmed.replace(/\*\*/g, '')}
          </h4>
        );
      }
      return (
        <p key={idx} style={{ fontSize: '15px', lineHeight: 1.8, margin: '0 0 18px', color: 'var(--color-on-surface, #e0e0e0)', maxWidth: '72ch' }}>
          {trimmed}
        </p>
      );
    });
  }

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIcon} />
          <span className={styles.logoText}>StudioFlow</span>
        </Link>
        <DownloadActions token={token} />
        <Link href="/" className={styles.backLink}>
          &larr; Home
        </Link>
      </nav>

      <main className={styles.main}>
        <div className={styles.card}>
          <span className={styles.badge}>{capitalize(product.product_type)}</span>

          <h1 className={styles.title}>{product.title}</h1>

          {renderFullContent(product.full_content)}

          {!product.full_content && product.source_post && (
            <div className={styles.sourceSection}>
              <hr className={styles.divider} />
              <div className={styles.sectionLabel}>Original Content</div>
              <div className={styles.sourcePost}>
                {product.source_post.content_body}
              </div>
            </div>
          )}

          <hr className={styles.divider} />

          <p className={styles.disclaimer}>
            Thank you for your purchase! This content is provided as-is and is yours to keep.
          </p>
        </div>
      </main>
    </div>
  );
}
