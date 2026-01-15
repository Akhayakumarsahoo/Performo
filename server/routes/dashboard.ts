import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { computeOutletStats } from "../services/performance";
import { DailySales } from "../models/DailySales";
import { Outlet } from "../models/Outlet";

const router = Router();

router.use(requireAuth);


router.get("/manager", async (req, res, next) => {
  try {
    // Owner sees all outlets in their company
    const outlets = await Outlet.find({ companyId: req.user!.companyId, active: true }).lean();
    const promises = outlets.map((outlet) => computeOutletStats(req.user!.companyId, outlet._id.toString()));
    const stats = (await Promise.all(promises)).filter(Boolean);
    const pendingApprovals = await DailySales.countDocuments({
      companyId: req.user!.companyId,
      approved: false,
    });
    res.json({ stats, pendingApprovals });
  } catch (error) {
    next(error);
  }
});

router.get("/admin", async (req, res, next) => {
  try {
    const outlets = await Outlet.find({ companyId: req.user!.companyId, active: true }).lean();
    const stats = (
      await Promise.all(outlets.map((o) => computeOutletStats(req.user!.companyId, o._id.toString())))
    ).filter(Boolean);
    const totals = stats.reduce(
      (acc, s: any) => {
        acc.target += s.target;
        acc.achieved += s.achieved;
        return acc;
      },
      { target: 0, achieved: 0 }
    );
    const percent = totals.target > 0 ? (totals.achieved / totals.target) * 100 : 0;
    res.json({ stats, totals: { ...totals, percent } });
  } catch (error) {
    next(error);
  }
});

router.get("/outlet/:outletId", async (req, res, next) => {
  try {
    const { outletId } = req.params;
    const outlet = await Outlet.findOne({ _id: outletId, companyId: req.user!.companyId }).lean();
    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found" });
    }
    const sales = await DailySales.find({ outletId, companyId: req.user!.companyId }).sort({ date: -1 }).lean();
    const stats = await computeOutletStats(req.user!.companyId, outletId);
    res.json({ outlet, sales, stats });
  } catch (error) {
    next(error);
  }
});

export default router;
