import { Router } from "express";
import authRoutes from "./auth";
import salesRoutes from "./sales";
import dashboardRoutes from "./dashboard";
import healthRoutes from "./health";
import adminRoutes from "./admin";
import uploadRoutes from "./uploads";
import outletRoutes from "./outlet";
import profileRoutes from "./profile";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/sales", salesRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/admin", adminRoutes);
router.use("/profile", profileRoutes);
// Outlet-level authentication and sales/performance APIs
router.use("/outlet", outletRoutes);
router.use("/uploads", uploadRoutes);

export default router;
