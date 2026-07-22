import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
  @ApiPropertyOptional({ example: 'active', enum: ['active', 'suspended', 'trial'] })
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountManagerNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ownerUserId?: string;
}

export class ResetTenantPasswordDto {
  @ApiProperty({ example: 'NewTempPass123!' })
  @IsString()
  @MinLength(6)
  newPassword!: string;
}

export class ListTenantsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: ['active', 'suspended', 'trial', 'expired', 'deleted'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @ApiPropertyOptional({ example: 'createdAt:desc' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: 'Include soft-deleted tenants' })
  @IsOptional()
  @IsString()
  includeDeleted?: string;
}

export class ExtendTrialDto {
  @ApiProperty({ example: 14 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days!: number;
}

export class ChangeOwnerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}

export class BulkTenantsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  ids!: string[];

  @ApiProperty({ enum: ['suspend', 'activate'] })
  @IsIn(['suspend', 'activate'])
  action!: 'suspend' | 'activate';
}

export class StopImpersonationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class AuditQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
