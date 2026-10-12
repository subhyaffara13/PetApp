import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import {
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/login.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(
      body.name,
      body.email,
      body.password,
      body.role,
      body.organizationName,
      body.licenseNumber,
      body.practiceType,
      body.phone,
    );
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('oauth-login')
  @HttpCode(200)
  async oauthLogin(@Body() body: OAuthLoginDto) {
    return this.authService.oauthLogin(
      body.name,
      body.email,
      body.avatar,
      body.role,
    );
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(
      body.token,
      body.email,
      body.newPassword,
    );
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() req: any,
    @Body()
    body: { name?: string; avatar?: string; phone?: string; city?: string },
  ) {
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
