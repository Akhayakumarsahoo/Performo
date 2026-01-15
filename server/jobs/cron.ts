import cron from "node-cron";
import { Company } from "../models/Company";
import { recomputeMonthlyPerformance } from "../services/performance";
import logger from "../utils/logger";

export function startCronJobs() {
  // Nightly recompute at 00:30
  cron.schedule("30 0 * * *", async () => {
    try {
      const companies = await Company.find().lean();
      for (const company of companies) {
        await recomputeMonthlyPerformance(company._id.toString());
      }
      logger.info("Nightly performance recompute done");
    } catch (error) {
      logger.error({ error }, "Cron nightly recompute failed");
    }
  });

  // Hourly lightweight refresh for alerts/forecast
  cron.schedule("0 * * * *", async () => {
    try {
      const companies = await Company.find().lean();
      for (const company of companies) {
        await recomputeMonthlyPerformance(company._id.toString());
      }
      logger.info("Hourly performance refresh done");
    } catch (error) {
      logger.error({ error }, "Cron hourly refresh failed");
    }
  });
}
