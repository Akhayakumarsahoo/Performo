import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { DailySales } from "../models/DailySales";
import { isValidObjectId } from "mongoose";
import { validateBody } from "../middleware/validate";
import { createOutletSalesSchema, createSalesSchema } from "../schemas/sales";

const router = Router();

// Get all sales for the user's outlet
router.get("/", requireAuth, async (req, res, next) => {
  try {
    // Ensure user has an outlet assigned, unless they have a role that allows wider access
    if (!req.user!.outletId && req.user!.role === "manager") {
      return res.status(403).json({ message: "User not assigned to an outlet" });
    }
    const sales = await DailySales.find({
      companyId: req.user!.companyId,
      outletId: req.user!.outletId,
    }).sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    next(error);
  }
});

// Create a new sales entry (for admins/managers)
router.post("/", requireAuth, validateBody(createSalesSchema), async (req, res, next) => {
  try {
    const {
      outletId,
      date,
      totalSales,
      billedPayments,
      actualPayments,
      actualCashInBox,
      evidenceImages,
      cashExpenses,
      cashWithdrawal,
    } = req.body;

    if (!isValidObjectId(outletId)) {
      return res.status(400).json({ message: "Invalid outlet ID" });
    }

    const existing = await DailySales.findOne({
      companyId: req.user!.companyId,
      outletId,
      date: new Date(date),
    });
    if (existing) {
      return res.status(409).json({ message: "Sales for this date already exists for the selected outlet." });
    }

    const record = await DailySales.create({
      companyId: req.user!.companyId,
      outletId,
      date,
      totalSales,
      billedPayments,
      actualPayments,
      actualCashInBox,
      evidenceImages,
      cashExpenses,
      cashWithdrawal,
      enteredBy: req.user!.userId,
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

// Create a new sales entry (for authenticated outlet staff)
router.post("/outlet", requireAuth, validateBody(createOutletSalesSchema), async (req, res, next) => {
  try {
    const {
      date,
      totalSales,
      billedPayments,
      actualPayments,
      actualCashInBox,
      enteredByName,
      evidenceImages,
      cashExpenses,
      cashWithdrawal,
    } = req.body;

    const outletId = req.user!.outletId;
    if (!outletId) {
      return res.status(403).json({ message: "Authentication token is missing an outlet ID." });
    }

    const existing = await DailySales.findOne({
      companyId: req.user!.companyId,
      outletId,
      date: new Date(date),
    });
    if (existing) {
      return res.status(409).json({ message: "Sales for this date already exist for your outlet." });
    }

    const record = await DailySales.create({
      companyId: req.user!.companyId,
      outletId,
      date,
      totalSales,
      billedPayments,
      actualPayments,
      actualCashInBox,
      enteredByName,
      evidenceImages,
      cashExpenses,
      cashWithdrawal,
      enteredBy: req.user!.userId, // Still useful to know which user account submitted it
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});


export default router;
