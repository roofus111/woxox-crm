import { IsEmail, IsOptional, IsString, MinLength, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@woxox.local' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(5)
  password!: string;
}

export class RegisterWorkspaceDto {
  @ApiProperty()
  @IsString()
  workspaceName!: string;

  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  password!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;
}

export class MfaVerifyDto {
  @ApiProperty()
  @IsString()
  mfaToken!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code!: string;
}

export class MfaCodeDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 6)
  code!: string;
}

export class OnboardingUpdateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teamSize?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  inviteEmail?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  modules?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  step?: string;
}
