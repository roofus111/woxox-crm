import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @IsString()
  name?: string;
}
