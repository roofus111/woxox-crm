import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpsertPlanDto {
  @ApiProperty({ example: 'professional' })
  @IsString()
  @MinLength(2)
  code!: string;

  @ApiProperty({ example: 'Professional' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ example: 499900, description: 'Monthly amount in paise/cents' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountMonthly!: number;

  @ApiProperty({ example: 4999000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  amountYearly!: number;

  @ApiPropertyOptional({ example: ['crm', 'finance'] })
  @IsOptional()
  @IsArray()
  enabledModules?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxUsers?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxStorageGb?: number;

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  trialDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripePriceMonthly?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripePriceYearly?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class AssignSubscriptionDto {
  @ApiProperty()
  @IsString()
  workspaceId!: string;

  @ApiProperty({ description: 'Plan code or id' })
  @IsString()
  plan!: string;

  @ApiPropertyOptional({ enum: ['monthly', 'yearly'] })
  @IsOptional()
  @IsIn(['monthly', 'yearly'])
  billingCycle?: 'monthly' | 'yearly';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiPropertyOptional({ description: 'Start as trialing instead of active' })
  @IsOptional()
  @IsBoolean()
  startTrial?: boolean;
}

export class UpsertCouponDto {
  @ApiProperty({ example: 'LAUNCH50' })
  @IsString()
  @MinLength(2)
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  percentOff?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  amountOff?: number;

  @ApiPropertyOptional({ example: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxRedemptions?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  redeemBy?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  durationMonths?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListSubscriptionsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
