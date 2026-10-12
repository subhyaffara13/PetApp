import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';
import type { UserRole } from '../../schemas/user.schema';
import { ALLOWED_REGISTRATION_ROLES } from './register.dto';

export class OAuthLoginDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsIn(ALLOWED_REGISTRATION_ROLES, {
    message: 'Invalid role specified. Privileged roles cannot be self-assigned.',
  })
  role?: UserRole;
}
