# Payment Modal Overlay - Implementation Plan

## Files to Modify

### 1. `app/products/product.module.css`
Add these classes after the existing `.error` class:

- **`.paymentModal`** — fixed overlay (`position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 100;`)
- **`.paymentModalCard`** — centered card (`background: #1a1a1a; border-radius: 24px; padding: 48px 40px; max-width: 400px; width: 90%; text-align: center; box-shadow;`)
- **`.spinner`** — 40px circle, border animation with `@keyframes spin`
- **`.successIcon`** — 48px circle with checkmark in brand color
- **`.dismissBtn`** — outline-style button for "Got it", hover fills with primary color

### 2. `components/checkout/CheckoutSection.tsx`
Restructure the component so it returns one of three states:

1. **Verifying state** (first in return order):
   ```tsx
   if (verifying) return (
     <div className={styles.paymentModal}>
       <div className={styles.paymentModalCard}>
         <div className={styles.spinner} />
         <p style={{ fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Verifying payment...</p>
         <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>Please wait while we confirm your transaction</p>
       </div>
     </div>
   );
   ```

2. **Success state** (second in return order):
   ```tsx
   if (success) return (
     <div className={styles.paymentModal} onClick={() => setSuccess(false)}>
       <div className={styles.paymentModalCard} onClick={e => e.stopPropagation()}>
         <div className={styles.successIcon}>✓</div>
         <p style={{ fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>Payment successful!</p>
         <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 16px' }}>Your purchase is complete.</p>
         <button className={styles.dismissBtn} onClick={() => setSuccess(false)}>Got it</button>
       </div>
     </div>
   );
   ```

3. **Default state** (third - email input + Buy button) — unchanged from current code

## No Changes To
- `/api/verify-payment` endpoint
- `/api/payments/initialize` endpoint
- `/api/webhooks/flutterwave` endpoint
- Polling logic inside CheckoutSection

## Flow
```
User pays on Flutterwave
  → Redirects back to /products/{id}?tx_ref=xxx
  → Page loads → useEffect detects tx_ref → setVerifying(true)
  → Full-screen overlay with spinner shows immediately (covers all page content)
  → Polling every 3 seconds checks /api/verify-payment
  → Webhook arrives → Transaction saved in DB
  → Poll detects verified → setSuccess(true)
  → Overlay updates to success modal with checkmark + "Got it"
  → User clicks "Got it" → modal dismissed → product page underneath revealed
```
