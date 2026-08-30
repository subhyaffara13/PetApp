import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { validateEnvironment } from './config/env';

async function bootstrap() {
  validateEnvironment();
  const app = await NestFactory.create(AppModule, { rawBody: true });

  const express = require('express');
  app.use(
    express.json({
      verify: (req: any, _res: any, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );

  // Secure ValidationPipe with whitelist & transform to strip injection payloads & sanitize DTO inputs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Register Global Exception Catcher Filter
  const { AllExceptionsFilter } = require('./utils/errors');
  app.useGlobalFilters(new AllExceptionsFilter());

  // Security Headers Middleware
  app.use((_req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Dynamic CORS Origin allowlist.
  // - Always allows: localhost dev origins, petsos.com (web + wildcard subdomains), and any
  //   origin explicitly listed in the CORS_ORIGINS env var (comma-separated) — use this to
  //   whitelist your public IP:port (e.g. CORS_ORIGINS=http://203.0.113.10:5173,http://203.0.113.10:5174).
  // - Mobile apps / curl / server-to-server requests carry no Origin header and are allowed.
  const envOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'https://petsos.com',
    'https://www.petsos.com',
    'https://app.petsos.com',
    'https://clinic.petsos.com',
    'https://store.petsos.com',
    'https://api.petsos.com',
    ...envOrigins,
  ];
  const isDev = process.env.NODE_ENV !== 'production';

  app.enableCors({
    origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow mobile apps / curl / server-to-server requests with no origin
      if (!origin) return callback(null, true);
      const allowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.petsos.com') ||
        /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(origin) ||
        /^https?:\/\/\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(origin) ||
        isDev;
      return callback(null, allowed);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,x-clinic-token,x-api-key',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();