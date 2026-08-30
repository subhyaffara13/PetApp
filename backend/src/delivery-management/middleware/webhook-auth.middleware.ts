import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface AuthenticatedWebhookRequest extends Request {
  rawBody?: Buffer;
}

/**
 * Verifies HMAC-SHA256 signatures on incoming DaaS webhooks (Wolt Drive / Uber Direct)
 * with constant-time equality check and replay attack prevention.
 */
export const verifyDaaSWebhookSignature = (provider: 'wolt_drive' | 'uber_direct') => {
  return (req: AuthenticatedWebhookRequest, res: Response, next: NextFunction) => {
    const signatureHeader = (req.headers['x-daas-signature'] || req.headers['x-wolt-signature'] || req.headers['x-uber-signature']) as string | undefined;
    const timestampHeader = req.headers['x-daas-timestamp'] as string | undefined;

    // Allow mock/dev environment testing if signature is explicitly skipped or in development
    if (process.env.NODE_ENV !== 'production' && (!signatureHeader || signatureHeader === 'mock_test_signature')) {
      return next();
    }

    if (!signatureHeader || Array.isArray(signatureHeader)) {
      return res.status(401).json({ error: 'Missing or invalid webhook signature header' });
    }

    const secret = provider === 'wolt_drive'
      ? process.env.WOLT_WEBHOOK_SECRET || 'wolt_dev_secret'
      : process.env.UBER_WEBHOOK_SECRET || 'uber_dev_secret';

    if (!secret) {
      return res.status(500).json({ error: 'Webhook secret unconfigured' });
    }

    // Replay attack prevention: Reject pings older than 5 minutes (300 seconds)
    if (timestampHeader && typeof timestampHeader === 'string') {
      const pingTime = parseInt(timestampHeader, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      if (Math.abs(currentTime - pingTime) > 300) {
        return res.status(403).json({ error: 'Webhook timestamp expired (replay detected)' });
      }
    }

    const rawPayload = req.rawBody || Buffer.from(JSON.stringify(req.body));
    const hmac = crypto.createHmac('sha256', secret);

    const dataToSign = timestampHeader ? `${timestampHeader}.${rawPayload.toString('utf8')}` : rawPayload;
    const computedSignature = hmac.update(dataToSign).digest('hex');

    const sigBuf = Buffer.from(signatureHeader);
    const compBuf = Buffer.from(computedSignature);

    if (sigBuf.length !== compBuf.length || !crypto.timingSafeEqual(sigBuf, compBuf)) {
      return res.status(401).json({ error: 'Invalid HMAC signature' });
    }

    next();
  };
};
