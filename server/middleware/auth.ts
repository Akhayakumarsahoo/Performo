import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";

export type AuthUser = {
  userId: string;
  companyId: string;
};

export type OutletAuth = {
  outletId: string;
  companyId: string;
  deviceId: string;
};

declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
    outlet?: OutletAuth;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const bearer = req.headers.authorization;
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : undefined;
  const fallbackToken = (req as any).cookies?.accessToken as string | undefined;
  const jwtToken = token || fallbackToken;

  if (!jwtToken) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  try {
    const decoded = jwt.verify(jwtToken, env.JWT_SECRET) as AuthUser;
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

// No role-based authorization needed since there's only one owner per company
// All authenticated users have full access to their company's data

export function requireOutletAuth(req: Request, res: Response, next: NextFunction) {
  const bearer = req.headers.authorization;
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : undefined;
  const fallbackToken = (req as any).cookies?.outletToken as string | undefined;
  const jwtToken = token || fallbackToken;

  if (!jwtToken) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  try {
    const decoded = jwt.verify(jwtToken, env.JWT_SECRET) as OutletAuth;
    // Basic shape check
    if (!decoded.outletId || !decoded.companyId || !decoded.deviceId) {
      return res.status(401).json({ message: "Invalid outlet token" });
    }
    req.outlet = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired outlet token" });
  }
}
