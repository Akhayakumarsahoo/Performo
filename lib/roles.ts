export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALESPERSON: 'salesperson',
  PARTNER: 'partner',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
