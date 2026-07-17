import { prisma } from '@/lib/prisma';
import { generateDownloadToken } from '@/lib/utils';
import { sendPurchaseEmail } from '@/lib/email';
import type { TransactionData } from '@/lib/providers/payment-provider';

interface PurchaseResult {
  downloadToken: string;
  ownerId: string;
  productTitle: string;
}

type FlutterwaveWebhookData = TransactionData & {
  meta?: { buyer_email?: string; title?: string };
};

export async function recordPurchase(txRef: string, flutterwaveData: FlutterwaveWebhookData): Promise<PurchaseResult | null> {
  const productId = txRef.split('_')[1];
  const product = await prisma.productDefinition.findUnique({
    where: { product_id: productId },
    include: { source_post: { include: { idea: true } } },
  });
  if (!product) return null;

  const ownerId = product.source_post.idea.user_id;
  const paidKobo = flutterwaveData.amount * 100;

  const existingTxn = await prisma.transaction.findUnique({
    where: { reference: txRef },
  });
  if (existingTxn) {
    return existingTxn.download_token
      ? { downloadToken: existingTxn.download_token, ownerId, productTitle: product.title }
      : null;
  }

  const downloadToken = generateDownloadToken();

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        transaction_id: String(flutterwaveData.id),
        reference: txRef,
        product_id: product.product_id,
        buyer_email: flutterwaveData.meta?.buyer_email || flutterwaveData.customer?.email || '',
        amount: paidKobo,
        currency: flutterwaveData.currency || 'NGN',
        status: 'successful',
        download_token: downloadToken,
      },
    }),
    prisma.monetizationTracking.create({
      data: {
        user_id: ownerId,
        content_id: product.product_id,
        conversion_type: 'purchase',
        revenue_estimate: paidKobo,
      },
    }),
  ]);

  sendPurchaseEmail({
    buyerEmail: flutterwaveData.customer?.email || '',
    productTitle: product.title,
    downloadLink: `${process.env.AUTH_URL || 'http://localhost:3000'}/download/${downloadToken}`,
  }).catch((err) => console.error('Purchase email failed:', err));

  return { downloadToken, ownerId, productTitle: product.title };
}
