import mongoose from "mongoose";
import env from "./env";
import logger from "../utils/logger";

export async function connectDB() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.MONGO_URI);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error({ error }, "MongoDB connection error");
    throw error;
  }
}
