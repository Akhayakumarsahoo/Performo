import { Schema, Types, model } from "mongoose";

// Sub-schema for online payment providers
const OnlinePaymentsSchema = new Schema(
  {
    zomato: { type: Number, required: true, min: 0, default: 0 },
    swiggy: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

// Main payment schema that includes all payment methods
const DetailedPaymentSchema = new Schema(
  {
    cash: { type: Number, required: true, min: 0, default: 0 },
    upi: { type: Number, required: true, min: 0, default: 0 },
    card: { type: Number, required: true, min: 0, default: 0 },
    online: { type: OnlinePaymentsSchema, default: {} },
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
    totalSales: { type: Number, required: true, min: 0 }, // From billing system like Petpooja
    billedPayments: { type: DetailedPaymentSchema, required: true }, // As per billing system
    actualPayments: { type: DetailedPaymentSchema, required: true }, // As per actual closing
    actualCashInBox: { type: Number, required: true, min: 0 }, // Physical cash in cashbox
    cashExpenses: { type: Number, default: 0, min: 0 },
    cashWithdrawal: { type: Number, default: 0, min: 0 },
    enteredBy: { type: Types.ObjectId, ref: "User" },
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
