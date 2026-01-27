import { UserRole, USER_ROLES } from './roles';

export function roleToDefaultPath(role: UserRole) {
  switch (role) {
    case USER_ROLES.ADMIN:
    case USER_ROLES.OWNER:
      return '/dashboard';
    case USER_ROLES.MANAGER:
      return '/manager/dashboard';
    case USER_ROLES.SALESPERSON:
      return '/sales/dashboard';
    default:
      return '/dashboard';
  }
}
