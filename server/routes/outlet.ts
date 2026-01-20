import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { Outlet } from "../models/Outlet";
import { DailySales } from "../models/DailySales";
import bcrypt from "bcrypt";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { outletId, password, deviceId } = req.body;

    if (!outletId || !password || !deviceId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const outlet = await Outlet.findOne({ outletId: outletId }).select(
      "+passwordHash"
    );

    if (!outlet) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, outlet.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // You might want to generate a proper token here
    const token = `dummy-token-for-${outletId}`;

    res.json({ token, outlet });
  } catch (error) {
    next(error);
  }
});

router.use(requireAuth);

router.post("/sales", async (req, res, next) => {
    try {
        const { date, totalSales, payments, actualCash, enteredByName } = req.body;
        const today = new Date().toISOString().slice(0, 10);

        if (date !== today && req.user.role !== 'manager' && req.user.role !== 'admin') {
            return res.status(400).json({ message: "You can only submit sales for the current date." });
        }

        const outletId = req.user.outletId;

        const sales = new DailySales({
            date,
            totalSales,
            payments,
            actualCash,
            enteredByName,
            outletId,
            companyId: req.user.companyId,
        });

        await sales.save();

        res.status(201).json({ message: "Sales data saved successfully" });
    } catch (error) {
        next(error);
    }
});

router.get("/dashboard", async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "manager") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const outlet = await Outlet.findOne({
      _id: req.user.outletId,
      companyId: req.user.companyId,
    }).lean();

    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found" });
    }

    res.json(outlet);
  } catch (error) {
    next(error);
  }
});

export default router;
