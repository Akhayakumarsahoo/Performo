import jwt, { SignOptions, Secret } from "jsonwebtoken";
import env from "../config/env";
import { AuthUser } from "../middleware/auth";

export function signAccessToken(payload: AuthUser) {
  return jwt.sign(payload, env.JWT_SECRET as Secret, { expiresIn: env.JWT_EXPIRES_IN } as SignOptions);
}

export function signRefreshToken(payload: AuthUser) {
  return jwt.sign(payload, env.REFRESH_SECRET as Secret, { expiresIn: env.REFRESH_EXPIRES_IN } as SignOptions);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.REFRESH_SECRET) as AuthUser;
}
