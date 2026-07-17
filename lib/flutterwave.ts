export {
  paymentProvider,
  FlutterwaveProvider,
} from '@/lib/providers/flutterwave-provider';

export type {
  IPaymentProvider,
  PaymentInitParams,
  PaymentLink,
  TransactionData,
} from '@/lib/providers/payment-provider';

import { paymentProvider } from '@/lib/providers/flutterwave-provider';

export const initializePayment = paymentProvider.initializePayment.bind(paymentProvider);
export const verifyTransaction = paymentProvider.verifyTransaction.bind(paymentProvider);
export const getTransactionByReference = paymentProvider.getTransactionByReference.bind(paymentProvider);
export const createPaymentPlan = paymentProvider.createPaymentPlan.bind(paymentProvider);
export const initiateSubscription = paymentProvider.initiateSubscription.bind(paymentProvider);
export const cancelFlutterwaveSubscription = paymentProvider.cancelSubscription.bind(paymentProvider);
