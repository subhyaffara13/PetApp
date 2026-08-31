jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn().mockImplementation(() => ({
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn().mockReturnValue({ sub: 'user-123', email: 'test@example.com' }),
  })),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, validatePasswordComplexity } from './auth.service';
import { User } from '../schemas/user.schema';
import { AdminClaim } from '../admin/admin.schema';
import { EmailService } from '../email/email.service';

describe('AuthService & Password Security', () => {
  let service: AuthService;

  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockClaimModel = {
    create: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') return 'access-secret-123';
      if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret-123';
      return null;
    }),
  };

  const mockEmailService = {
    sendPasswordResetEmail: jest.fn().mockResolvedValue({ success: true, message: 'Sent' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(AdminClaim.name), useValue: mockClaimModel },
        { provide: JwtService, useClass: JwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('Password Complexity Validator', () => {
    it('should reject passwords shorter than 8 characters', () => {
      const result = validatePasswordComplexity('Pass1!');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('at least 8 characters');
    });

    it('should reject passwords without letters', () => {
      const result = validatePasswordComplexity('12345678!');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('at least 1 letter');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePasswordComplexity('Password!');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('at least 1 number');
    });

    it('should reject passwords without special characters', () => {
      const result = validatePasswordComplexity('Password123');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('at least 1 special character');
    });

    it('should accept valid complex passwords', () => {
      const result = validatePasswordComplexity('PetSOS2026!Secure');
      expect(result.isValid).toBe(true);
    });
  });

  describe('Forgot & Reset Password', () => {
    it('should return safe message when email is not found', async () => {
      mockUserModel.findOne.mockResolvedValueOnce(null);
      const res = await service.forgotPassword('unknown@example.com');
      expect(res.message).toContain('If an account exists');
    });

    it('should generate reset link when user exists', async () => {
      const mockUser = {
        email: 'subhy@example.com',
        resetPasswordTokenHash: null,
        resetPasswordExpires: null,
        save: jest.fn().mockResolvedValue(true),
      };
      mockUserModel.findOne.mockResolvedValueOnce(mockUser);

      const res = await service.forgotPassword('subhy@example.com');
      expect(res.message).toContain('Password reset link sent');
      expect(res.resetLink).toBeDefined();
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});
