import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import env from "./config/env";
import { connectDB } from "./config/db";
import routes from "./routes";
import { errorHandler } from "./middleware/error";
import logger from "./utils/logger";
import { startCronJobs } from "./jobs/cron";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",") : "*",
    credentials: true,
  })
);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/v1", routes);
app.use(errorHandler);

const port = Number(env.PORT || 4000);

connectDB()
  .then(() => {
    startCronJobs();
    app.listen(port, () => {
      logger.info(`API listening on port ${port}`);
    });
  })
  .catch((error) => {
    logger.error({ error }, "Failed to start API");
    process.exit(1);
  });
