import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";

export type AuthUser = {
  userId: string;
  companyId: string;
  role: "owner" | "manager";
  outletId?: string;
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

export function requireOwnerAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "owner") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export function requireOutletAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const bearer = req.headers.authorization;
  const token = bearer?.startsWith("Bearer ") ? bearer.slice(7) : undefined;
  const fallbackToken = (req as any).cookies?.outletToken as string | undefined;
  const jwtToken = token || fallbackToken;

  if (!jwtToken) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  try {
    const decoded = jwt.verify(jwtToken, env.JWT_SECRET) as OutletAuth;
    if (!decoded.outletId || !decoded.companyId || !decoded.deviceId) {
      return res.status(401).json({ message: "Invalid outlet token" });
    }
    req.outlet = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired outlet token" });
  }
}

export const auth = (req: any): Promise<AuthUser> => {
  return new Promise((resolve, reject) => {
    const bearer = req.headers.get?.("authorization");
    const token = typeof bearer === 'string' && bearer.startsWith("Bearer ") ? bearer.slice(7) : undefined;

    const cookieHeader = req.headers.get?.('Cookie');
    let fallbackToken: string | undefined;
    if (typeof cookieHeader === 'string') {
      const cookies = cookieHeader.split(';');
      for (const cookie of cookies) {
        const parts = cookie.trim().split('=');
        if (parts[0] === 'accessToken') {
          fallbackToken = parts[1];
          break;
        }
      }
    }

    const jwtToken = token || fallbackToken;

    if (!jwtToken) {
      return reject(new Error("Unauthenticated"));
    }

    try {
      const decoded = jwt.verify(jwtToken, env.JWT_SECRET) as AuthUser;
      resolve(decoded);
    } catch (err) {
      reject(new Error("Invalid or expired token"));
    }
  });
};
