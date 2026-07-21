import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { ApiError } from '../../common/ApiError.js';
import { env, isProduction, resolveJwtSecret } from '../../config/env.js';
import { permissionsForRoles } from '../../host/auth.middleware.js';
import { LegalUser } from './user.model.js';

const registerDto = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    name: z.string().min(2).max(120),
    workspaceId: z.string().optional(),
  })
  .strict();

const loginDto = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

function signUserToken(user: {
  id: string;
  email: string;
  name: string;
  roles: string[];
  workspaceIds: string[];
}): string {
  const options: jwt.SignOptions = { expiresIn: '12h' };
  if (env.JWT_ISSUER) options.issuer = env.JWT_ISSUER;
  if (env.JWT_AUDIENCE) options.audience = env.JWT_AUDIENCE;

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      permissions: permissionsForRoles(user.roles),
      workspaceIds: user.workspaceIds,
    },
    resolveJwtSecret(),
    options,
  );
}

export class AuthService {
  async register(raw: unknown) {
    if (isProduction) {
      throw ApiError.forbidden('Self-registration is disabled in production — use WOXOX provisioning');
    }
    const input = registerDto.parse(raw);
    const existing = await LegalUser.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict('Email already registered');
    }

    const workspaceId = input.workspaceId ?? '000000000000000000000001';
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await LegalUser.create({
      email: input.email.toLowerCase(),
      name: input.name,
      passwordHash,
      roles: ['advocate'],
      workspaceIds: [workspaceId],
    });

    const token = signUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      workspaceIds: user.workspaceIds,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        workspaceIds: user.workspaceIds,
      },
      workspaceId,
    };
  }

  async login(raw: unknown) {
    const input = loginDto.parse(raw);

    // Dev convenience account (always available outside production)
    if (!isProduction && input.email === 'demo@woxox.local' && input.password === 'demo123') {
      const workspaceId = '000000000000000000000001';
      const token = signUserToken({
        id: '0000000000000000000000aa',
        email: 'demo@woxox.local',
        name: 'Demo Advocate',
        roles: ['legal-admin', 'advocate'],
        workspaceIds: [workspaceId],
      });
      return {
        token,
        user: {
          id: '0000000000000000000000aa',
          email: 'demo@woxox.local',
          name: 'Demo Advocate',
          roles: ['legal-admin', 'advocate'],
          workspaceIds: [workspaceId],
        },
        workspaceId,
      };
    }

    const user = await LegalUser.findOne({ email: input.email.toLowerCase(), active: true });
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = signUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      workspaceIds: user.workspaceIds,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        workspaceIds: user.workspaceIds,
      },
      workspaceId: user.workspaceIds[0],
    };
  }

  /**
   * SSO from WOXOX CRM (Sooraj host). Validates CRM_BRIDGE_SECRET and upserts a LegalUser.
   */
  async crmBridge(raw: unknown) {
    const dto = z
      .object({
        bridgeSecret: z.string().min(8),
        email: z.string().email(),
        name: z.string().min(1).max(120),
        crmUserId: z.string().min(1).max(64),
        role: z.string().optional(),
        workspaceId: z.string().optional(),
      })
      .strict()
      .parse(raw);

    const expectedSecret =
      env.CRM_BRIDGE_SECRET ||
      (!isProduction ? 'woxox-crm-legalos-dev-bridge' : undefined);
    if (!expectedSecret || dto.bridgeSecret !== expectedSecret) {
      throw ApiError.unauthorized('Invalid CRM bridge secret');
    }

    const workspaceId = dto.workspaceId ?? env.CRM_DEFAULT_WORKSPACE_ID;
    const email = dto.email.toLowerCase();
    const crmRole = (dto.role || 'user').toLowerCase();
    const roles =
      crmRole === 'admin'
        ? (['legal-admin', 'advocate'] as string[])
        : (['advocate'] as string[]);

    let user = await LegalUser.findOne({ email });
    if (!user) {
      // Password is unused for SSO users — random hash
      const passwordHash = await bcrypt.hash(`crm-sso:${dto.crmUserId}:${Date.now()}`, 10);
      user = await LegalUser.create({
        email,
        name: dto.name,
        passwordHash,
        roles,
        workspaceIds: [workspaceId],
      });
    } else {
      user.name = dto.name;
      user.roles = roles;
      if (!user.workspaceIds.includes(workspaceId)) {
        user.workspaceIds = [...user.workspaceIds, workspaceId];
      }
      await user.save();
    }

    const token = signUserToken({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: user.roles,
      workspaceIds: user.workspaceIds,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles,
        workspaceIds: user.workspaceIds,
      },
      workspaceId: user.workspaceIds[0] ?? workspaceId,
      crmUserId: dto.crmUserId,
    };
  }
}

export const authService = new AuthService();
