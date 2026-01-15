import { Router } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import env from "../config/env";
import { validateBody } from "../middleware/validate";
import { outletLoginSchema } from "../schemas/auth";
import { createOutletSalesSchema } from "../schemas/sales";
import { Outlet } from "../models/Outlet";
import { DailySales } from "../models/DailySales";
import { verifyPassword } from "../utils/password";
import { requireOutletAuth, OutletAuth } from "../middleware/auth";
import { computeOutletStats } from "../services/performance";

const router = Router();

// Get list of outlets for selection (no auth required for this endpoint)
router.get("/list", async (req, res, next) => {
  try {
    const { companyId } = req.query as { companyId?: string };
    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }
    
    const outlets = await Outlet.find({ companyId, active: true })
      .select("_id name outletId city")
      .lean();
    
    res.json(outlets);
  } catch (error) {
    next(error);
  }
});

// Login with outletId + password + deviceId
router.post("/login", validateBody(outletLoginSchema), async (req, res, next) => {
  try {
    const { outletId, password, deviceId } = req.body as {
      outletId: string;
      password: string;
      deviceId: string;
    };

    const outlet = await Outlet.findOne({ outletId });
    if (!outlet || !outlet.active) {
      return res.status(401).json({ message: "Invalid outlet credentials" });
    }

    const ok = await verifyPassword(password, outlet.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid outlet credentials" });
    }

    // Enforce one-device-per-outlet binding
    if (!outlet.deviceId) {
      outlet.deviceId = deviceId;
      outlet.deviceBoundAt = new Date();
      await outlet.save();
    } else if (outlet.deviceId !== deviceId) {
      return res.status(403).json({ message: "Outlet already bound to another device" });
    }

    const payload: OutletAuth = {
      outletId: outlet._id.toString(),
      companyId: outlet.companyId.toString(),
      deviceId,
    };

    const token = jwt.sign(payload, env.JWT_SECRET as Secret, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);

    res.json({
      token,
      outlet: {
        id: outlet._id,
        name: outlet.name,
        city: outlet.city,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create daily sales from outlet session (salesperson enters name each time)
router.post("/sales", requireOutletAuth, validateBody(createOutletSalesSchema), async (req, res, next) => {
  try {
    const outletAuth = req.outlet!;
    const { date, totalSales, payments, evidenceImages, cashExpenses = 0, cashWithdrawal = 0, enteredByName } =
      req.body as {
        date: Date;
        totalSales: number;
        payments: { cash: number; upi: number; card: number };
        evidenceImages?: string[];
        cashExpenses?: number;
        cashWithdrawal?: number;
        enteredByName: string;
      };

    const existing = await DailySales.findOne({
      companyId: outletAuth.companyId,
      outletId: outletAuth.outletId,
      date,
    });
    if (existing) {
      return res.status(409).json({ message: "Sales for this date already exists" });
    }

    const record = await DailySales.create({
      companyId: outletAuth.companyId,
      outletId: outletAuth.outletId,
      date,
      totalSales,
      payments,
      evidenceImages,
      cashExpenses,
      cashWithdrawal,
      enteredByName,
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

// Get performance for the currently authenticated outlet
router.get("/performance", requireOutletAuth, async (req, res, next) => {
  try {
    const outletAuth = req.outlet!;

    const stats = await computeOutletStats(outletAuth.companyId, outletAuth.outletId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = await DailySales.findOne({
      companyId: outletAuth.companyId,
      outletId: outletAuth.outletId,
      date: today,
      approved: true,
    }).lean();

    res.json({
      outletId: outletAuth.outletId,
      stats,
      today: {
        totalSales: todaySales?.totalSales || 0,
        payments: todaySales?.payments || { cash: 0, upi: 0, card: 0 },
        approved: todaySales?.approved || false,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
