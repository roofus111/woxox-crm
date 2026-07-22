import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.module';
import {
  LoginDto,
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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
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

    return this.issueToken(result.user.id, result.user.email, result.workspace.id, Role.ADMIN);
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
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
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

    return this.issueToken(user.id, user.email, membership.workspaceId, membership.role);
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

    const updated = await this.prisma.workspace.update({
      where: { id: workspace.id },
      data: {
        ...(dto.companyName ? { name: dto.companyName.trim() } : {}),
        ...(dto.modules?.length ? { enabledModules: dto.modules } : {}),
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

  private issueToken(userId: string, email: string, workspaceId: string, role: Role) {
    const permissions = permissionsForRole(role);
    const accessToken = this.jwt.sign({
      sub: userId,
      email,
      workspaceId,
      role,
      permissions,
    });
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
      platformStaffRoles: PLATFORM_STAFF_ROLES,
    };
  }
}
