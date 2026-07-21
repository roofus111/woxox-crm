import { IsArray, IsEmail, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'ABC Industries' })
  @IsString()
  @MinLength(2)
  companyName!: string;

  @ApiProperty({ example: 'admin@abcindustries.com' })
  @IsEmail()
  adminEmail!: string;

  @ApiProperty({ example: 'TempPass123!' })
  @IsString()
  @MinLength(6)
  adminPassword!: string;

  @ApiPropertyOptional({ example: 'Rahul Sharma' })
  @IsOptional()
  @IsString()
  adminName?: string;

  @ApiPropertyOptional({ example: 'professional' })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiPropertyOptional({ example: ['crm', 'finance', 'hrms'] })
  @IsOptional()
  @IsArray()
  enabledModules?: string[];

  @ApiPropertyOptional({ example: 14, description: 'Trial days from now' })
  @IsOptional()
  @IsInt()
  @Min(0)
  trialDays?: number;
}

export class UpdateTenantDto {
  @ApiPropertyOptional({ example: 'active', enum: ['active', 'suspended'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'enterprise' })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiPropertyOptional({ example: ['crm', 'legalos'] })
  @IsOptional()
  @IsArray()
  enabledModules?: string[];
}

export class ResetTenantPasswordDto {
  @ApiProperty({ example: 'NewTempPass123!' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}
