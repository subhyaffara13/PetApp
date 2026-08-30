import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey && apiKey.startsWith('re_')) {
      this.resend = new Resend(apiKey);
      this.logger.log('✅ Resend Email Service initialized.');
    } else {
      this.logger.warn('⚠️ RESEND_API_KEY not configured. Outgoing emails will be logged to console in dev mode.');
    }
    this.fromEmail = this.configService.get<string>('EMAIL_FROM') || 'PetSOS <onboarding@resend.dev>';
  }

  async sendPasswordResetEmail(to: string, resetLink: string, userName?: string): Promise<{ success: boolean; id?: string; message: string }> {
    const displayName = userName || 'Pet Parent';
    const subject = '🐾 Reset Your PetSOS Password';

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your PetSOS Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 28px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                🐾 PetSOS
              </h1>
              <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 14px;">
                Emergency Veterinary & Community Platform
              </p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
                Password Reset Request
              </h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">
                Hello <strong>${displayName}</strong>,
              </p>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                We received a request to reset the password for your PetSOS account. Click the button below to choose a new, secure password. This link is valid for <strong>1 hour</strong>.
              </p>
              <!-- Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" style="background-color: #0284c7; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 2px 8px rgba(2, 132, 199, 0.35);">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                If the button above doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetLink}" style="color: #0284c7; word-break: break-all; font-size: 12px;">${resetLink}</a>
              </p>
              <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 16px 0 0 0;">
                If you did not request this password reset, please disregard this email. Your pet's profile and data remain completely safe.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} PetSOS Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    if (!this.resend) {
      this.logger.log(`[Dev Email Simulation] To: ${to} | Subject: ${subject} | Link: ${resetLink}`);
      return {
        success: true,
        message: 'Password reset link sent (simulated in development mode).',
      };
    }

    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
      });

      if (response.error) {
        this.logger.error(`Resend email delivery failed for ${to}:`, response.error);
        return {
          success: false,
          message: 'Failed to deliver reset email. Please check your email configuration.',
        };
      }

      this.logger.log(`Password reset email delivered to ${to} (Message ID: ${response.data?.id})`);
      return {
        success: true,
        id: response.data?.id,
        message: 'Password reset link sent to your email.',
      };
    } catch (err: any) {
      this.logger.error(`Error sending email via Resend: ${err?.message}`);
      return {
        success: false,
        message: 'Email service encounter an error. Please try again.',
      };
    }
  }

  async sendOrderConfirmationEmail(to: string, order: { orderId: string; total: number; shopName: string; itemsCount: number }): Promise<boolean> {
    if (!this.resend) {
      this.logger.log(`[Dev Email Simulation] Order Confirmation to: ${to} | Order: ${order.orderId}`);
      return true;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject: `🐾 Order Confirmed — #${order.orderId}`,
        html: `
          <h2>Thank you for your order!</h2>
          <p>Your order <strong>#${order.orderId}</strong> at <strong>${order.shopName}</strong> has been confirmed.</p>
          <p>Total: <strong>₪${order.total.toFixed(2)}</strong> (${order.itemsCount} items)</p>
          <p>Track your delivery in real-time on the PetSOS app.</p>
        `,
      });
      return true;
    } catch (err) {
      this.logger.warn('Failed to send order email:', err);
      return false;
    }
  }
}
