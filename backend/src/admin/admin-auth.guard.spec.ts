import { ExecutionContext, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { AdminAuthGuard } from './admin-auth.guard';

describe('AdminAuthGuard (Brute-Force Lockout & Token Auth - M-1)', () => {
  let guard: AdminAuthGuard;

  function createMockContext(ip: string, token?: string): ExecutionContext {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            'x-forwarded-for': ip,
            ...(token ? { 'x-admin-token': token } : {}),
          },
          socket: { remoteAddress: ip },
        }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    guard = new AdminAuthGuard();
    process.env.ADMIN_SECRET_TOKEN = 'super-secret-token-123';
  });

  afterEach(() => {
    delete process.env.ADMIN_SECRET_TOKEN;
  });

  it('allows access when valid x-admin-token header is provided', () => {
    const ctx = createMockContext('192.168.1.1', 'super-secret-token-123');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rejects access when invalid x-admin-token header is provided', () => {
    const ctx = createMockContext('192.168.1.2', 'wrong-token');
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects access when token header is omitted', () => {
    const ctx = createMockContext('192.168.1.3');
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('enforces 15-minute lockout (HTTP 429) after 5 consecutive failed attempts from same IP', () => {
    const ip = '10.0.0.99';

    // 4 failed attempts
    for (let i = 0; i < 4; i++) {
      expect(() => guard.canActivate(createMockContext(ip, 'bad-token'))).toThrow(UnauthorizedException);
    }

    // 5th failed attempt triggers lockout exception
    expect(() => guard.canActivate(createMockContext(ip, 'bad-token'))).toThrow(HttpException);

    // Subsequent attempt is blocked by lockout with HTTP 429
    try {
      guard.canActivate(createMockContext(ip, 'even-correct-token-is-locked'));
      fail('Should have thrown HTTP 429');
    } catch (err: any) {
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(err.message).toContain('Security lockout active');
    }
  });

  it('resets failed attempt counter on successful authentication', () => {
    const ip = '10.0.0.88';

    // 2 failed attempts
    expect(() => guard.canActivate(createMockContext(ip, 'bad-token'))).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(createMockContext(ip, 'bad-token'))).toThrow(UnauthorizedException);

    // 1 successful attempt
    expect(guard.canActivate(createMockContext(ip, 'super-secret-token-123'))).toBe(true);

    // Should be able to fail again without immediately hitting lockout
    expect(() => guard.canActivate(createMockContext(ip, 'bad-token'))).toThrow(UnauthorizedException);
  });
});
