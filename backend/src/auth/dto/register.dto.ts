import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn, MinLength } from 'class-validator';
import type { UserRole } from '../../schemas/user.schema';

export const ALLOWED_REGISTRATION_ROLES: UserRole[] = [
  'customer',
  'clinic_admin',
  'store_merchant',
  'shelter_org',
  'pet_sitter',
  'groomer',
];

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsIn(ALLOWED_REGISTRATION_ROLES, {
    message: 'Invalid role specified. Privileged roles cannot be self-assigned.',
  })
  role?: UserRole;

  @IsOptional()
  @IsString()
  organizationName?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsIn(['stationary_clinic', 'mobile_vet', 'none'])
  practiceType?: 'stationary_clinic' | 'mobile_vet' | 'none';

  @IsOptional()
  @IsString()
  phone?: string;
}
