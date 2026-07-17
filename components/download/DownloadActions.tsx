'use client';

import styles from '../../app/products/product.module.css';

interface Props {
  token: string;
}

export default function DownloadActions({ token }: Props) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button
        onClick={() => window.print()}
        className={styles.buyBtn}
        style={{ padding: '8px 20px', fontSize: 13, width: 'auto', border: 'none', cursor: 'pointer' }}
      >
        Save as PDF
      </button>
      <a
        href={`/api/download/${token}`}
        className={styles.buyBtn}
        style={{ padding: '8px 20px', fontSize: 13, width: 'auto', textDecoration: 'none' }}
      >
        Download as Text
      </a>
    </div>
  );
}
