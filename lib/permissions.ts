import { USER_ROLES, UserRole } from './roles';

export const PERMISSIONS = {
  // Outlet permissions
  'outlets:read': [USER_ROLES.OWNER, USER_ROLES.ADMIN],
  'outlets:create': [USER_ROLES.OWNER, USER_ROLES.ADMIN],
  'outlets:update': [USER_ROLES.OWNER, USER_ROLES.ADMIN],

  // Company permissions
  'company:read:salespersons': [USER_ROLES.OWNER],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permittedRoles = PERMISSIONS[permission] as readonly UserRole[];
  return permittedRoles.includes(role);
}
