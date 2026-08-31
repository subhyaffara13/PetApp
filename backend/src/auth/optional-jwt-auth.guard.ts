import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * Authenticates a request when an Authorization: Bearer <token> header is present.
 * - If a token is provided it MUST be a valid JWT, otherwise the request is rejected with 401.
 * - If no token is provided the request is treated as an anonymous guest session.
 *
 * This keeps read endpoints usable for guests while guaranteeing that any presented
 * credential is genuinely verified (unlike the previous mock guard).
 */
@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      request.user = { id: 'guest-anonymous', role: 'customer' };
      return true;
    }

    const token = authHeader.split(' ')[1];
    try {
      const payload: any = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      request.user = {
        ...payload,
        id: payload.sub || payload.id,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
