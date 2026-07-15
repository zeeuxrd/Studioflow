import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "1025"),
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
  secure: process.env.SMTP_SECURE === "true",
});

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  const from = process.env.SMTP_FROM || "noreply@studioflow.app";

  await transporter.sendMail({
    from,
    to: email,
    subject: "Reset your Studioflow password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #e318b0;">Studioflow</h1>
        <p>Someone requested a password reset for your account.</p>
        <a href="${resetLink}" style="display: inline-block; background: #e318b0; color: #fff; padding: 12px 24px; border-radius: 100px; text-decoration: none; font-weight: 600; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
}
