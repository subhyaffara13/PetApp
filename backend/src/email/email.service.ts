import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface ItemizedReceiptData {
  receiptNumber: string;
  customerName: string;
  providerName: string;
  providerAddress?: string;
  type: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    description?: string;
  }>;
  subtotal: number;
  taxAmount: number;
  taxRate?: number;
  deliveryFee?: number;
  discountAmount?: number;
  total: number;
  currency?: string;
  paymentMethod?: {
    type: string;
    cardBrand?: string;
    last4?: string;
    transactionId?: string;
  };
  paidAt?: Date;
}

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

  async sendPasswordResetEmail(
    to: string,
    resetLink: string,
    userName?: string,
  ): Promise<{ success: boolean; id?: string; message: string }> {
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
          <tr>
            <td style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); padding: 28px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🐾 PetSOS</h1>
              <p style="color: #e0f2fe; margin: 6px 0 0 0; font-size: 14px;">Emergency Veterinary & Community Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 28px;">
              <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">Password Reset Request</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px 0;">Hello <strong>${displayName}</strong>,</p>
              <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Click the button below to choose a new, secure password. This link is valid for <strong>1 hour</strong>.
              </p>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" target="_blank" style="background-color: #0284c7; color: #ffffff; padding: 14px 32px; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 10px; display: inline-block;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 24px 0 0 0; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                Direct link: <a href="${resetLink}" style="color: #0284c7;">${resetLink}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    if (!this.resend) {
      this.logger.log(`[Dev Email Simulation] Password reset to: ${to} | Link: ${resetLink}`);
      return { success: true, message: 'Password reset link sent (simulated in development mode).' };
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
        return { success: false, message: 'Failed to deliver reset email.' };
      }

      return { success: true, id: response.data?.id, message: 'Password reset link sent to your email.' };
    } catch (err: any) {
      this.logger.error(`Error sending email: ${err?.message}`);
      return { success: false, message: 'Email service error.' };
    }
  }

  /**
   * Generates and dispatches a comprehensive, official itemized receipt email
   */
  async sendItemizedReceiptEmail(to: string, receipt: ItemizedReceiptData): Promise<boolean> {
    const curr = receipt.currency || '₪';
    const dateStr = receipt.paidAt ? new Date(receipt.paidAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString();

    const itemsHtml = receipt.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 8px; color: #1e293b; font-size: 14px; font-weight: 600;">
            ${item.name}
            ${item.description ? `<br><span style="font-size: 11px; color: #64748b; font-weight: 400;">${item.description}</span>` : ''}
          </td>
          <td style="padding: 12px 8px; color: #64748b; font-size: 14px; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px 8px; color: #64748b; font-size: 14px; text-align: right;">${curr}${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 12px 8px; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${curr}${item.lineTotal.toFixed(2)}</td>
        </tr>`,
      )
      .join('');

    const subject = `🧾 Official Receipt — #${receipt.receiptNumber} (${receipt.providerName})`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Official PetSOS Receipt</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.35);">
          <!-- Top Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: left;">
              <table width="100%">
                <tr>
                  <td>
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">🐾 PetSOS</h1>
                    <p style="color: #bae6fd; margin: 4px 0 0 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      Official Tax Invoice & Payment Receipt
                    </p>
                  </td>
                  <td align="right">
                    <span style="background: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 800;">
                      PAID ✓
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Receipt Details Meta -->
          <tr>
            <td style="padding: 24px 24px 16px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <table width="100%">
                <tr>
                  <td style="vertical-align: top;">
                    <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Receipt Number</p>
                    <p style="margin: 2px 0 0; font-size: 15px; color: #0f172a; font-weight: 800;">#${receipt.receiptNumber}</p>

                    <p style="margin: 12px 0 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Customer</p>
                    <p style="margin: 2px 0 0; font-size: 13px; color: #1e293b; font-weight: 600;">${receipt.customerName}</p>
                  </td>
                  <td style="vertical-align: top; text-align: right;">
                    <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Service Provider</p>
                    <p style="margin: 2px 0 0; font-size: 14px; color: #0284c7; font-weight: 800;">${receipt.providerName}</p>
                    ${receipt.providerAddress ? `<p style="margin: 2px 0 0; font-size: 11px; color: #64748b;">${receipt.providerAddress}</p>` : ''}

                    <p style="margin: 12px 0 0; font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase;">Date & Time</p>
                    <p style="margin: 2px 0 0; font-size: 12px; color: #475569;">${dateStr}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Itemized Table -->
          <tr>
            <td style="padding: 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <thead>
                  <tr style="border-bottom: 2px solid #cbd5e1;">
                    <th style="padding: 8px; text-align: left; font-size: 11px; color: #64748b; text-transform: uppercase;">Item / Service</th>
                    <th style="padding: 8px; text-align: center; font-size: 11px; color: #64748b; text-transform: uppercase;">Qty</th>
                    <th style="padding: 8px; text-align: right; font-size: 11px; color: #64748b; text-transform: uppercase;">Unit Price</th>
                    <th style="padding: 8px; text-align: right; font-size: 11px; color: #64748b; text-transform: uppercase;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Financial Summary Breakdown -->
              <table width="100%" style="margin-top: 20px; border-top: 2px solid #e2e8f0; padding-top: 12px;">
                <tr>
                  <td style="padding: 4px 8px; color: #64748b; font-size: 13px;">Subtotal</td>
                  <td style="padding: 4px 8px; color: #1e293b; font-size: 13px; font-weight: 600; text-align: right;">${curr}${receipt.subtotal.toFixed(2)}</td>
                </tr>
                ${
                  receipt.deliveryFee
                    ? `<tr>
                  <td style="padding: 4px 8px; color: #64748b; font-size: 13px;">Wolt 30-Min Courier Delivery</td>
                  <td style="padding: 4px 8px; color: #0284c7; font-size: 13px; font-weight: 600; text-align: right;">${curr}${receipt.deliveryFee.toFixed(2)}</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 4px 8px; color: #64748b; font-size: 13px;">VAT / Tax (${Math.round((receipt.taxRate || 0.17) * 100)}%)</td>
                  <td style="padding: 4px 8px; color: #1e293b; font-size: 13px; font-weight: 600; text-align: right;">${curr}${receipt.taxAmount.toFixed(2)}</td>
                </tr>
                ${
                  receipt.discountAmount
                    ? `<tr>
                  <td style="padding: 4px 8px; color: #10b981; font-size: 13px;">Promotional Discount</td>
                  <td style="padding: 4px 8px; color: #10b981; font-size: 13px; font-weight: 600; text-align: right;">-${curr}${receipt.discountAmount.toFixed(2)}</td>
                </tr>`
                    : ''
                }
                <tr style="border-top: 2px solid #0f172a;">
                  <td style="padding: 10px 8px 4px; color: #0f172a; font-size: 16px; font-weight: 800;">Total Paid</td>
                  <td style="padding: 10px 8px 4px; color: #0284c7; font-size: 18px; font-weight: 900; text-align: right;">${curr}${receipt.total.toFixed(2)}</td>
                </tr>
              </table>

              <!-- Payment Method Info -->
              <div style="margin-top: 20px; background-color: #f1f5f9; border-radius: 8px; padding: 12px 16px;">
                <p style="margin: 0; font-size: 12px; color: #475569;">
                  💳 <strong>Payment Method:</strong> ${receipt.paymentMethod?.cardBrand ? `${receipt.paymentMethod.cardBrand.toUpperCase()} •••• ${receipt.paymentMethod.last4}` : 'Credit Card via Stripe Secure Gateway'}
                </p>
                <p style="margin: 4px 0 0; font-size: 11px; color: #94a3b8;">
                  Saved automatically to your PetSOS Profile & Order History.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">
                © ${new Date().getFullYear()} PetSOS Platform Ltd. All itemized records are VAT compliant.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    if (!this.resend) {
      this.logger.log(`[Dev Email Simulation] Itemized Receipt to: ${to} | Receipt: ${receipt.receiptNumber} | Total: ${curr}${receipt.total}`);
      return true;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
      });
      return true;
    } catch (err) {
      this.logger.warn('Failed to send itemized receipt email:', err);
      return false;
    }
  }

  /**
   * Dispatches Co-Parent invitation email with 24-hour expiration notice
   */
  async sendCoParentInviteEmail(
    to: string,
    invite: {
      petName: string;
      petPassportId: string;
      inviterName: string;
      role: string;
      expiresAt: Date;
    },
  ): Promise<boolean> {
    const subject = `🐾 ${invite.inviterName} invited you to co-parent ${invite.petName} (Passport: ${invite.petPassportId})`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#0f172a;font-family:system-ui,sans-serif;color:#f1f5f9;">
  <div style="max-width:520px;margin:0 auto;background:#1e293b;border-radius:16px;padding:28px;border:1px solid #334155;">
    <h2 style="color:#38bdf8;margin:0 0 12px;">🐾 Pet Co-Parent Invitation</h2>
    <p style="font-size:15px;line-height:1.6;color:#cbd5e1;">
      <strong>${invite.inviterName}</strong> has invited you to share caretaking access for <strong>${invite.petName}</strong> (Passport ID: <span style="color:#38bdf8;font-weight:700;">#${invite.petPassportId}</span>).
    </p>
    <div style="background:#0f172a;padding:14px;border-radius:10px;margin:16px 0;border:1px solid #475569;">
      <p style="margin:0;font-size:13px;color:#f59e0b;">⏳ <strong>Time-Sensitive:</strong> This invitation is valid for <strong>24 hours</strong> only.</p>
    </div>
    <p style="font-size:13px;color:#94a3b8;">Log into your PetSOS app and open your Pet Passport Inbox to Accept or Decline.</p>
  </div>
</body>
</html>`;

    if (!this.resend) {
      this.logger.log(`[Dev Email Simulation] Co-Parent Invite to: ${to} for pet: ${invite.petName}`);
      return true;
    }

    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: [to],
        subject,
        html,
      });
      return true;
    } catch (err) {
      this.logger.warn('Failed to send co-parent invite email:', err);
      return false;
    }
  }

  async sendOrderConfirmationEmail(to: string, order: { orderId: string; total: number; shopName: string; itemsCount: number }): Promise<boolean> {
    return this.sendItemizedReceiptEmail(to, {
      receiptNumber: `REC-${order.orderId}`,
      customerName: 'Valued Customer',
      providerName: order.shopName,
      type: 'marketplace',
      items: [
        {
          name: `${order.shopName} Pet Supplies Package`,
          quantity: order.itemsCount,
          unitPrice: order.total / order.itemsCount,
          lineTotal: order.total,
        },
      ],
      subtotal: order.total / 1.17,
      taxAmount: order.total - order.total / 1.17,
      total: order.total,
    });
  }
}
