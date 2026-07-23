import { IsArray, IsBoolean, IsDateString, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsOptional() @IsString() @MaxLength(500) title?: string;
  @IsOptional() @IsString() contentHtml?: string;
  @IsOptional() contentJson?: any;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsBoolean() isPinned?: boolean;
  @IsOptional() @IsBoolean() isFavorite?: boolean;
  @IsOptional() @IsDateString() reminderAt?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tagIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) tagNames?: string[];
  @IsOptional()
  @IsArray()
  links?: { entityType: string; entityId: string; label?: string }[];
}

export class UpdateNoteDto {
  @IsOptional() @IsString() @MaxLength(500) title?: string;
  @IsOptional() @IsString() contentHtml?: string;
  @IsOptional() contentJson?: any;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsBoolean() isPinned?: boolean;
  @IsOptional() @IsBoolean() isFavorite?: boolean;
  @IsOptional() @IsBoolean() isArchived?: boolean;
  @IsOptional() @IsDateString() reminderAt?: string | null;
  @IsOptional() @IsArray() @IsString({ each: true }) tagIds?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) tagNames?: string[];
}

export class ListNotesQueryDto {
  @IsOptional() @IsString() folder?: string; // all | pinned | favorites | archive | trash
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() entityType?: string;
  @IsOptional() @IsString() entityId?: string;
  @IsOptional() @IsString() page?: string;
  @IsOptional() @IsString() limit?: string;
}

export class CreateStickyDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() checklist?: any;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsBoolean() isPinned?: boolean;
  @IsOptional() @IsBoolean() isFavorite?: boolean;
  @IsOptional() @IsDateString() reminderAt?: string;
  @IsOptional() @IsString() recurrence?: string;
  @IsOptional() @IsNumber() x?: number;
  @IsOptional() @IsNumber() y?: number;
}

export class UpdateStickyDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() content?: string;
  @IsOptional() checklist?: any;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsBoolean() isPinned?: boolean;
  @IsOptional() @IsBoolean() isFavorite?: boolean;
  @IsOptional() @IsBoolean() isArchived?: boolean;
  @IsOptional() @IsDateString() reminderAt?: string | null;
  @IsOptional() @IsString() recurrence?: string | null;
}

export class UpsertStickyPositionDto {
  @IsOptional() @IsString() pageKey?: string;
  @IsNumber() x!: number;
  @IsNumber() y!: number;
  @IsOptional() @IsNumber() width?: number;
  @IsOptional() @IsNumber() height?: number;
  @IsOptional() @IsNumber() zIndex?: number;
}

export class AddNoteLinkDto {
  @IsString() entityType!: string;
  @IsString() entityId!: string;
  @IsOptional() @IsString() label?: string;
}

export class AddNoteCommentDto {
  @IsString() body!: string;
  @IsOptional() @IsArray() @IsString({ each: true }) mentions?: string[];
}

export class ShareNoteDto {
  @IsString() userId!: string;
  @IsOptional() @IsString() permission?: string;
}
