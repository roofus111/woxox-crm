import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SuperAdminGuard } from '../../common/guards/super-admin.guard';
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator';
import { SuperAdminService } from './super-admin.service';
import {
  AuditQueryDto,
  BulkTenantsDto,
  ChangeOwnerDto,
  CreateTenantDto,
  ExtendTrialDto,
  ListTenantsQueryDto,
  ResetTenantPasswordDto,
  StopImpersonationDto,
  UpdateTenantDto,
} from './dto/super-admin.dto';

@ApiTags('super-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('super-admin')
export class SuperAdminController {
  constructor(private readonly superAdmin: SuperAdminService) {}

  private auditCtx(user: JwtPayload, req: Request) {
    return {
      actor: user,
      ipAddress: (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip,
      userAgent: req.headers['user-agent'],
    };
  }

  @Get('stats')
  getStats() {
    return this.superAdmin.getStats();
  }

  @Get('tenants')
  listTenants(@Query() query: ListTenantsQueryDto) {
    return this.superAdmin.listTenants(query);
  }

  @Get('tenants/:id')
  getTenant(@Param('id') id: string) {
    return this.superAdmin.getTenant(id);
  }

  @Post('tenants')
  createTenant(
    @Body() dto: CreateTenantDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.superAdmin.createTenant(dto, this.auditCtx(user, req));
  }

  @Post('tenants/bulk')
  bulk(
    @Body() dto: BulkTenantsDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.superAdmin.bulkUpdate(dto, this.auditCtx(user, req));
  }

  @Patch('tenants/:id')
  updateTenant(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.superAdmin.updateTenant(id, dto, this.auditCtx(user, req));
  }

  @Post('tenants/:id/extend-trial')
  extendTrial(
    @Param('id') id: string,
    @Body() dto: ExtendTrialDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.superAdmin.extendTrial(id, dto, this.auditCtx(user, req));
  }

  @Post('tenants/:id/change-owner')
  changeOwner(
    @Param('id') id: string,
    @Body() dto: ChangeOwnerDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.superAdmin.changeOwner(id, dto, this.auditCtx(user, req));
  }

  @Post('tenants/:id/soft-delete')
  softDelete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.superAdmin.softDelete(id, this.auditCtx(user, req));
  }

  @Post('tenants/:id/restore')
  restore(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.superAdmin.restore(id, this.auditCtx(user, req));
  }

  @Post('tenants/:id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetTenantPasswordDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.superAdmin.resetAdminPassword(id, dto, this.auditCtx(user, req));
  }

  @Get('tenants/:id/audit')
  listAudit(@Param('id') id: string, @Query() query: AuditQueryDto) {
    return this.superAdmin.listAudit(id, query.page ?? 1, query.pageSize ?? 50);
  }

  @Post('tenants/:id/impersonate')
  impersonate(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.superAdmin.impersonate(id, this.auditCtx(user, req));
  }

  @Post('impersonation/stop')
  stopImpersonation(
    @Body() dto: StopImpersonationDto,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.superAdmin.stopImpersonation(dto.sessionId, this.auditCtx(user, req));
  }
}
