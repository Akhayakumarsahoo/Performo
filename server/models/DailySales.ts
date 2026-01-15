import { Schema, Types, model } from "mongoose";

const PaymentSchema = new Schema(
  {
    cash: { type: Number, required: true, min: 0 },
    upi: { type: Number, required: true, min: 0 },
    card: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OverrideSchema = new Schema(
  {
    reason: { type: String, required: true },
    by: { type: Types.ObjectId, ref: "User" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DailySalesSchema = new Schema(
  {
    companyId: { type: Types.ObjectId, ref: "Company", required: true, index: true },
    outletId: { type: Types.ObjectId, ref: "Outlet", required: true, index: true },
    date: { type: Date, required: true },
    totalSales: { type: Number, required: true, min: 0 },
    payments: { type: PaymentSchema, required: true },
    cashExpenses: { type: Number, default: 0, min: 0 },
    cashWithdrawal: { type: Number, default: 0, min: 0 },
    // For legacy user-based flows (admin/manager creating entries)
    enteredBy: { type: Types.ObjectId, ref: "User" },
    // For outlet-based flows where salesperson enters their name directly
    enteredByName: { type: String },
    approvedBy: { type: Types.ObjectId, ref: "User" },
    approved: { type: Boolean, default: false },
    evidenceImages: { type: [String], default: [] },
    overrides: { type: [OverrideSchema], default: [] },
  },
  { timestamps: true }
);

DailySalesSchema.index({ companyId: 1, outletId: 1, date: 1 }, { unique: true });

export const DailySales = model("DailySales", DailySalesSchema);
