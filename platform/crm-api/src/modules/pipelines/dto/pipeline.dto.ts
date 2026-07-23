import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePipelineDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ default: 'crm' })
  @IsOptional()
  @IsString()
  moduleKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessUnit?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  visibility?: string;

  @ApiPropertyOptional({ description: 'Apply system/workspace template id' })
  @IsOptional()
  @IsString()
  templateId?: string;
}

export class UpdatePipelineDto extends PartialType(CreatePipelineDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}

export class CreateStageDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stageType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isWon?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSuccess?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isLost?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  probability?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  winProbability?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  slaHours?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  estimatedDuration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  revenuePercent?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class UpdateStageDto extends PartialType(CreateStageDto) {}

export class ReorderStagesDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  stageIds!: string[];
}

export class StageFieldDto {
  @ApiProperty()
  @IsString()
  fieldKey!: string;

  @ApiProperty()
  @IsString()
  label!: string;

  @ApiPropertyOptional({ default: 'text' })
  @IsOptional()
  @IsString()
  fieldType?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  options?: unknown;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  validation?: Record<string, unknown>;
}

export class StageDocumentDto {
  @ApiProperty()
  @IsString()
  docKey!: string;

  @ApiProperty()
  @IsString()
  label!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  acceptedMime?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class StageChecklistDto {
  @ApiProperty()
  @IsString()
  label!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class TransitionRuleDto {
  @ApiProperty()
  @IsString()
  fromStageId!: string;

  @ApiProperty()
  @IsString()
  toStageId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  blockUnlessValid?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class StagePermissionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canView?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canEdit?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canDelete?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canMoveFwd?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canMoveBack?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canApprove?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canReject?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  canSkip?: boolean;
}

export class StageAutomationDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ description: 'enter | exit | approve | reject | field_change | schedule' })
  @IsString()
  trigger!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  condition?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  action?: Record<string, unknown>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sortOrder?: number;
}

export class ValidateTransitionDto {
  @ApiProperty()
  @IsString()
  fromStageId!: string;

  @ApiProperty()
  @IsString()
  toStageId!: string;

  @ApiPropertyOptional({ description: 'PipelineRecord id when validating a card' })
  @IsOptional()
  @IsString()
  recordId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actorRole?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  fieldValues?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  documents?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  checklist?: Record<string, boolean>;
}

export class ClonePipelineDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export class PublishPipelineDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({ description: 'Company email for Mongo bridge tenant match' })
  @IsOptional()
  @IsString()
  legacyCompanyEmail?: string;
}

export class SaveTemplateDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class ImportPipelineDto {
  @ApiProperty()
  @IsObject()
  snapshot!: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export class ApplyTemplateDto {
  @ApiProperty()
  @IsString()
  templateId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
