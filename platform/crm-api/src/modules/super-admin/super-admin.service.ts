import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.module';
import {
  CreateTenantDto,
  ResetTenantPasswordDto,
  UpdateTenantDto,
} from './dto/super-admin.dto';

const DEFAULT_MODULES = ['crm'];

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  async listTenants() {
    const workspaces = await this.prisma.workspace.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          where: { role: { in: [Role.ADMIN, Role.SUPER_ADMIN] } },
          take: 5,
          include: { user: { select: { id: true, email: true, name: true, lastLoginAt: true } } },
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
    });

    return {
      success: true,
      total: workspaces.length,
      tenants: workspaces.map((w) => ({
        id: w.id,
        tenantCode: w.tenantCode,
        name: w.name,
        slug: w.slug,
        plan: w.plan,
        status: w.status,
        trialEndsAt: w.trialEndsAt,
        enabledModules: w.enabledModules,
        createdAt: w.createdAt,
        admins: w.users.map((m) => m.user),
        counts: w._count,
      })),
    };
  }

  async createTenant(dto: CreateTenantDto) {
    const email = dto.adminEmail.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Admin email already registered');
    }

    const baseSlug = dto.companyName
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

    const result = await this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: dto.companyName.trim(),
          slug,
          tenantCode,
          plan: dto.plan ?? 'trial',
          status: 'active',
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

      // Default sales pipeline for new tenants
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

      return { workspace, user };
    });

    // Best-effort legacy Mongo provision (main CRM app login)
    const legacy = await this.provisionLegacyTenant({
      companyName: dto.companyName.trim(),
      adminEmail: email,
      adminPassword: dto.adminPassword,
      adminName: dto.adminName?.trim() || 'Company Admin',
      enabledModules: modules,
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

  async updateTenant(id: string, dto: UpdateTenantDto) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) throw new NotFoundException('Tenant not found');

    const updated = await this.prisma.workspace.update({
      where: { id },
      data: {
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.plan ? { plan: dto.plan } : {}),
        ...(dto.enabledModules ? { enabledModules: dto.enabledModules } : {}),
      },
    });

    return { success: true, tenant: updated };
  }

  async resetAdminPassword(id: string, dto: ResetTenantPasswordDto) {
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

    return {
      success: true,
      email: membership.user.email,
      message: 'Password updated',
    };
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
