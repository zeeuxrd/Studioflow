import Link from 'next/link';

export default function VerifySuccessPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E0F10', color: '#fff', fontFamily: 'sans-serif', padding: 40 }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Email verified!</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>Your email has been verified. You can now use all StudioFlow features.</p>
        <Link href="/dashboard" style={{ display: 'inline-block', background: '#a88aed', color: '#fff', padding: '12px 32px', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}>
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
