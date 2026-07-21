import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { SuperAdminService } from './super-admin.service';
import {
  CreateTenantDto,
  ResetTenantPasswordDto,
  UpdateTenantDto,
} from './dto/super-admin.dto';

@ApiTags('super-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdmin: SuperAdminService) {}

  @Get('tenants')
  listTenants() {
    return this.superAdmin.listTenants();
  }

  @Post('tenants')
  createTenant(@Body() dto: CreateTenantDto) {
    return this.superAdmin.createTenant(dto);
  }

  @Patch('tenants/:id')
  updateTenant(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.superAdmin.updateTenant(id, dto);
  }

  @Post('tenants/:id/reset-password')
  resetPassword(@Param('id') id: string, @Body() dto: ResetTenantPasswordDto) {
    return this.superAdmin.resetAdminPassword(id, dto);
  }
}
