import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.module';
import { LoginDto, RegisterWorkspaceDto } from './dto/auth.dto';
import { Role } from '@prisma/client';
import {
  isPlatformStaffRole,
  permissionsForRole,
  PLATFORM_STAFF_ROLES,
} from '../../common/platform-rbac';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
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
        data: { name: dto.workspaceName, slug: `${slug}-${Date.now().toString(36)}` },
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

    // Prefer any platform staff membership for control-plane login
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

    return this.issueToken(user.id, user.email, membership.workspaceId, membership.role);
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
