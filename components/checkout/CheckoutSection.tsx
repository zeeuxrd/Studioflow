'use client';

import { useState, useEffect, useRef } from 'react';
import styles from '../../app/products/product.module.css';

interface Props {
  productId: string;
  price: number;
}

export default function CheckoutSection({ productId, price }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tx_ref = params.get('tx_ref') || '';
    const transaction_id = params.get('transaction_id') || '';
    console.log('Payment redirect params:', { tx_ref, transaction_id, all: window.location.search });
    if (!tx_ref && !transaction_id) return;

    setVerifying(true);

    const check = () => {
      const url = `/api/verify-payment?tx_ref=${tx_ref}&transaction_id=${transaction_id}`;
      return fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) console.error('Verify error:', data.error);
          if (data.verified) {
            setSuccess(true);
            setVerifying(false);
            if (pollRef.current) clearInterval(pollRef.current);
          }
          if (data.error) setError(data.error);
        })
        .catch((err) => console.error('Verify fetch failed:', err));
    };

    check();
    pollRef.current = setInterval(check, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleBuy = async () => {
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, buyer_email: email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment initiation failed');

      window.location.href = data.link;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className={styles.paymentModal}>
        <div className={styles.paymentModalCard}>
          <div className={styles.spinner} />
          <p style={{ fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Verifying payment...</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Please wait while we confirm your transaction</p>
          {error && <p style={{ fontSize: 12, color: '#ff6b6b', marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.paymentModal} onClick={() => setSuccess(false)}>
        <div className={styles.paymentModalCard} onClick={(e) => e.stopPropagation()}>
          <div className={styles.successIcon}>&#10003;</div>
          <p style={{ fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Payment successful!</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px' }}>Your purchase is complete.</p>
          <button className={styles.dismissBtn} onClick={() => setSuccess(false)}>Got it</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ctaSection}>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.emailInput}
      />
      <button
        className={styles.buyBtn}
        onClick={handleBuy}
        disabled={loading}
      >
        {loading ? 'Redirecting...' : `Buy Now \u2014 \u20A6${(price / 100).toLocaleString()}`}
      </button>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
