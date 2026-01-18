import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { DailySales } from "../models/DailySales";
import { isValidObjectId } from "mongoose";

const router = Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const sales = await DailySales.find({
      companyId: req.user!.companyId,
      outletId: req.user!.outletId,
    }).sort({ date: -1 });
    res.json(sales);
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const {
      outletId,
      date,
      totalSales,
      payments,
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
      date,
    });
    if (existing)
      return res.status(409).json({ message: "Sales for this date already exists" });

    const record = await DailySales.create({
      companyId: req.user!.companyId,
      outletId,
      date,
      totalSales,
      payments,
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

export default router;
