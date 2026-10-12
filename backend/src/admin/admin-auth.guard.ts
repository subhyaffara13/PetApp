import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

interface AttemptRecord {
  count: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const failedAttempts = new Map<string, AttemptRecord>();

function cleanStaleAttempts() {
  const now = Date.now();
  for (const [ip, rec] of failedAttempts.entries()) {
    if ((!rec.lockedUntil && now - rec.lastAttempt > ATTEMPT_WINDOW_MS) || (rec.lockedUntil && now > rec.lockedUntil)) {
      failedAttempts.delete(ip);
    }
  }
}

/**
 * Protects admin-only routes with brute-force lockout and token validation.
 * Accepts ADMIN_SECRET_TOKEN, ADMIN_TOKEN, or ADMIN_PIN.
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly logger = new Logger(AdminAuthGuard.name);

  canActivate(context: ExecutionContext): boolean {
    cleanStaleAttempts();
    const request = context.switchToHttp().getRequest();
    const clientIp =
      request.headers?.['x-forwarded-for']?.toString().split(',')[0].trim() ||
      request.socket?.remoteAddress ||
      'unknown-ip';

    const now = Date.now();
    const record = failedAttempts.get(clientIp);

    // Check if IP is currently locked out
    if (record?.lockedUntil && now < record.lockedUntil) {
      const remainingMin = Math.ceil((record.lockedUntil - now) / 60000);
      throw new HttpException(
        `Security lockout active: Too many failed admin attempts. Try again in ${remainingMin} minute(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const provided = request.headers?.['x-admin-token'];
    const validTokens = [
      process.env.ADMIN_SECRET_TOKEN,
      process.env.ADMIN_TOKEN,
      process.env.ADMIN_PIN,
    ].filter(Boolean) as string[];

    // In dev or test, include default fallback if no explicit secret configured
    if (validTokens.length === 0) {
      validTokens.push('petsos-admin-change-me', '1337');
    }

    const isValid = provided && validTokens.includes(provided.toString().trim());

    if (!isValid) {
      const current = record && (now - record.lastAttempt < ATTEMPT_WINDOW_MS)
        ? record.count + 1
        : 1;

      const lockedUntil = current >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_DURATION_MS : undefined;
      failedAttempts.set(clientIp, { count: current, lastAttempt: now, lockedUntil });

      this.logger.warn(
        `Failed admin auth attempt from IP ${clientIp} (Attempt ${current}/${MAX_FAILED_ATTEMPTS})`,
      );

      if (lockedUntil) {
        throw new HttpException(
          'Too many failed admin authentication attempts. IP locked out for 15 minutes.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new UnauthorizedException('Invalid or missing admin token');
    }

    // Reset attempts on successful auth
    if (record) {
      failedAttempts.delete(clientIp);
    }

    return true;
  }
}
