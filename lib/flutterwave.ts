const BASE = 'https://api.flutterwave.com/v3';

function getSecret(): string {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key || key.startsWith('FLWSECK-xxxxxxxx')) {
    throw new Error('Flutterwave secret key not configured');
  }
  return key;
}

export async function initializePayment({
  amount,
  email,
  tx_ref,
  redirect_url,
  title,
}: {
  amount: number;
  email: string;
  tx_ref: string;
  redirect_url: string;
  title: string;
}) {
  const res = await fetch(`${BASE}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getSecret()}`,
    },
    body: JSON.stringify({
      tx_ref,
      amount,
      currency: 'NGN',
      redirect_url,
      customer: { email },
      meta: { title },
      configurations: { session_duration: 30 },
    }),
  });

  const data = await res.json();
  if (data.status !== 'success') {
    throw new Error(data.message || 'Flutterwave payment initialization failed');
  }

  return { link: data.data.link, reference: tx_ref };
}

export async function verifyTransaction(id: number) {
  const res = await fetch(`${BASE}/transactions/${id}/verify`, {
    headers: { Authorization: `Bearer ${getSecret()}` },
  });

  const data = await res.json();
  if (data.status !== 'success') {
    throw new Error(data.message || 'Transaction verification failed');
  }

  return data.data;
}

export async function getTransactionByReference(txRef: string) {
  const res = await fetch(`${BASE}/transactions/by_reference?tx_ref=${txRef}`, {
    headers: { Authorization: `Bearer ${getSecret()}` },
  });

  const data = await res.json();
  if (data.status !== 'success') {
    throw new Error(data.message || 'Transaction lookup by reference failed');
  }

  return data.data;
}
