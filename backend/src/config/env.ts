import { z } from 'zod';
import { Logger } from '@nestjs/common';

const logger = new Logger('AtomicEnvValidator');

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // --- App URLs -----------------------------------------------
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  CLINIC_PORTAL_URL: z.string().default('http://localhost:5174'),
  STORE_PORTAL_URL: z.string().default('http://localhost:5175'),
  ADMIN_PORTAL_URL: z.string().default('http://localhost:5176'),

  // --- Database -----------------------------------------------
  MONGO_DB_CONNECTION_STRING: z.string().optional(),
  USE_ATLAS: z.string().optional(),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),

  // --- JWT Auth -----------------------------------------------
  JWT_SECRET: z.string().default('petsos_jwt_dev_secret_change_in_production'),
  JWT_REFRESH_SECRET: z.string().default('petsos_refresh_dev_secret_change_in_production'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // --- Stripe Payments ----------------------------------------
  STRIPE_SECRET_KEY: z.string().default('sk_test_mock_stripe_key'),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().default('whsec_mock_stripe_secret'),

  // --- Cloudinary (Image Uploads) -----------------------------
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // --- Wolt Drive DaaS ----------------------------------------
  WOLT_DRIVE_API_KEY: z.string().default('wolt_mock_dev_key'),
  WOLT_WEBHOOK_SECRET: z.string().default('wolt_mock_webhook_secret_dev'),

  // --- Uber Direct DaaS ---------------------------------------
  UBER_DIRECT_CLIENT_ID: z.string().default('uber_mock_client_id'),
  UBER_DIRECT_CLIENT_SECRET: z.string().default('uber_mock_secret'),
  UBER_WEBHOOK_SECRET: z.string().default('uber_mock_webhook_secret_dev'),

  // --- AI & Maps ----------------------------------------------
  GEMINI_API_KEY: z.string().optional(),
  GOOGLE_PLACES_API_KEY: z.string().optional(),

  // --- Email (Resend) -----------------------------------------
  RESEND_API_KEY: z.string().optional(),

  // --- Admin --------------------------------------------------
  ADMIN_SECRET_TOKEN: z.string().default('petsos-admin-change-me'),

  // --- CORS ---------------------------------------------------
  CORS_ORIGINS: z.string().default(''),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

export function validateEnvironment(): ValidatedEnv {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    logger.error('❌ FATAL: Atomic environment validation failed:');
    result.error.issues.forEach((err) => {
      logger.error(` -> ${err.path.join('.')}: ${err.message}`);
    });
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Server boot aborted due to missing/invalid production environment variables.');
    }
  }

  // Production completeness audit
  if (process.env.NODE_ENV === 'production') {
    const requiredProd: (keyof ValidatedEnv)[] = [
      'MONGO_DB_CONNECTION_STRING',
      'JWT_SECRET',
      'JWT_REFRESH_SECRET',
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'ADMIN_SECRET_TOKEN',
    ];
    for (const key of requiredProd) {
      const val = process.env[key];
      if (!val || val.includes('mock') || val.includes('dev_secret')) {
        logger.warn(`⚠️  PRODUCTION WARNING: ${key} is missing or using a placeholder value.`);
      }
    }

    // Integration readiness audit (warn but don't block)
    const integrations: Array<{ key: keyof ValidatedEnv; name: string; url: string }> = [
      { key: 'WOLT_DRIVE_API_KEY', name: 'Wolt Drive DaaS', url: 'https://developers.wolt.com/docs/drive' },
      { key: 'UBER_DIRECT_CLIENT_ID', name: 'Uber Direct DaaS', url: 'https://developer.uber.com/docs/deliveries' },
      { key: 'GEMINI_API_KEY', name: 'Google Gemini AI', url: 'https://aistudio.google.com/app/apikey' },
    ];
    for (const integration of integrations) {
      if (!process.env[integration.key]) {
        logger.warn(`🔌 INTEGRATION NOT CONFIGURED: ${integration.name} — get credentials at ${integration.url}`);
      }
    }
  }

  logger.log('✅ Atomic environment validation passed.');
  return (result.data || process.env) as ValidatedEnv;
}
