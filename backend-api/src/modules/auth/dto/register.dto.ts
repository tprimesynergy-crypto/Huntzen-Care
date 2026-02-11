import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(['EMPLOYEE', 'PRACTITIONER', 'ADMIN_RH', 'ADMIN_HUNTZEN', 'SUPER_ADMIN'])
  role?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  /** When registering via invitation link */
  @IsOptional()
  @IsString()
  invitationToken?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}
