'use client';

import { useEffect, useState } from 'react';

export default function UsageBadge() {
  const [data, setData] = useState<{ used: number; limit: number | null; plan: string } | null>(null);

  function fetchStatus() {
    fetch('/api/subscriptions/status')
      .then((r) => r.json())
      .then((d) => {
        if (d.plan) {
          setData({
            used: d.generations?.used || 0,
            limit: d.generations?.limit,
            plan: d.plan_label || d.plan,
          });
        }
      })
      .catch((err) => console.error('UsageBadge fetch failed:', err));
  }

  useEffect(() => {
    fetchStatus();
    window.addEventListener('refresh-ideas', fetchStatus);
    return () => window.removeEventListener('refresh-ideas', fetchStatus);
  }, []);

  if (!data) return null;

  return (
    <div style={{
      padding: '10px 16px',
      margin: '0 12px 12px',
      background: 'var(--color-palette-primary-87)',
      borderRadius: 10,
      fontSize: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: 'var(--color-on-background)', fontWeight: 600, opacity: 0.7 }}>{data.plan}</span>
        <span style={{ color: 'var(--color-on-background)', opacity: 0.5 }}>
          {data.used}{data.limit !== null ? ` / ${data.limit}` : ''}
        </span>
      </div>
      {data.limit !== null && (
        <div style={{
          height: 4,
          background: 'color-mix(in srgb, var(--color-on-surface) 12%, transparent)',
          borderRadius: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min((data.used / data.limit) * 100, 100)}%`,
            height: '100%',
            background: data.used >= data.limit ? '#ff6b6b' : 'var(--color-primary)',
            borderRadius: 2,
            transition: 'width 0.3s',
          }} />
        </div>
      )}
    </div>
  );
}
