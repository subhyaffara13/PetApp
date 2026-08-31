import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { validateEnvironment } from './config/env';

async function bootstrap() {
  try {
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

    // Dynamic CORS Origin allowlist
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
        if (!origin) return callback(null, true);
        const allowed =
          allowedOrigins.includes(origin) ||
          origin.endsWith('.petsos.com') ||
          origin.endsWith('.run.app') ||
          /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?$/.test(origin) ||
          /^https?:\/\/\d{1,3}(\.\d{1,3}){3}(:\d+)?$/.test(origin) ||
          isDev;
        return callback(null, allowed);
      },
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type,Accept,Authorization,x-clinic-token,x-api-key',
    });

    const port = Number(process.env.PORT) || 8080;
    await app.listen(port, '0.0.0.0');
    console.log(`🐾 PetSOS Backend Server successfully listening on 0.0.0.0:${port}`);
  } catch (error) {
    console.error('❌ FATAL: Server failed to start:', error);
    process.exit(1);
  }
}
bootstrap();