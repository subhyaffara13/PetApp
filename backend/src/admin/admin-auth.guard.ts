import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Protects admin-only routes. The client must send the configured admin token
 * in the `x-admin-token` header. Configure it on the server with ADMIN_TOKEN
 * and on the client with VITE_ADMIN_TOKEN — it replaces the previous
 * hardcoded client-side PIN gate.
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const provided = request.headers?.['x-admin-token'];
    const expected = process.env.ADMIN_TOKEN || 'petsos-admin-change-me';

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Invalid or missing admin token');
    }
    return true;
  }
}
