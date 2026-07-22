import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.module';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import {
  BulkTenantsDto,
  ChangeOwnerDto,
  CreateTenantDto,
  ExtendTrialDto,
  ListTenantsQueryDto,
  ResetTenantPasswordDto,
  UpdateTenantDto,
} from './dto/super-admin.dto';

const DEFAULT_MODULES = ['crm'];
const IMPERSONATION_TTL_MINUTES = 15;

type AuditContext = {
  actor: JwtPayload;
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class SuperAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async getStats() {
    const now = new Date();
    const workspaces = await this.prisma.workspace.findMany({
      where: { deletedAt: null },
      select: { status: true, trialEndsAt: true, plan: true },
    });

    let active = 0;
    let suspended = 0;
    let trial = 0;
    let expired = 0;

    for (const w of workspaces) {
      if (w.status === 'suspended') {
        suspended += 1;
        continue;
      }
      const isTrialPlan = w.plan === 'trial' || Boolean(w.trialEndsAt);
      const isExpired = Boolean(w.trialEndsAt && w.trialEndsAt < now && w.plan === 'trial');
      if (isExpired) {
        expired += 1;
      } else if (isTrialPlan && w.trialEndsAt && w.trialEndsAt >= now) {
        trial += 1;
      } else {
        active += 1;
      }
    }

    return {
      success: true,
      stats: {
        total: workspaces.length,
        active,
        trial,
        expired,
        suspended,
      },
    };
  }

  async listTenants(query: ListTenantsQueryDto) {
    const page = query.page ?? 1;
    const pageSize = Math.min(query.pageSize ?? 25, 100);
    const includeDeleted = query.includeDeleted === 'true' || query.status === 'deleted';
    const now = new Date();
    const and: Prisma.WorkspaceWhereInput[] = [];

    if (query.status === 'deleted') {
      and.push({ deletedAt: { not: null } });
    } else if (!includeDeleted) {
      and.push({ deletedAt: null });
    }

    if (query.q?.trim()) {
      const q = query.q.trim();
      and.push({
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { slug: { contains: q, mode: 'insensitive' } },
          { tenantCode: { contains: q, mode: 'insensitive' } },
          {
            users: {
              some: {
                user: { email: { contains: q, mode: 'insensitive' } },
              },
            },
          },
        ],
      });
    }

    if (query.plan) and.push({ plan: query.plan });
    if (query.module) and.push({ enabledModules: { has: query.module } });

    if (query.status && query.status !== 'deleted') {
      if (query.status === 'suspended') {
        and.push({ status: 'suspended' });
      } else if (query.status === 'trial') {
        and.push({ status: { not: 'suspended' } });
        and.push({ plan: 'trial' });
        and.push({ trialEndsAt: { gte: now } });
      } else if (query.status === 'expired') {
        and.push({ status: { not: 'suspended' } });
        and.push({ plan: 'trial' });
        and.push({ trialEndsAt: { lt: now } });
      } else if (query.status === 'active') {
        and.push({ status: { not: 'suspended' } });
        and.push({ plan: { not: 'trial' } });
      } else {
        and.push({ status: query.status });
      }
    }

    const where: Prisma.WorkspaceWhereInput = and.length ? { AND: and } : {};
    const [sortField, sortDir] = (query.sort || 'createdAt:desc').split(':');
    const orderBy: Prisma.WorkspaceOrderByWithRelationInput = {
      [sortField === 'name' ? 'name' : 'createdAt']: sortDir === 'asc' ? 'asc' : 'desc',
    };

    const [total, workspaces] = await this.prisma.$transaction([
      this.prisma.workspace.count({ where }),
      this.prisma.workspace.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          users: {
            where: { role: { in: [Role.ADMIN, Role.SUPER_ADMIN] }, isActive: true },
            take: 5,
            include: {
              user: { select: { id: true, email: true, name: true, lastLoginAt: true } },
            },
          },
          _count: {
            select: {
              users: true,
              leads: true,
              contacts: true,
              deals: true,
            },
          },
        },
      }),
    ]);

    const tenants = workspaces.map((w) => this.mapTenantSummary(w, now));
    const stats = await this.getStats();

    return {
      success: true,
      total,
      page,
      pageSize,
      tenants,
      stats: stats.stats,
    };
  }

  async getTenant(id: string) {
    const now = new Date();
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        users: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                lastLoginAt: true,
                createdAt: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            users: true,
            leads: true,
            contacts: true,
            deals: true,
            activities: true,
            tasks: true,
          },
        },
      },
    });
    if (!workspace) throw new NotFoundException('Tenant not found');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentActivity = await this.prisma.activity.count({
      where: { workspaceId: id, createdAt: { gte: thirtyDaysAgo } },
    });

    const owner =
      workspace.users.find((m) => m.userId === workspace.ownerUserId)?.user ||
      workspace.users.find((m) => m.role === Role.ADMIN)?.user ||
      null;

    const audits = await this.prisma.platformAuditLog.findMany({
      where: { workspaceId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const summary = this.mapTenantSummary(workspace, now);
    const health = this.computeHealth({
      status: summary.displayStatus,
      trialEndsAt: workspace.trialEndsAt,
      userCount: workspace._count.users,
      lastLoginAt: owner?.lastLoginAt ?? null,
      recentActivity,
    });

    return {
      success: true,
      tenant: {
        ...summary,
        accountManagerNote: workspace.accountManagerNote,
        ownerUserId: workspace.ownerUserId,
        owner,
        members: workspace.users.map((m) => ({
          membershipId: m.id,
          role: m.role,
          isActive: m.isActive,
          user: m.user,
        })),
        counts: {
          ...workspace._count,
          recentActivity,
        },
        health,
        loginUrl: process.env.APP_ORIGIN
          ? `${process.env.APP_ORIGIN}/en/login`
          : 'https://app.woxox.com/en/login',
        recentAudits: audits,
      },
    };
  }

  async createTenant(dto: CreateTenantDto, audit: AuditContext) {
    const email = dto.adminEmail.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Admin email already registered');
    }

    const baseSlug =
      dto.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40) || 'company';

    const tenantCount = await this.prisma.workspace.count();
    const tenantCode = `WOX-${String(tenantCount + 1).padStart(6, '0')}`;
    const slug = `${baseSlug}-${Date.now().toString(36)}`;
    const passwordHash = await bcrypt.hash(dto.adminPassword, 12);
    const modules = dto.enabledModules?.length ? dto.enabledModules : DEFAULT_MODULES;
    const trialDays = dto.trialDays ?? 14;
    const trialEndsAt =
      trialDays > 0 ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) : null;
    const plan = dto.plan ?? 'trial';

    const result = await this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: dto.companyName.trim(),
          slug,
          tenantCode,
          plan,
          status: plan === 'trial' ? 'trial' : 'active',
          trialEndsAt,
          enabledModules: modules,
          settings: {
            onboardingComplete: false,
            provisionedBy: 'super-admin',
          },
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: dto.adminName?.trim() || 'Company Admin',
          emailVerified: new Date(),
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: Role.ADMIN,
        },
      });

      await tx.workspace.update({
        where: { id: workspace.id },
        data: { ownerUserId: user.id },
      });

      await tx.pipeline.create({
        data: {
          workspaceId: workspace.id,
          name: 'Sales Pipeline',
          isDefault: true,
          stages: {
            create: [
              { name: 'Qualification', probability: 10, sortOrder: 0 },
              { name: 'Proposal', probability: 40, sortOrder: 1 },
              { name: 'Negotiation', probability: 70, sortOrder: 2 },
              { name: 'Won', probability: 100, sortOrder: 3, isWon: true },
              { name: 'Lost', probability: 0, sortOrder: 4, isLost: true },
            ],
          },
        },
      });

      return { workspace: { ...workspace, ownerUserId: user.id }, user };
    });

    const legacy = await this.provisionLegacyTenant({
      companyName: dto.companyName.trim(),
      adminEmail: email,
      adminPassword: dto.adminPassword,
      adminName: dto.adminName?.trim() || 'Company Admin',
      enabledModules: modules,
    });

    await this.writeAudit(audit, {
      action: 'tenant.create',
      entityType: 'workspace',
      entityId: result.workspace.id,
      workspaceId: result.workspace.id,
      metadata: {
        tenantCode: result.workspace.tenantCode,
        adminEmail: email,
        plan,
        modules,
        legacyProvisioned: legacy.ok,
      },
    });

    return {
      success: true,
      tenant: {
        id: result.workspace.id,
        tenantCode: result.workspace.tenantCode,
        name: result.workspace.name,
        slug: result.workspace.slug,
        plan: result.workspace.plan,
        status: result.workspace.status,
        trialEndsAt: result.workspace.trialEndsAt,
        enabledModules: result.workspace.enabledModules,
        admin: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        loginUrl: process.env.APP_ORIGIN
          ? `${process.env.APP_ORIGIN}/en/login`
          : 'https://app.woxox.com/en/login',
        legacyProvisioned: legacy.ok,
        legacyMessage: legacy.message,
      },
    };
  }

  async updateTenant(id: string, dto: UpdateTenantDto, audit: AuditContext) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) throw new NotFoundException('Tenant not found');
    if (workspace.deletedAt && dto.status !== 'active') {
      throw new BadRequestException('Tenant is soft-deleted; restore first');
    }

    const updated = await this.prisma.workspace.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.plan ? { plan: dto.plan } : {}),
        ...(dto.enabledModules ? { enabledModules: dto.enabledModules } : {}),
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.accountManagerNote !== undefined
          ? { accountManagerNote: dto.accountManagerNote }
          : {}),
        ...(dto.ownerUserId ? { ownerUserId: dto.ownerUserId } : {}),
      },
    });

    await this.writeAudit(audit, {
      action: 'tenant.update',
      entityType: 'workspace',
      entityId: id,
      workspaceId: id,
      metadata: { ...dto },
    });

    return { success: true, tenant: updated };
  }

  async extendTrial(id: string, dto: ExtendTrialDto, audit: AuditContext) {
    const workspace = await this.requireActiveWorkspace(id);
    const base =
      workspace.trialEndsAt && workspace.trialEndsAt > new Date()
        ? workspace.trialEndsAt
        : new Date();
    const trialEndsAt = new Date(base.getTime() + dto.days * 24 * 60 * 60 * 1000);

    const updated = await this.prisma.workspace.update({
      where: { id },
      data: {
        trialEndsAt,
        plan: workspace.plan === 'trial' ? 'trial' : workspace.plan,
        status: workspace.status === 'suspended' ? workspace.status : 'trial',
      },
    });

    await this.writeAudit(audit, {
      action: 'tenant.extend_trial',
      entityType: 'workspace',
      entityId: id,
      workspaceId: id,
      metadata: { days: dto.days, trialEndsAt },
    });

    return { success: true, tenant: updated };
  }

  async changeOwner(id: string, dto: ChangeOwnerDto, audit: AuditContext) {
    await this.requireActiveWorkspace(id);

    let userId = dto.userId;
    if (!userId && dto.email) {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });
      if (!user) throw new NotFoundException('User not found');
      userId = user.id;
    }
    if (!userId) throw new BadRequestException('userId or email required');

    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId } },
      include: { user: true },
    });
    if (!membership || !membership.isActive) {
      throw new NotFoundException('User is not an active member of this tenant');
    }

    await this.prisma.$transaction(async (tx) => {
      if (membership.role !== Role.ADMIN && membership.role !== Role.SUPER_ADMIN) {
        await tx.workspaceMember.update({
          where: { id: membership.id },
          data: { role: Role.ADMIN },
        });
      }
      await tx.workspace.update({
        where: { id },
        data: { ownerUserId: userId },
      });
    });

    await this.writeAudit(audit, {
      action: 'tenant.change_owner',
      entityType: 'workspace',
      entityId: id,
      workspaceId: id,
      metadata: { ownerUserId: userId, email: membership.user.email },
    });

    return { success: true, ownerUserId: userId, email: membership.user.email };
  }

  async softDelete(id: string, audit: AuditContext) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) throw new NotFoundException('Tenant not found');
    if (workspace.deletedAt) throw new BadRequestException('Already soft-deleted');

    const updated = await this.prisma.workspace.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'suspended' },
    });

    await this.writeAudit(audit, {
      action: 'tenant.soft_delete',
      entityType: 'workspace',
      entityId: id,
      workspaceId: id,
      metadata: {},
    });

    return { success: true, tenant: updated };
  }

  async restore(id: string, audit: AuditContext) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) throw new NotFoundException('Tenant not found');
    if (!workspace.deletedAt) throw new BadRequestException('Tenant is not deleted');

    const updated = await this.prisma.workspace.update({
      where: { id },
      data: { deletedAt: null, status: 'active' },
    });

    await this.writeAudit(audit, {
      action: 'tenant.restore',
      entityType: 'workspace',
      entityId: id,
      workspaceId: id,
      metadata: {},
    });

    return { success: true, tenant: updated };
  }

  async bulkUpdate(dto: BulkTenantsDto, audit: AuditContext) {
    if (!dto.ids?.length) throw new BadRequestException('ids required');
    const status = dto.action === 'suspend' ? 'suspended' : 'active';

    const result = await this.prisma.workspace.updateMany({
      where: { id: { in: dto.ids }, deletedAt: null },
      data: { status },
    });

    await this.writeAudit(audit, {
      action: `tenant.bulk_${dto.action}`,
      entityType: 'workspace',
      entityId: null,
      workspaceId: null,
      metadata: { ids: dto.ids, count: result.count },
    });

    return { success: true, updated: result.count };
  }

  async resetAdminPassword(id: string, dto: ResetTenantPasswordDto, audit: AuditContext) {
    await this.requireActiveWorkspace(id);

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { workspaceId: id, role: Role.ADMIN, isActive: true },
      include: { user: true },
    });
    if (!membership) throw new NotFoundException('Tenant admin not found');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: membership.userId },
      data: { passwordHash },
    });

    await this.writeAudit(audit, {
      action: 'tenant.reset_password',
      entityType: 'user',
      entityId: membership.userId,
      workspaceId: id,
      metadata: { email: membership.user.email },
    });

    return {
      success: true,
      email: membership.user.email,
      message: 'Password updated',
    };
  }

  async listAudit(id: string, page = 1, pageSize = 50) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) throw new NotFoundException('Tenant not found');

    const take = Math.min(pageSize, 100);
    const where = { workspaceId: id };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.platformAuditLog.count({ where }),
      this.prisma.platformAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
      }),
    ]);

    return { success: true, total, page, pageSize: take, items };
  }

  async impersonate(id: string, audit: AuditContext) {
    const workspace = await this.requireActiveWorkspace(id);
    if (workspace.status === 'suspended') {
      throw new ForbiddenException('Cannot impersonate a suspended tenant');
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        isActive: true,
        role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
        ...(workspace.ownerUserId ? { userId: workspace.ownerUserId } : {}),
      },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });

    const target =
      membership ||
      (await this.prisma.workspaceMember.findFirst({
        where: { workspaceId: id, role: Role.ADMIN, isActive: true },
        include: { user: true },
      }));

    if (!target) throw new NotFoundException('No admin user to impersonate');

    const expiresAt = new Date(Date.now() + IMPERSONATION_TTL_MINUTES * 60 * 1000);
    const session = await this.prisma.impersonationSession.create({
      data: {
        actorUserId: audit.actor.sub,
        targetUserId: target.userId,
        workspaceId: id,
        expiresAt,
        ipAddress: audit.ipAddress,
      },
    });

    const accessToken = this.jwt.sign(
      {
        sub: target.userId,
        email: target.user.email,
        workspaceId: id,
        role: Role.ADMIN,
        impersonatorId: audit.actor.sub,
        impersonationSessionId: session.id,
      },
      { expiresIn: `${IMPERSONATION_TTL_MINUTES}m` },
    );

    await this.writeAudit(audit, {
      action: 'tenant.impersonate',
      entityType: 'workspace',
      entityId: id,
      workspaceId: id,
      metadata: {
        sessionId: session.id,
        targetUserId: target.userId,
        targetEmail: target.user.email,
        expiresAt,
      },
    });

    return {
      success: true,
      accessToken,
      expiresAt,
      sessionId: session.id,
      tenant: {
        id: workspace.id,
        name: workspace.name,
        tenantCode: workspace.tenantCode,
      },
      targetUser: {
        id: target.user.id,
        email: target.user.email,
        name: target.user.name,
      },
      impersonatorId: audit.actor.sub,
    };
  }

  async stopImpersonation(sessionId: string | undefined, audit: AuditContext) {
    let id = sessionId;
    if (!id) {
      const latest = await this.prisma.impersonationSession.findFirst({
        where: {
          actorUserId: audit.actor.sub,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });
      id = latest?.id;
    }
    if (!id) throw new NotFoundException('No active impersonation session');

    const session = await this.prisma.impersonationSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.actorUserId !== audit.actor.sub && audit.actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Not your session');
    }

    await this.prisma.impersonationSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    await this.writeAudit(audit, {
      action: 'tenant.impersonation_stop',
      entityType: 'impersonation_session',
      entityId: id,
      workspaceId: session.workspaceId,
      metadata: {},
    });

    return { success: true, sessionId: id };
  }

  /**
   * Mint a one-time URL that logs Super Admin into the legacy Mongo CRM as company admin.
   */
  async openLegacyCrm(id: string, audit: AuditContext) {
    const workspace = await this.requireActiveWorkspace(id);
    if (workspace.status === 'suspended') {
      throw new ForbiddenException('Cannot open a suspended tenant in CRM');
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId: id,
        isActive: true,
        role: { in: [Role.ADMIN, Role.SUPER_ADMIN] },
        ...(workspace.ownerUserId ? { userId: workspace.ownerUserId } : {}),
      },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });

    const target =
      membership ||
      (await this.prisma.workspaceMember.findFirst({
        where: { workspaceId: id, role: Role.ADMIN, isActive: true },
        include: { user: true },
      }));

    if (!target) throw new NotFoundException('No admin user for this tenant');

    const base = process.env.LEGACY_API_URL || process.env.BACKEND_API_URL;
    const secret = process.env.SUPER_ADMIN_PROVISION_SECRET;
    if (!base || !secret) {
      throw new BadRequestException(
        'LEGACY_API_URL / SUPER_ADMIN_PROVISION_SECRET not configured',
      );
    }

    const res = await fetch(`${base.replace(/\/$/, '')}/api/super-admin/impersonate-handoff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-super-admin-secret': secret,
      },
      body: JSON.stringify({
        adminEmail: target.user.email,
        actorEmail: audit.actor.email,
        reason: 'super-admin-legacy-open',
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      message?: string;
      handoffToken?: string;
      expiresAt?: string;
      email?: string;
    };

    if (!res.ok || !data.handoffToken) {
      throw new BadRequestException(
        data.message || `Legacy handoff failed (${res.status})`,
      );
    }

    const appOrigin = process.env.APP_ORIGIN || 'https://app.woxox.com';
    const url = `${appOrigin.replace(/\/$/, '')}/en/impersonate?token=${encodeURIComponent(data.handoffToken)}`;

    await this.writeAudit(audit, {
      action: 'tenant.legacy_open',
      entityType: 'workspace',
      entityId: id,
      workspaceId: id,
      metadata: {
        targetEmail: target.user.email,
        expiresAt: data.expiresAt,
      },
    });

    return {
      success: true,
      url,
      expiresAt: data.expiresAt,
      targetEmail: target.user.email,
      tenant: {
        id: workspace.id,
        name: workspace.name,
        tenantCode: workspace.tenantCode,
      },
    };
  }

  private async requireActiveWorkspace(id: string) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) throw new NotFoundException('Tenant not found');
    if (workspace.deletedAt) throw new BadRequestException('Tenant is soft-deleted');
    return workspace;
  }

  private mapTenantSummary(
    w: {
      id: string;
      tenantCode: string | null;
      name: string;
      slug: string;
      plan: string;
      status: string;
      trialEndsAt: Date | null;
      enabledModules: string[];
      createdAt: Date;
      deletedAt?: Date | null;
      ownerUserId?: string | null;
      users?: Array<{
        user: { id: string; email: string; name: string | null; lastLoginAt: Date | null };
      }>;
      _count?: { users: number; leads: number; contacts: number; deals: number };
    },
    now: Date,
  ) {
    const displayStatus = this.resolveDisplayStatus(w.status, w.plan, w.trialEndsAt, w.deletedAt, now);
    const lastLoginAt =
      w.users?.reduce<Date | null>((latest, m) => {
        if (!m.user.lastLoginAt) return latest;
        if (!latest || m.user.lastLoginAt > latest) return m.user.lastLoginAt;
        return latest;
      }, null) ?? null;

    const health = this.computeHealth({
      status: displayStatus,
      trialEndsAt: w.trialEndsAt,
      userCount: w._count?.users ?? 0,
      lastLoginAt,
      recentActivity: w._count?.leads ?? 0,
    });

    return {
      id: w.id,
      tenantCode: w.tenantCode,
      name: w.name,
      slug: w.slug,
      plan: w.plan,
      status: w.status,
      displayStatus,
      trialEndsAt: w.trialEndsAt,
      enabledModules: w.enabledModules,
      createdAt: w.createdAt,
      deletedAt: w.deletedAt ?? null,
      ownerUserId: w.ownerUserId ?? null,
      admins: (w.users || []).map((m) => m.user),
      counts: w._count,
      lastLoginAt,
      health,
    };
  }

  private resolveDisplayStatus(
    status: string,
    plan: string,
    trialEndsAt: Date | null | undefined,
    deletedAt: Date | null | undefined,
    now: Date,
  ) {
    if (deletedAt) return 'deleted';
    if (status === 'suspended') return 'suspended';
    if (plan === 'trial' && trialEndsAt && trialEndsAt < now) return 'expired';
    if (plan === 'trial' || status === 'trial') return 'trial';
    return 'active';
  }

  private computeHealth(input: {
    status: string;
    trialEndsAt: Date | null | undefined;
    userCount: number;
    lastLoginAt: Date | null;
    recentActivity: number;
  }) {
    if (input.status === 'suspended' || input.status === 'deleted') {
      return { score: 0, label: 'suspended' as const };
    }
    if (input.status === 'expired') {
      return { score: 15, label: 'critical' as const };
    }

    let score = 55;
    if (input.userCount >= 3) score += 15;
    else if (input.userCount >= 1) score += 8;

    if (input.lastLoginAt) {
      const days =
        (Date.now() - input.lastLoginAt.getTime()) / (24 * 60 * 60 * 1000);
      if (days <= 3) score += 20;
      else if (days <= 14) score += 10;
      else if (days <= 30) score += 4;
      else score -= 10;
    } else {
      score -= 15;
    }

    if (input.recentActivity > 10) score += 10;
    else if (input.recentActivity > 0) score += 5;

    if (input.trialEndsAt) {
      const daysLeft =
        (input.trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
      if (daysLeft < 3) score -= 15;
      else if (daysLeft < 7) score -= 8;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    const label =
      score >= 70 ? ('healthy' as const) : score >= 40 ? ('at_risk' as const) : ('critical' as const);
    return { score, label };
  }

  private async writeAudit(
    audit: AuditContext,
    data: {
      action: string;
      entityType: string;
      entityId: string | null;
      workspaceId: string | null;
      metadata: Record<string, unknown>;
    },
  ) {
    await this.prisma.platformAuditLog.create({
      data: {
        actorUserId: audit.actor.sub,
        actorEmail: audit.actor.email,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId ?? undefined,
        workspaceId: data.workspaceId ?? undefined,
        ipAddress: audit.ipAddress,
        userAgent: audit.userAgent,
        metadata: data.metadata as Prisma.InputJsonValue,
      },
    });
  }

  private async provisionLegacyTenant(input: {
    companyName: string;
    adminEmail: string;
    adminPassword: string;
    adminName: string;
    enabledModules: string[];
  }): Promise<{ ok: boolean; message: string }> {
    const base = process.env.LEGACY_API_URL || process.env.BACKEND_API_URL;
    const secret = process.env.SUPER_ADMIN_PROVISION_SECRET;
    if (!base || !secret) {
      return {
        ok: false,
        message: 'Legacy provision skipped (LEGACY_API_URL / SUPER_ADMIN_PROVISION_SECRET not set)',
      };
    }

    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/super-admin/provision-tenant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-super-admin-secret': secret,
        },
        body: JSON.stringify(input),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        return { ok: false, message: data.message || `Legacy provision failed (${res.status})` };
      }
      return { ok: true, message: data.message || 'Legacy company created' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Legacy provision error';
      return { ok: false, message };
    }
  }
}
