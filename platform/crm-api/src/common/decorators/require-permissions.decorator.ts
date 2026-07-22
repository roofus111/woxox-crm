import { SetMetadata } from '@nestjs/common';
import { PlatformPermission } from '../platform-rbac';

export const PERMISSIONS_KEY = 'platform_permissions';

/** Require at least one of the listed permissions (OR). Empty = any platform staff. */
export const RequirePermissions = (...permissions: PlatformPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
