export interface PurchaseEmailParams {
  buyerEmail: string;
  productTitle: string;
  downloadLink: string;
}

export interface IEmailService {
  sendVerificationEmail(email: string, verificationLink: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetLink: string): Promise<void>;
  sendPurchaseEmail(params: PurchaseEmailParams): Promise<void>;
}
