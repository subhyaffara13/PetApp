import { Body, Controller, HttpCode, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { UserRole } from '../schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body()
    body: {
      name: string;
      email: string;
      password: string;
      role?: UserRole;
      organizationName?: string;
      licenseNumber?: string;
      practiceType?: 'stationary_clinic' | 'mobile_vet' | 'none';
    },
  ) {
    return this.authService.register(
      body.name,
      body.email,
      body.password,
      body.role,
      body.organizationName,
      body.licenseNumber,
      body.practiceType,
    );
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('oauth-login')
  @HttpCode(200)
  async oauthLogin(@Body() body: { name: string; email: string; avatar?: string; role?: UserRole }) {
    return this.authService.oauthLogin(body.name, body.email, body.avatar, body.role);
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() body: { token: string; email: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.email, body.newPassword);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Req() req: any, @Body() body: { name?: string; avatar?: string; phone?: string; city?: string }) {
    return this.authService.updateProfile(req.user.id, body);
  }

  @Post('apply-verification')
  @UseGuards(JwtAuthGuard)
  async applyVerification(@Req() req: any, @Body() body: any) {
    return this.authService.applyVerification(req.user.id, body);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully.' };
  }
}
