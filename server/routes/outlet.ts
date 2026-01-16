import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { Outlet } from "../models/Outlet";

const router = Router();

router.use(requireAuth);

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
