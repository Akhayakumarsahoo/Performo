import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import cloudinary from "../config/cloudinary";

const router = Router();

router.use(requireAuth);

router.get("/signature", async (req, res, next) => {
  try {
    if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(500).json({ message: "Cloudinary not configured" });
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `performo/${req.user!.companyId}`;
    const paramsToSign = { timestamp, folder };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);
    res.json({ timestamp, folder, signature, apiKey: process.env.CLOUDINARY_API_KEY, cloudName: process.env.CLOUDINARY_CLOUD_NAME });
  } catch (error) {
    next(error);
  }
});

export default router;
