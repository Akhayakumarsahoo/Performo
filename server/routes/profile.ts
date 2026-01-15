import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { User } from "../models/User";
import { Company } from "../models/Company";

const router = Router();

router.use(requireAuth);

router.put("/", async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: { name } },
      { new: true }
    ).lean();
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.put("/company", async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Company name is required" });
    }
    const company = await Company.findByIdAndUpdate(
      req.user!.companyId,
      { $set: { name } },
      { new: true }
    ).lean();
    res.json(company);
  } catch (error) {
    next(error);
  }
});

export default router;
