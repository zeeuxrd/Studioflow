export interface PaymentInitParams {
  amount: number;
  email: string;
  tx_ref: string;
  redirect_url: string;
  title?: string;
}

export interface PaymentLink {
  link: string;
  reference: string;
}

export interface TransactionData {
  id: number;
  tx_ref: string;
  status: string;
  amount: number;
  currency: string;
  customer: { email: string };
  meta?: Record<string, any>;
}

export interface PaymentPlanParams {
  name: string;
  amount: number;
  interval: 'monthly' | 'yearly';
  currency?: string;
}

export interface PaymentPlanResult {
  plan_id: number;
  plan_token: string;
}

export interface SubscriptionInitParams {
  email: string;
  amount: number;
  tx_ref: string;
  payment_plan: number;
  redirect_url: string;
}

export interface SubscriptionInitResult {
  link: string;
}

export interface IPaymentProvider {
  initializePayment(params: PaymentInitParams): Promise<PaymentLink>;
  verifyTransaction(id: number): Promise<TransactionData>;
  getTransactionByReference(txRef: string): Promise<TransactionData[]>;
  createPaymentPlan(params: PaymentPlanParams): Promise<PaymentPlanResult>;
  initiateSubscription(params: SubscriptionInitParams): Promise<SubscriptionInitResult>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
}
