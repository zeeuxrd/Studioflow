"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './analytics.module.css';

interface MetricData {
  totalRevenue: number;
  productsPublished: number;
  totalSales: number;
}

interface Event {
  tracking_id: string;
  conversion_type: string;
  revenue_estimate: number;
  created_at: string;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<MetricData | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const userId = localStorage.getItem('studioflow_user_id');
        if (!userId) {
          throw new Error("User not found. Generate a product first.");
        }

        const res = await fetch(`/api/analytics?user_id=${userId}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to load analytics');

        setMetrics(data.metrics);
        setEvents(data.events);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className={styles.container} style={{ justifyContent: 'center' }}>Loading Revenue Data...</div>;
  }

  if (error) {
    return <div className={styles.container} style={{ justifyContent: 'center', color: 'var(--color-error)' }}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <Link href="/dashboard" className={styles.backBtn}>
        &larr; Back to Dashboard
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>Revenue Tracking</h1>
      </header>

      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Estimated Revenue</div>
          <div className={`${styles.metricValue} ${styles.metricValuePrimary}`}>
            ${metrics?.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Products Published</div>
          <div className={styles.metricValue}>{metrics?.productsPublished || 0}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Simulated Sales</div>
          <div className={styles.metricValue}>{metrics?.totalSales || 0}</div>
        </div>
      </div>

      <div className={styles.feedContainer}>
        <h2 className={styles.feedTitle}>Recent Activity</h2>
        {events.length === 0 ? (
          <p style={{ color: 'var(--color-on-surface-variant)' }}>No activity yet. Publish a product to see revenue tracking!</p>
        ) : (
          events.map(event => (
            <div key={event.tracking_id} className={styles.feedItem}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className={styles.feedIcon}>
                  {event.conversion_type === 'purchase' ? '💸' : '📦'}
                </div>
                <div className={styles.feedInfo}>
                  <div className={styles.feedDesc}>
                    {event.conversion_type === 'purchase' ? 'Product Sale' : 'Product Published'}
                  </div>
                  <div className={styles.feedTime}>
                    {new Date(event.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
              {event.conversion_type === 'purchase' && (
                <div className={styles.feedRevenue}>+${event.revenue_estimate}</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
