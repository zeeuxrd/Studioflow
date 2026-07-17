import crypto from 'crypto';

export function verifyWebhookSignature(
  body: string,
  headers: { verifHash?: string | null; hmacSignature?: string | null },
  secret: string
): boolean {
  if (headers.hmacSignature) {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    const provided = headers.hmacSignature.startsWith('sha256=')
      ? headers.hmacSignature.slice(7)
      : headers.hmacSignature;
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));
  }

  if (headers.verifHash) {
    return headers.verifHash === secret;
  }

  return false;
}
