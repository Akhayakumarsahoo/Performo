import { Router } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import { validateBody } from "../middleware/validate";
import { loginSchema, signupSchema, refreshSchema } from "../schemas/auth";
import { Company } from "../models/Company";
import { Session } from "../models/Session";
import { verifyPassword, hashPassword } from "../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { parseDurationToMs } from "../utils/time";

const router = Router();

router.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, active: true });
    if (!user || !user.passwordHash)
      return res.status(401).json({ message: "Invalid credentials" });
    const ok = await verifyPassword(password, String(user.passwordHash));
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.companyId)
      return res.status(400).json({ message: "User missing company" });

    const authUser = {
      userId: user._id.toString(),
      companyId: String(user.companyId),
    };

    const accessToken = signAccessToken(authUser);
    const refreshToken = signRefreshToken(authUser);

    const expiresMs = parseDurationToMs(
      env.REFRESH_EXPIRES_IN,
      30 * 24 * 60 * 60 * 1000
    );
    await Session.create({
      userId: user._id,
      companyId: user.companyId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + expiresMs),
      userAgent: req.headers["user-agent"],
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/signup", validateBody(signupSchema), async (req, res, next) => {
  try {
    const { ownerName, email, phoneNumber, password, companyName } = req.body;

    // Check if user with this email already exists (across all companies)
    const existingUser = await Company.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email address" });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create company with owner details
    const company = await Company.create({
      name: companyName,
      ownerName,
      email,
      phoneNumber,
      passwordHash,
      plan: "standard",
    });

    const accessToken = signAccessToken(company._id.toString());
    const refreshToken = signRefreshToken(company._id.toString());

    const expiresMs = parseDurationToMs(
      env.REFRESH_EXPIRES_IN,
      30 * 24 * 60 * 60 * 1000
    );
    await Session.create({
      companyId: company._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + expiresMs),
      userAgent: req.headers["user-agent"],
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: company._id,
        name: company.name,
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === 11000
    ) {
      return res
        .status(400)
        .json({ message: "User already exists with this email address" });
    }
    next(error);
  }
});

router.post("/refresh", validateBody(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const decoded = verifyRefreshToken(refreshToken);
    const session = await Session.findOne({
      token: refreshToken,
      revoked: false,
    });
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ message: "Session expired" });
    }

    const company = await Company.findById(session.companyId);
    if (!company || !company.active)
      return res.status(401).json({ message: "User inactive" });

    const accessToken = signAccessToken(company._id.toString());
    res.json({
      accessToken,
      user: {
        id: ._id,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    next(error);
  }
});

router.post("/logout", validateBody(refreshSchema), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await Session.updateOne(
      { token: refreshToken },
      { $set: { revoked: true } }
    );
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
