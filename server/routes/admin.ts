import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  createOutletSchema,
  updateOutletSchema,
} from "../schemas/admin";
import { Outlet } from "../models/Outlet";
import { Company } from "../models/Company";
import { User } from "../models/User";
import { hashPassword } from "../utils/password";

const router = Router();

router.use(requireAuth);
// Company-level salespersons
router.get("/company/salespersons", async (req, res, next) => {
  try {
    const company = await Company.findById(req.user!.companyId).lean();
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json({ salespersons: company.salespersons || [] });
  } catch (error) {
    next(error);
  }
});

router.put("/company/salespersons", async (req, res, next) => {
  try {
    const { salespersons } = req.body as { salespersons?: string[] };
    if (!Array.isArray(salespersons)) {
      return res.status(400).json({ message: "salespersons must be an array of strings" });
    }
    const company = await Company.findOneAndUpdate(
      { _id: req.user!.companyId },
      { $set: { salespersons } },
      { new: true }
    ).lean();
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json({ salespersons: company.salespersons || [] });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/outlets",
  validateBody(createOutletSchema),
  async (req, res, next) => {
    try {
      const { password, ...rest } = req.body as { password: string } & Record<string, unknown>;
      const passwordHash = await hashPassword(password);

      const outlet = await Outlet.create({
        ...rest,
        passwordHash,
        companyId: req.user!.companyId,
      });
      res.status(201).json(outlet);
    } catch (error) {
      next(error);
    }
  }
);

router.get("/outlets", async (req, res, next) => {
  try {
    const outlets = await Outlet.find({
      companyId: req.user!.companyId,
    }).lean();
    res.json(outlets);
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/outlets/:id",
  validateBody(updateOutletSchema),
  async (req, res, next) => {
    try {
      const { password, ...rest } = req.body as { password?: string } & Record<string, unknown>;
      const update: Record<string, unknown> = { ...rest };

      if (password) {
        update.passwordHash = await hashPassword(password);
      }

      const outlet = await Outlet.findOneAndUpdate(
        { _id: req.params.id, companyId: req.user!.companyId },
        { $set: update },
        { new: true }
      );
      if (!outlet) return res.status(404).json({ message: "Outlet not found" });
      res.json(outlet);
    } catch (error) {
      next(error);
    }
  }
);

// No user management routes needed since there's only one owner per company

export default router;
