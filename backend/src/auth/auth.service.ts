import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { EmailService } from '../email/email.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUserPayload {
  sub: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
}

export function validatePasswordComplexity(password: string): { isValid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 number.' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least 1 special character (!@#$%^&*...).' };
  }
  return { isValid: true };
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    // Only seed demo accounts in development — never in production
    if (process.env.NODE_ENV === 'production') return;

    try {
      const defaultUsers: Array<{ email: string; name: string; role: UserRole }> = [
        { email: 'clinic@petsos.app', name: 'Haifa Vet Emergency Hospital', role: 'clinic_admin' },
        { email: 'store@petsos.app', name: 'PetBuy Store Manager', role: 'store_merchant' },
      ];

      for (const u of defaultUsers) {
        const exists = await this.userModel.findOne({ email: u.email });
        if (!exists) {
          const hash = await bcrypt.hash('DemoPass2025!', 12);
          await this.userModel.create({
            email: u.email,
            name: u.name,
            passwordHash: hash,
            role: u.role,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          });
          this.logger.log(`Seeded staff account: ${u.email} (${u.role})`);
        }
      }
    } catch (err: any) {
      this.logger.warn('Initial user seeding notice:', err?.message);
    }
  }

  async register(name: string, email: string, password: string, role: UserRole = 'customer'): Promise<AuthTokens> {
    const complexity = validatePasswordComplexity(password);
    if (!complexity.isValid) {
      throw new BadRequestException(complexity.message);
    }

    const existing = await this.userModel.findOne({ email: email.toLowerCase().trim() });
    if (existing) throw new ConflictException('An account with this email already exists.');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await this.userModel.create({ name, email: email.toLowerCase().trim(), passwordHash, role });

    return this.issueTokens(user);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.userModel.findOne({ email: email.toLowerCase().trim() });
    if (!user || !user.isActive) throw new UnauthorizedException('No active account found with this email. Please register first.');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Incorrect password. Please try again.');

    return this.issueTokens(user);
  }

  async oauthLogin(name: string, email: string, avatar?: string, role: UserRole = 'customer'): Promise<AuthTokens> {
    let user = await this.userModel.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      const dummyHash = await bcrypt.hash(`oauth-${Date.now()}-${Math.random()}`, 10);
      user = await this.userModel.create({
        name: name || 'Google User',
        email: email.toLowerCase().trim(),
        passwordHash: dummyHash,
        avatar: avatar || '',
        role,
      });
    } else {
      if (name && name !== 'Google User') {
        user.name = name;
      }
      if (avatar) {
        user.avatar = avatar;
      }
      await user.save();
    }
    return this.issueTokens(user);
  }

  async forgotPassword(email: string): Promise<{ message: string; resetLink?: string }> {
    const cleanEmail = email.toLowerCase().trim();
    const user = await this.userModel.findOne({ email: cleanEmail });
    if (!user) {
      // Safe response to prevent user enumeration
      return { message: 'If an account exists with this email, a password reset link has been dispatched.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}?resetToken=${rawToken}&resetEmail=${encodeURIComponent(user.email)}`;

    this.logger.log(`[Password Reset Dispatched] User: ${user.email}`);

    // Dispatch via Resend
    await this.emailService.sendPasswordResetEmail(user.email, resetLink, user.name);

    return {
      message: 'Password reset link sent to your email.',
      resetLink: process.env.NODE_ENV !== 'production' ? resetLink : undefined,
    };
  }

  async resetPassword(token: string, email: string, newPassword: string): Promise<{ message: string }> {
    const complexity = validatePasswordComplexity(newPassword);
    if (!complexity.isValid) {
      throw new BadRequestException(complexity.message);
    }

    const cleanEmail = email.toLowerCase().trim();
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    const user = await this.userModel.findOne({
      email: cleanEmail,
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Password reset link is invalid or has expired. Please request a new one.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = passwordHash;
    user.resetPasswordTokenHash = null;
    user.resetPasswordExpires = null;
    user.refreshTokenHash = null;
    await user.save();

    this.logger.log(`[Password Reset Successful] User: ${user.email}`);

    return { message: 'Password has been successfully updated. You can now sign in with your new password.' };
  }

  async updateProfile(userId: string, data: { name?: string; avatar?: string; phone?: string; city?: string }): Promise<UserDocument> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found.');

    if (data.name) user.name = data.name;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    await user.save();
    return user;
  }

  async validateUserById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: AuthUserPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    const user = await this.userModel.findById(payload.sub);
    if (!user || !user.isActive || !user.refreshTokenHash) throw new UnauthorizedException('Session expired.');

    const isValid = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!isValid) throw new UnauthorizedException('Session expired. Please log in again.');

    return this.issueTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }

  private async issueTokens(user: UserDocument): Promise<AuthTokens> {
    const payload: AuthUserPayload = {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      avatar: user.avatar || '',
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_EXPIRES_IN') || '15m') as any,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d') as any,
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userModel.findByIdAndUpdate(user._id, { refreshTokenHash });

    return { accessToken, refreshToken };
  }
}
