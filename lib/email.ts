import { Resend } from 'resend';
import type { IEmailService, PurchaseEmailParams } from '@/lib/providers/email-provider';

const resend = new Resend(process.env.RESEND_API_KEY || 're_xxxxxxxxx');
const FROM = 'Studioflow <onboarding@resend.dev>';

class ResendEmailService implements IEmailService {
  async sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: 'Verify your Studioflow email',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color: #a88aed;">Studioflow</h1>
          <p style="font-size: 16px; margin: 24px 0;">Welcome! Please verify your email address to get started.</p>
          <a href="${verificationLink}" style="display: inline-block; background: #a88aed; color: #fff; padding: 14px 32px; border-radius: 100px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Verify Email
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 32px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
        </div>
      `,
    });
    if (error) throw new Error(`Resend: ${error.message}`);
  }

  async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [email],
      subject: 'Reset your Studioflow password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color: #a88aed;">Studioflow</h1>
          <p>Someone requested a password reset for your account.</p>
          <a href="${resetLink}" style="display: inline-block; background: #a88aed; color: #fff; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });
    if (error) throw new Error(`Resend: ${error.message}`);
  }

  async sendPurchaseEmail({ buyerEmail, productTitle, downloadLink }: PurchaseEmailParams): Promise<void> {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [buyerEmail],
      subject: `Your purchase: ${productTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="color: #a88aed;">Studioflow</h1>
          <p style="font-size: 18px; font-weight: 600; margin: 24px 0 8px;">Thank you for your purchase!</p>
          <p style="color: #444; margin: 0 0 4px;">You bought <strong>${productTitle}</strong>.</p>
          <p style="color: #444; margin: 0 0 24px;">Click the button below to access your product.</p>
          <a href="${downloadLink}" style="display: inline-block; background: #a88aed; color: #fff; padding: 14px 32px; border-radius: 100px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Access Your Product
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 32px;">If you have any issues, contact support@studioflow.app</p>
        </div>
      `,
    });
    if (error) throw new Error(`Resend: ${error.message}`);
  }
}

export const emailService: IEmailService = new ResendEmailService();

export const { sendVerificationEmail, sendPasswordResetEmail, sendPurchaseEmail } = emailService;
