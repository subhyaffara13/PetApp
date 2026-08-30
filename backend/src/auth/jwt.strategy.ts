import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, AuthUserPayload } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'petsos_jwt_dev_secret_change_in_production',
    });
  }

  async validate(payload: AuthUserPayload) {
    const user = await this.authService.validateUserById(payload.sub);
    if (!user || !user.isActive) return null;
    const userId = (user as any)._id?.toString() || (user as any).id;
    return { id: userId, email: user.email, name: user.name, role: user.role, avatar: user.avatar || '' };
  }
}
