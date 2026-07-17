import type {
  IPaymentProvider,
  PaymentInitParams,
  PaymentLink,
  TransactionData,
  PaymentPlanParams,
  PaymentPlanResult,
  SubscriptionInitParams,
  SubscriptionInitResult,
} from './payment-provider';

const BASE = 'https://api.flutterwave.com/v3';

function getSecret(): string {
  const key = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!key || key.startsWith('FLWSECK-xxxxxxxx')) {
    throw new Error('Flutterwave secret key not configured');
  }
  return key;
}

export class FlutterwaveProvider implements IPaymentProvider {
  async initializePayment(params: PaymentInitParams): Promise<PaymentLink> {
    const res = await fetch(`${BASE}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getSecret()}`,
      },
      body: JSON.stringify({
        tx_ref: params.tx_ref,
        amount: params.amount,
        currency: 'NGN',
        redirect_url: params.redirect_url,
        customer: { email: params.email },
        meta: { title: params.title, buyer_email: params.email },
        configurations: { session_duration: 30 },
      }),
    });

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Flutterwave payment initialization failed');
    }

    return { link: data.data.link, reference: params.tx_ref };
  }

  async verifyTransaction(id: number): Promise<TransactionData> {
    const res = await fetch(`${BASE}/transactions/${id}/verify`, {
      headers: { Authorization: `Bearer ${getSecret()}` },
    });

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Transaction verification failed');
    }

    return data.data;
  }

  async getTransactionByReference(txRef: string): Promise<TransactionData[]> {
    const res = await fetch(`${BASE}/transactions/by_reference?tx_ref=${txRef}`, {
      headers: { Authorization: `Bearer ${getSecret()}` },
    });

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Transaction lookup by reference failed');
    }

    return Array.isArray(data.data) ? data.data : [data.data];
  }

  async createPaymentPlan(params: PaymentPlanParams): Promise<PaymentPlanResult> {
    const res = await fetch(`${BASE}/payment-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getSecret()}`,
      },
      body: JSON.stringify({
        name: params.name,
        amount: params.amount,
        interval: params.interval,
        currency: params.currency || 'NGN',
        duration: 0,
      }),
    });

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to create payment plan');
    }

    return { plan_id: data.data.id, plan_token: data.data.plan_token };
  }

  async initiateSubscription(params: SubscriptionInitParams): Promise<SubscriptionInitResult> {
    const res = await fetch(`${BASE}/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getSecret()}`,
      },
      body: JSON.stringify({
        tx_ref: params.tx_ref,
        amount: params.amount,
        currency: 'NGN',
        payment_plan: params.payment_plan,
        redirect_url: params.redirect_url,
        customer: { email: params.email },
      }),
    });

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Subscription initiation failed');
    }

    return { link: data.data.link };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    const res = await fetch(`${BASE}/subscriptions/${subscriptionId}/cancel`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getSecret()}` },
    });

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to cancel subscription');
    }

    return true;
  }
}

export const paymentProvider: IPaymentProvider = new FlutterwaveProvider();
