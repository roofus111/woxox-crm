import { Role } from '@prisma/client';

/** Control-plane permissions */
export type PlatformPermission =
  | 'tenants:read'
  | 'tenants:write'
  | 'tenants:impersonate'
  | 'tenants:delete'
  | 'billing:read'
  | 'billing:write'
  | 'staff:manage'
  | 'audit:read';

export const ALL_PLATFORM_PERMISSIONS: PlatformPermission[] = [
  'tenants:read',
  'tenants:write',
  'tenants:impersonate',
  'tenants:delete',
  'billing:read',
  'billing:write',
  'staff:manage',
  'audit:read',
];

export const PLATFORM_STAFF_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.PLATFORM_FINANCE,
  Role.PLATFORM_SUPPORT,
  Role.PLATFORM_SALES,
  Role.PLATFORM_DEVOPS,
  Role.PLATFORM_READONLY,
];

const ROLE_PERMISSIONS: Record<string, PlatformPermission[]> = {
  [Role.SUPER_ADMIN]: [...ALL_PLATFORM_PERMISSIONS],
  [Role.PLATFORM_FINANCE]: [
    'tenants:read',
    'billing:read',
    'billing:write',
    'audit:read',
  ],
  [Role.PLATFORM_SUPPORT]: [
    'tenants:read',
    'tenants:write',
    'tenants:impersonate',
    'billing:read',
    'audit:read',
  ],
  [Role.PLATFORM_SALES]: [
    'tenants:read',
    'tenants:write',
    'billing:read',
    'audit:read',
  ],
  [Role.PLATFORM_DEVOPS]: [
    'tenants:read',
    'tenants:impersonate',
    'billing:read',
    'audit:read',
  ],
  [Role.PLATFORM_READONLY]: ['tenants:read', 'billing:read', 'audit:read'],
};

export function isPlatformStaffRole(role: string | undefined | null): boolean {
  return Boolean(role && PLATFORM_STAFF_ROLES.includes(role as Role));
}

export function permissionsForRole(role: string | undefined | null): PlatformPermission[] {
  if (!role) return [];
  return ROLE_PERMISSIONS[role] || [];
}

export function roleHasPermission(
  role: string | undefined | null,
  permission: PlatformPermission,
): boolean {
  return permissionsForRole(role).includes(permission);
}

export const PLATFORM_ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Platform Owner',
  PLATFORM_FINANCE: 'Finance',
  PLATFORM_SUPPORT: 'Customer Support',
  PLATFORM_SALES: 'Sales',
  PLATFORM_DEVOPS: 'DevOps',
  PLATFORM_READONLY: 'Read Only',
};
