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
    if (Array.isArray(content)) {
      return (content as any[]).map((item, i) => {
        const heading = item.chapter || item.module || item.item || item.section || item.title || `Section ${i + 1}`;
        const body = item.content || item.description || item.lessons || '';
        return (
          <div key={i} className={styles.sourceSection}>
            <hr className={styles.divider} />
            <h2 className={styles.sectionLabel} style={{ fontSize: 16, color: '#fff', marginBottom: 12 }}>{heading}</h2>
            {typeof body === 'string' ? (
              <div className={styles.sourcePost} style={{ whiteSpace: 'pre-wrap' }}>{body}</div>
            ) : Array.isArray(body) ? (
              body.map((lesson: any, j: number) => (
                <div key={j} style={{ marginBottom: 16 }}>
                  <h3 style={{ color: '#a88aed', fontSize: 14, marginBottom: 6 }}>{lesson.title || `Lesson ${j + 1}`}</h3>
                  <div className={styles.sourcePost} style={{ whiteSpace: 'pre-wrap' }}>{lesson.content || lesson.description || ''}</div>
                </div>
              ))
            ) : null}
          </div>
        );
      });
    }
    if (typeof content === 'object') {
      return <div className={styles.sourcePost} style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(content, null, 2)}</div>;
    }
    return <div className={styles.sourcePost} style={{ whiteSpace: 'pre-wrap' }}>{String(content)}</div>;
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
