import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.module';
import {
  LoginDto,
  LegacyBridgeDto,
  MfaCodeDto,
  MfaVerifyDto,
  OnboardingUpdateDto,
  RegisterWorkspaceDto,
} from './dto/auth.dto';
import { Role, Prisma } from '@prisma/client';
import {
  isPlatformStaffRole,
  permissionsForRole,
  PLATFORM_STAFF_ROLES,
} from '../../common/platform-rbac';
import {
  buildOtpAuthUrl,
  generateTotpSecret,
  getOtpAuthUri,
  verifyTotp,
} from '../../common/totp.util';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { MailService } from '../../common/mail.service';
import { LegacyProvisionService } from '../../common/legacy-provision.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
    private readonly legacyProvision: LegacyProvisionService,
  ) {}

  async register(dto: RegisterWorkspaceDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const slug = dto.workspaceName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48);

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: dto.workspaceName,
          slug: `${slug}-${Date.now().toString(36)}`,
          settings: { onboardingComplete: false, onboardingStep: 'profile' },
        },
      });
      const user = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
          name: dto.name ?? 'Admin',
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
      return { workspace, user };
    });

    const loginUrl = process.env.APP_ORIGIN
      ? `${process.env.APP_ORIGIN}/en/login`
      : 'https://app.woxox.com/en/login';
    const onboardingUrl = process.env.APP_ORIGIN
      ? `${process.env.APP_ORIGIN}/en/onboarding`
      : 'https://app.woxox.com/en/onboarding';

    const welcome = await this.mail.sendWelcomeEmail({
      to: result.user.email,
      companyName: result.workspace.name,
      adminName: result.user.name || undefined,
      loginUrl,
      onboardingUrl,
      plan: 'trial',
    });

    const legacy = await this.legacyProvision.provision({
      companyName: result.workspace.name,
      adminEmail: result.user.email,
      adminPassword: dto.password,
      adminName: result.user.name || 'Admin',
      enabledModules: ['crm'],
    });

    const token = this.issueToken(result.user.id, result.user.email, result.workspace.id, Role.ADMIN);
    return {
      ...token,
      onboardingUrl,
      welcomeEmailSent: welcome.sent,
      welcomeEmailReason: welcome.sent ? undefined : welcome.reason,
      legacyProvisioned: legacy.ok,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        memberships: {
          where: { isActive: true },
          include: { workspace: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!user) {
      return this.bridgeLegacyLogin(dto);
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      const legacyOk = await this.verifyLegacyCredentials(dto.email, dto.password);
      if (!legacyOk) {
        throw new UnauthorizedException('Invalid email or password');
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(dto.password, 12) },
      });
    }

    const membership =
      user.memberships.find((m) => isPlatformStaffRole(m.role)) ||
      user.memberships.find((m) => m.workspace.status !== 'suspended') ||
      user.memberships[0];

    if (!membership) {
      throw new UnauthorizedException('No workspace membership');
    }

    if (
      !isPlatformStaffRole(membership.role) &&
      membership.workspace.status === 'suspended'
    ) {
      throw new UnauthorizedException('Workspace is suspended');
    }

    if (user.twoFactorEnabled && user.twoFactorSecret && isPlatformStaffRole(membership.role)) {
      const mfaToken = this.jwt.sign(
        {
          sub: user.id,
          email: user.email,
          workspaceId: membership.workspaceId,
          role: membership.role,
          mfaPending: true,
        },
        { expiresIn: '5m' },
      );
      return {
        success: true,
        mfaRequired: true,
        mfaToken,
        user: { id: user.id, email: user.email, role: membership.role },
      };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueToken(user.id, user.email, membership.workspaceId, membership.role, {
      enabledModules: membership.workspace.enabledModules,
      plan: membership.workspace.plan,
      name: membership.workspace.name,
      planModules: await this.resolvePlanModules(membership.workspace.plan),
    });
  }

  async verifyMfa(dto: MfaVerifyDto) {
    let payload: JwtPayload & { mfaPending?: boolean };
    try {
      payload = this.jwt.verify(dto.mfaToken);
    } catch {
      throw new UnauthorizedException('MFA session expired — sign in again');
    }
    if (!payload.mfaPending) {
      throw new BadRequestException('Invalid MFA session');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
      throw new UnauthorizedException('MFA is not enabled');
    }
    if (!verifyTotp(user.twoFactorSecret, dto.code)) {
      throw new UnauthorizedException('Invalid authenticator code');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueToken(
      user.id,
      user.email,
      payload.workspaceId,
      payload.role as Role,
    );
  }

  async setupMfa(actor: JwtPayload) {
    if (!isPlatformStaffRole(actor.role)) {
      throw new UnauthorizedException('Platform staff only');
    }
    const secret = generateTotpSecret();
    await this.prisma.user.update({
      where: { id: actor.sub },
      data: { twoFactorSecret: secret, twoFactorEnabled: false },
    });
    return {
      success: true,
      secret,
      otpauthUrl: getOtpAuthUri(secret, actor.email),
      qrUrl: buildOtpAuthUrl(secret, actor.email),
      message: 'Scan the QR code, then call /auth/mfa/enable with a 6-digit code',
    };
  }

  async enableMfa(actor: JwtPayload, dto: MfaCodeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: actor.sub } });
    if (!user?.twoFactorSecret) {
      throw new BadRequestException('Call /auth/mfa/setup first');
    }
    if (!verifyTotp(user.twoFactorSecret, dto.code)) {
      throw new UnauthorizedException('Invalid authenticator code');
    }
    await this.prisma.user.update({
      where: { id: actor.sub },
      data: { twoFactorEnabled: true },
    });
    return { success: true, twoFactorEnabled: true };
  }

  async disableMfa(actor: JwtPayload, dto: MfaCodeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: actor.sub } });
    if (!user?.twoFactorSecret || !user.twoFactorEnabled) {
      return { success: true, twoFactorEnabled: false };
    }
    if (!verifyTotp(user.twoFactorSecret, dto.code)) {
      throw new UnauthorizedException('Invalid authenticator code');
    }
    await this.prisma.user.update({
      where: { id: actor.sub },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    return { success: true, twoFactorEnabled: false };
  }

  async getOnboarding(actor: JwtPayload) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: actor.workspaceId },
    });
    if (!workspace) throw new UnauthorizedException('Workspace not found');
    const planRow = await this.prisma.plan.findFirst({
      where: { code: workspace.plan },
      select: { enabledModules: true },
    });
    const settings = (workspace.settings || {}) as Record<string, unknown>;
    return {
      success: true,
      onboardingComplete: Boolean(settings.onboardingComplete),
      step: String(settings.onboardingStep || 'profile'),
      workspace: {
        id: workspace.id,
        name: workspace.name,
        plan: workspace.plan,
        enabledModules: workspace.enabledModules,
        planModules: planRow?.enabledModules?.length ? planRow.enabledModules : ['crm'],
      },
      data: settings.onboardingData || {},
    };
  }

  async updateOnboarding(actor: JwtPayload, dto: OnboardingUpdateDto) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: actor.workspaceId },
    });
    if (!workspace) throw new UnauthorizedException('Workspace not found');
    const settings = {
      ...((workspace.settings || {}) as Record<string, unknown>),
    };
    const data = {
      ...((settings.onboardingData as Record<string, unknown>) || {}),
      ...(dto.companyName ? { companyName: dto.companyName } : {}),
      ...(dto.industry ? { industry: dto.industry } : {}),
      ...(dto.teamSize ? { teamSize: dto.teamSize } : {}),
      ...(dto.inviteEmail ? { inviteEmail: dto.inviteEmail } : {}),
      ...(dto.modules ? { modules: dto.modules } : {}),
    };
    settings.onboardingData = data;
    settings.onboardingStep = dto.step || settings.onboardingStep || 'profile';

    let enabledModules: string[] | undefined;
    if (dto.modules?.length) {
      const planRow = await this.prisma.plan.findFirst({
        where: { code: workspace.plan },
        select: { enabledModules: true },
      });
      const allowed = planRow?.enabledModules?.length ? planRow.enabledModules : ['crm'];
      const picked = dto.modules.filter(m => allowed.includes(m));
      enabledModules = picked.includes('crm') ? picked : ['crm', ...picked];
    }

    const updated = await this.prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        ...(dto.companyName ? { name: dto.companyName.trim() } : {}),
        ...(enabledModules ? { enabledModules } : {}),
        settings: settings as Prisma.InputJsonValue,
      },
    });

    if (dto.inviteEmail) {
      const loginUrl = process.env.APP_ORIGIN
        ? `${process.env.APP_ORIGIN}/en/login`
        : 'https://app.woxox.com/en/login';
      await this.mail.send({
        to: dto.inviteEmail,
        subject: `You're invited to ${updated.name} on WOXOX`,
        html: `<p>You've been invited to join <strong>${updated.name}</strong> on WOXOX.</p><p><a href="${loginUrl}">Open WOXOX</a></p>`,
      });
    }

    return { success: true, step: settings.onboardingStep, data };
  }

  async completeOnboarding(actor: JwtPayload) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: actor.workspaceId },
    });
    if (!workspace) throw new UnauthorizedException('Workspace not found');
    const settings = {
      ...((workspace.settings || {}) as Record<string, unknown>),
      onboardingComplete: true,
      onboardingStep: 'done',
    };
    await this.prisma.workspace.update({
      where: { id: workspace.id },
      data: { settings },
    });
    return { success: true, onboardingComplete: true };
  }

  /**
   * Legacy-only tenants (e.g. company-register flow) exist in MongoDB but not PostgreSQL.
   * Verify credentials against the legacy API and auto-provision a platform workspace.
   */
  private async bridgeLegacyLogin(dto: LoginDto) {
    const legacySession = await this.verifyLegacyCredentials(dto.email, dto.password);
    if (!legacySession) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.provisionLegacySession(dto.email, dto.password, legacySession);
  }

  async bridgeWithLegacyToken(legacyToken: string) {
    const legacySession = await this.resolveLegacySession(legacyToken);
    if (!legacySession?.user?.email) {
      throw new UnauthorizedException('Invalid legacy session');
    }

    // Password is unused when trustLegacySession is true — legacy JWT already proved identity.
    return this.provisionLegacySession(
      legacySession.user.email,
      randomUUID(),
      legacySession,
      { trustLegacySession: true },
    );
  }

  /** Link a legacy MongoDB user to the correct PostgreSQL workspace (admin or team member). */
  private async provisionLegacySession(
    email: string,
    password: string,
    legacySession: {
      base: string;
      token: string;
      user?: { name?: string; companyId?: string; email?: string; role?: string };
    },
    options: { trustLegacySession?: boolean } = {},
  ) {
    const normalizedEmail = email.toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        memberships: {
          where: { isActive: true },
          include: { workspace: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (existing) {
      if (options.trustLegacySession) {
        return this.issueTokenForTrustedLegacyUser(existing);
      }
      return this.authenticateExistingUser(existing, password);
    }

    const legacyRole = (legacySession.user?.role || 'user').toLowerCase();
    const companyWorkspace = await this.findCompanyWorkspaceViaLegacy(
      legacySession.base,
      legacySession.token,
    );

    if (companyWorkspace) {
      const joined = await this.joinWorkspaceForLegacyMember({
        email: normalizedEmail,
        password,
        name: legacySession.user?.name,
        legacyRole,
        workspaceId: companyWorkspace.workspaceId,
      });
      return this.issueToken(
        joined.user.id,
        joined.user.email,
        joined.workspace.id,
        joined.role,
        {
          enabledModules: joined.workspace.enabledModules,
          plan: joined.workspace.plan,
          name: joined.workspace.name,
        },
      );
    }

    if (legacyRole !== 'admin') {
      throw new UnauthorizedException(
        'Your company workspace is not set up yet. Ask your company admin to sign in once, then try again.',
      );
    }

    const companyName = await this.fetchLegacyCompanyName(
      legacySession.base,
      legacySession.token,
      legacySession.user?.companyId,
    );

    const created = await this.createWorkspaceForLegacyAdmin({
      email: normalizedEmail,
      password,
      name: legacySession.user?.name,
      companyName,
    });

    return this.issueToken(
      created.user.id,
      created.user.email,
      created.workspace.id,
      Role.ADMIN,
      {
        enabledModules: created.workspace.enabledModules,
        plan: created.workspace.plan,
        name: created.workspace.name,
      },
    );
  }

  private mapLegacyRoleToPlatform(role?: string): Role {
    switch ((role || 'user').toLowerCase()) {
      case 'admin':
        return Role.ADMIN;
      case 'manager':
        return Role.MANAGER;
      case 'finance':
        return Role.FINANCE;
      case 'pipeline':
        return Role.PIPELINE;
      default:
        return Role.USER;
    }
  }

  private async findCompanyWorkspaceViaLegacy(base: string, legacyToken: string) {
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/user-profiles`, {
        headers: { Authorization: `Bearer ${legacyToken}` },
      });
      const profiles = (await res.json().catch(() => [])) as Array<{ email?: string; role?: string }>;
      if (!res.ok || !Array.isArray(profiles)) return null;

      const admin = profiles.find((p) => p.role === 'admin' && p.email);
      if (!admin?.email) return null;

      const adminUser = await this.prisma.user.findUnique({
        where: { email: admin.email.toLowerCase() },
        include: {
          memberships: {
            where: { isActive: true },
            include: { workspace: true },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      const membership = adminUser?.memberships[0];
      if (!membership?.workspace) return null;

      return {
        workspaceId: membership.workspaceId,
        workspace: membership.workspace,
      };
    } catch {
      return null;
    }
  }

  private async joinWorkspaceForLegacyMember(input: {
    email: string;
    password: string;
    name?: string;
    legacyRole?: string;
    workspaceId: string;
  }) {
    const role = this.mapLegacyRoleToPlatform(input.legacyRole);
    const passwordHash = await bcrypt.hash(input.password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email.toLowerCase(),
          passwordHash,
          name: input.name?.trim() || 'Team Member',
          emailVerified: new Date(),
        },
      });
      await tx.workspaceMember.create({
        data: {
          workspaceId: input.workspaceId,
          userId: user.id,
          role,
        },
      });
      const workspace = await tx.workspace.findUniqueOrThrow({
        where: { id: input.workspaceId },
      });
      return { user, workspace, role };
    });

    await this.prisma.user.update({
      where: { id: result.user.id },
      data: { lastLoginAt: new Date() },
    });

    return result;
  }

  private async authenticateExistingUser(
    user: {
      id: string;
      email: string;
      passwordHash: string;
      twoFactorEnabled: boolean;
      twoFactorSecret: string | null;
      memberships: Array<{
        workspaceId: string;
        role: Role;
        workspace: { status: string };
      }>;
    },
    password: string,
  ) {
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      const legacyOk = await this.verifyLegacyCredentials(user.email, password);
      if (!legacyOk) {
        throw new UnauthorizedException('Invalid email or password');
      }
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(password, 12) },
      });
    }

    return this.issueTokenForTrustedLegacyUser(user);
  }

  /** Issue a platform JWT for a user whose identity was already verified (password or legacy token). */
  private async issueTokenForTrustedLegacyUser(user: {
    id: string;
    email: string;
    memberships: Array<{
      workspaceId: string;
      role: Role;
      workspace: { status: string; enabledModules?: string[]; plan?: string; name?: string };
    }>;
  }) {
    const membership =
      user.memberships.find((m) => isPlatformStaffRole(m.role)) ||
      user.memberships.find((m) => m.workspace.status !== 'suspended') ||
      user.memberships[0];

    if (!membership) {
      throw new UnauthorizedException('No workspace membership');
    }

    if (
      !isPlatformStaffRole(membership.role) &&
      membership.workspace.status === 'suspended'
    ) {
      throw new UnauthorizedException('Workspace is suspended');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.issueToken(
      user.id,
      user.email,
      membership.workspaceId,
      membership.role,
      {
        enabledModules: membership.workspace.enabledModules,
        plan: membership.workspace.plan,
        name: membership.workspace.name,
      },
    );
  }

  private async verifyLegacyCredentials(email: string, password: string) {
    const base = process.env.LEGACY_API_URL || process.env.BACKEND_API_URL;
    if (!base) return null;

    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        token?: string;
        user?: { name?: string; companyId?: string; email?: string; role?: string };
      };
      if (!res.ok || !data.token) return null;
      return { base, token: data.token, user: data.user };
    } catch {
      return null;
    }
  }

  private async resolveLegacySession(legacyToken: string) {
    const base = process.env.LEGACY_API_URL || process.env.BACKEND_API_URL;
    if (!base || !legacyToken) return null;

    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/verify-refresh`, {
        headers: { Authorization: `Bearer ${legacyToken}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        user?: { email?: string; name?: string; companyId?: string; role?: string };
      };
      if (!res.ok || !data.user?.email) return null;
      return { base, token: legacyToken, user: data.user };
    } catch {
      return null;
    }
  }

  private async createWorkspaceForLegacyAdmin(input: {
    email: string;
    password: string;
    name?: string;
    companyName: string;
  }) {
    const email = input.email.toLowerCase();
    const passwordHash = await bcrypt.hash(input.password, 12);
    const slugBase =
      input.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40) || 'company';

    const result = await this.prisma.$transaction(async (tx) => {
      const tenantCount = await tx.workspace.count();
      const tenantCode = `WOX-${String(tenantCount + 1).padStart(6, '0')}`;
      const workspace = await tx.workspace.create({
        data: {
          name: input.companyName,
          slug: `${slugBase}-${Date.now().toString(36)}`,
          tenantCode,
          plan: 'trial',
          status: 'trial',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          enabledModules: ['crm'],
          settings: {
            onboardingComplete: false,
            onboardingStep: 'profile',
            provisionedBy: 'legacy-bridge',
          },
        },
      });
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: input.name?.trim() || 'Company Admin',
          emailVerified: new Date(),
        },
      });
      await tx.workspaceMember.create({
        data: { workspaceId: workspace.id, userId: user.id, role: Role.ADMIN },
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
      return { workspace, user };
    });

    await this.prisma.user.update({
      where: { id: result.user.id },
      data: { lastLoginAt: new Date() },
    });

    return result;
  }

  private async fetchLegacyCompanyName(
    base: string,
    token: string,
    companyId?: string,
  ): Promise<string> {
    if (!companyId) {
      return 'My Company';
    }
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/api/companies`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as { name?: string };
      if (res.ok && data.name) {
        return String(data.name).trim();
      }
    } catch {
      /* fall through */
    }
    return 'My Company';
  }

  private async resolvePlanModules(planCode?: string | null) {
    if (!planCode) return ['crm'];
    const planRow = await this.prisma.plan.findFirst({
      where: { code: planCode },
      select: { enabledModules: true },
    });
    return planRow?.enabledModules?.length ? planRow.enabledModules : ['crm'];
  }

  private issueToken(
    userId: string,
    email: string,
    workspaceId: string,
    role: Role,
    workspace?: {
      enabledModules?: string[];
      plan?: string;
      name?: string;
      planModules?: string[];
    },
  ) {
    const permissions = permissionsForRole(role);
    const accessToken = this.jwt.sign({
      sub: userId,
      email,
      workspaceId,
      role,
      permissions,
    });
    const enabledModules = workspace?.enabledModules?.length ? workspace.enabledModules : ['crm'];
    const planModules = workspace?.planModules?.length ? workspace.planModules : enabledModules;
    return {
      success: true,
      mfaRequired: false,
      accessToken,
      user: {
        id: userId,
        email,
        role,
        permissions,
        isPlatformStaff: isPlatformStaffRole(role),
      },
      workspaceId,
      workspace: workspace
        ? {
            id: workspaceId,
            plan: workspace.plan || 'starter',
            name: workspace.name,
            enabledModules,
            planModules,
          }
        : { id: workspaceId, enabledModules, planModules: enabledModules },
      platformStaffRoles: PLATFORM_STAFF_ROLES,
    };
  }
}
