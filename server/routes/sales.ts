import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { createSalesSchema, approveSalesSchema } from "../schemas/sales";
import { DailySales } from "../models/DailySales";
import { Outlet } from "../models/Outlet";
import { Types } from "mongoose";

const router = Router();

router.use(requireAuth);

router.post("/", validateBody(createSalesSchema), async (req, res, next) => {
  try {
    const { outletId, date, totalSales, payments, evidenceImages, cashExpenses = 0, cashWithdrawal = 0 } = req.body;

    // tenant and outlet scope check
    const outlet = await Outlet.findOne({ _id: outletId, companyId: req.user!.companyId });
    if (!outlet) return res.status(404).json({ message: "Outlet not found" });
    // Owner has access to all outlets in their company

    const existing = await DailySales.findOne({ companyId: req.user!.companyId, outletId, date });
    if (existing) return res.status(409).json({ message: "Sales for this date already exists" });

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

router.get("/", async (req, res, next) => {
  try {
    const { outletId, start, end } = req.query as { outletId?: string; start?: string; end?: string };
    const filter: Record<string, unknown> = { companyId: req.user!.companyId };
    if (outletId) filter.outletId = outletId;
    // Owner has access to all outlets in their company
    if (start || end) {
      filter.date = {};
      if (start) (filter.date as any).$gte = new Date(start);
      if (end) (filter.date as any).$lte = new Date(end);
    }
    const sales = await DailySales.find(filter).sort({ date: -1 }).lean();
    res.json(sales);
  } catch (error) {
    next(error);
  }
});

router.post("/:id/approve", validateBody(approveSalesSchema), async (req, res, next) => {
  try {
    const sales = await DailySales.findOne({ _id: req.params.id, companyId: req.user!.companyId });
    if (!sales) return res.status(404).json({ message: "Sales entry not found" });
    // Owner has access to all outlets in their company
    if (sales.approved) return res.status(400).json({ message: "Already approved" });

    const { actualPayments, cashExpenses, cashWithdrawal } = req.body;
    if (actualPayments) {
      const sum = actualPayments.cash + actualPayments.upi + actualPayments.card;
      if (sum !== sales.totalSales) {
        return res.status(400).json({ message: "Actual payments must equal totalSales" });
      }
      sales.payments = actualPayments;
    }
    if (cashExpenses !== undefined) sales.cashExpenses = cashExpenses;
    if (cashWithdrawal !== undefined) sales.cashWithdrawal = cashWithdrawal;

    sales.approved = true;
    sales.approvedBy = req.user!.userId as any;
    await sales.save();

    res.json(sales);
  } catch (error) {
    next(error);
  }
});

export default router;
