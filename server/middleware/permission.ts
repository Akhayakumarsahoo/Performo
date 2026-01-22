import { NextFunction, Request, Response } from 'express';
import { Permission, hasPermission } from '@/lib/permissions';
import { ForbiddenError } from '../utils/errors';

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user || !hasPermission(user.role, permission)) {
      return next(
        new ForbiddenError("You don't have permission to perform this action.")
      );
    }
    next();
  };
}
