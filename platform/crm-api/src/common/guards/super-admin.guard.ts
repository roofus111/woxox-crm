import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../decorators/current-user.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import {
  isPlatformStaffRole,
  PlatformPermission,
  roleHasPermission,
} from '../platform-rbac';

/**
 * Allows any platform staff role. When @RequirePermissions(...) is set,
 * user must have at least one of those permissions.
 */
@Injectable()
export class PlatformStaffGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;

    if (!user || !isPlatformStaffRole(user.role)) {
      throw new ForbiddenException('Platform staff access required');
    }

    const required =
      this.reflector.getAllAndOverride<PlatformPermission[]>(PERMISSIONS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) || [];

    if (!required.length) return true;

    const ok = required.some((p) => roleHasPermission(user.role, p));
    if (!ok) {
      throw new ForbiddenException(
        `Missing permission: ${required.join(' or ')}`,
      );
    }
    return true;
  }
}

/** Alias kept for existing @UseGuards(SuperAdminGuard) imports */
@Injectable()
export class SuperAdminGuard extends PlatformStaffGuard {
  constructor(reflector: Reflector) {
    super(reflector);
  }
}
