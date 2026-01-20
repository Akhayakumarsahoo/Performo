import { Schema, Types, model } from "mongoose";

const PaymentSchema = new Schema({
    cash: { type: Number, required: true, min: 0, default: 0 },
    upi: { type: Number, required: true, min: 0, default: 0 },
    card: { type: Number, required: true, min: 0, default: 0 },
    zomato: { type: Number, required: true, min: 0, default: 0 },
    swiggy: { type: Number, required: true, min: 0, default: 0 },
}, { _id: false });

const DailySalesSchema = new Schema(
  {
    companyId: { type: Types.ObjectId, ref: "Company", required: true, index: true },
    outletId: { type: Types.ObjectId, ref: "Outlet", required: true, index: true },
    date: { type: Date, required: true },
    totalSales: { type: Number, required: true, min: 0 },
    payments: { type: PaymentSchema, required: true },
    actualCash: { type: Number, required: true, min: 0 },
    cashExpenses: { type: Number, default: 0, min: 0 },
    cashWithdrawal: { type: Number, default: 0, min: 0 },
    enteredBy: { type: Types.ObjectId, ref: "User" },
    enteredByName: { type: String },
    approvedBy: { type: Types.ObjectId, ref: "User" },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DailySalesSchema.index({ companyId: 1, outletId: 1, date: 1 }, { unique: true });

export const DailySales = model("DailySales", DailySalesSchema);
