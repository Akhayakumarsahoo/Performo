import { Schema, Types, model } from "mongoose";

const CashTransactionSchema = new Schema(
  {
    companyId: { type: Types.ObjectId, ref: "Company", required: true, index: true },
    outletId: { type: Types.ObjectId, ref: "Outlet", required: true, index: true },
    type: { 
      type: String, 
      enum: ["sales_cash", "expense", "withdrawal"], 
      required: true 
    },
    amount: { type: Number, required: true }, // Positive for inflow, negative for outflow
    reason: { type: String, required: true },
    enteredBy: { type: String, required: true }, // Person who made the transaction
    date: { type: Date, required: true },
    relatedSalesId: { type: Types.ObjectId, ref: "DailySales" }, // Optional: link to sales record
    approved: { type: Boolean, default: false },
    approvedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

CashTransactionSchema.index({ companyId: 1, outletId: 1, date: -1 });
CashTransactionSchema.index({ type: 1, date: -1 });

export const CashTransaction = model("CashTransaction", CashTransactionSchema);