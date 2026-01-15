import { Schema, Types, model } from "mongoose";

const MonthlyPerformanceSchema = new Schema(
  {
    companyId: { type: Types.ObjectId, ref: "Company", required: true, index: true },
    outletId: { type: Types.ObjectId, ref: "Outlet", required: true, index: true },
    month: { type: String, required: true }, // format YYYY-MM
    target: { type: Number, default: 0 },
    achieved: { type: Number, default: 0 },
    percent: { type: Number, default: 0 },
    incentive: { type: Number, default: 0 },
    forecastedEnd: { type: Number, default: 0 },
    alerts: { type: [String], default: [] },
  },
  { timestamps: true }
);

MonthlyPerformanceSchema.index({ companyId: 1, outletId: 1, month: 1 }, { unique: true });

export const MonthlyPerformance = model("MonthlyPerformance", MonthlyPerformanceSchema);
