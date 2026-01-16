import { Router } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import { validateBody } from "../middleware/validate";
import { loginSchema, signupSchema, refreshSchema } from "../schemas/auth";
import { Company } from "../models/Company";
import { User } from "../models/User";
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

    // First, check if the user is a company owner
    let user = await Company.findOne({ email });
    if (user) {
      if (!user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const ok = await verifyPassword(password, user.passwordHash);
      if (!ok) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const authUser = {
        userId: user._id.toString(),
        companyId: user._id.toString(),
        role: "owner",
      };

      const accessToken = signAccessToken(authUser);
      const refreshToken = signRefreshToken(authUser);

      const expiresMs = parseDurationToMs(
        env.REFRESH_EXPIRES_IN,
        30 * 24 * 60 * 60 * 1000
      );
      await Session.create({
        userId: user._id,
        companyId: user._id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + expiresMs),
        userAgent: req.headers["user-agent"],
      });

      return res.json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.ownerName,
          role: "owner",
        },
      });
    }

    // If not a company owner, check if the user is a regular user
    const regularUser = await User.findOne({ email, active: true });
    if (!regularUser || !regularUser.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await verifyPassword(password, String(regularUser.passwordHash));
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!regularUser.companyId) {
      return res.status(400).json({ message: "User missing company" });
    }

    const authUser = {
      userId: regularUser._id.toString(),
      companyId: String(regularUser.companyId),
      role: regularUser.role, // Include the user's role
    };

    const accessToken = signAccessToken(authUser);
    const refreshToken = signRefreshToken(authUser);

    const expiresMs = parseDurationToMs(
      env.REFRESH_EXPIRES_IN,
      30 * 24 * 60 * 60 * 1000
    );
    await Session.create({
      userId: regularUser._id,
      companyId: regularUser.companyId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + expiresMs),
      userAgent: req.headers["user-agent"],
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: regularUser._id,
        name: regularUser.name,
        role: regularUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/signup", validateBody(signupSchema), async (req, res, next) => {
  try {
    const { ownerName, email, phoneNumber, password, companyName } = req.body;

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res
        .status(400)
        .json({ message: "Company already exists with this email address" });
    }

    const passwordHash = await hashPassword(password);

    const company = await Company.create({
      name: companyName,
      ownerName,
      email,
      phoneNumber,
      passwordHash,
      plan: "standard",
    });

    const authUser = {
      userId: company._id.toString(),
      companyId: company._id.toString(),
      role: "owner",
    };

    const accessToken = signAccessToken(authUser);
    const refreshToken = signRefreshToken(authUser);

    const expiresMs = parseDurationToMs(
      env.REFRESH_EXPIRES_IN,
      30 * 24 * 60 * 60 * 1000
    );
    await Session.create({
      userId: company._id,
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
        name: company.ownerName,
        role: "owner",
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
    }).populate("userId");

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ message: "Session expired" });
    }

    const user = session.userId;
    if (!user || !user.active) {
      return res.status(401).json({ message: "User inactive" });
    }

    const authUser = {
      userId: user._id.toString(),
      companyId: String(user.companyId),
      role: user.role,
    };

    const accessToken = signAccessToken(authUser);
    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
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
