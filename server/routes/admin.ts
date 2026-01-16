import { Router } from "express";
import { requireAuth, requireOwnerAuth } from "../middleware/auth";
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

router.post("/company/salespersons", requireOwnerAuth, async (req, res, next) => {
  try {
    const { salesperson } = req.body as { salesperson?: string };
    if (!salesperson) {
      return res.status(400).json({ message: "salesperson is required" });
    }
    const company = await Company.findOneAndUpdate(
      { _id: req.user!.companyId },
      { $addToSet: { salespersons: salesperson } },
      { new: true }
    ).lean();
    if (!company) return res.status(404).json({ message: "Company not found" });
    res.json({ salespersons: company.salespersons || [] });
  } catch (error) {
    next(error);
  }
});

router.delete("/company/salespersons", requireOwnerAuth, async (req, res, next) => {
  try {
    const { salesperson } = req.body as { salesperson?: string };
    if (!salesperson) {
      return res.status(400).json({ message: "salesperson is required" });
    }
    const company = await Company.findOneAndUpdate(
      { _id: req.user!.companyId },
      { $pull: { salespersons: salesperson } },
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
  requireOwnerAuth,
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
  requireOwnerAuth,
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

router.delete("/outlets/:id", requireOwnerAuth, async (req, res, next) => {
  try {
    const outlet = await Outlet.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user!.companyId,
    });
    if (!outlet) {
      return res.status(404).json({ message: "Outlet not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post("/users", requireOwnerAuth, async (req, res, next) => {
  try {
    const { password, role, ...rest } = req.body;
    if (role === 'owner') {
      return res.status(403).json({ message: 'Cannot create owner user' });
    }
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      ...rest,
      role,
      passwordHash,
      companyId: req.user!.companyId,
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

router.get("/users", requireOwnerAuth, async (req, res, next) => {
  try {
    const users = await User.find({ companyId: req.user!.companyId }).lean();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;
