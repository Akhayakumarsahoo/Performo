import { Schema, Types, model } from "mongoose";

const IncentiveSlabSchema = new Schema(
  {
    percent: { type: Number, required: true },
    bonus: { type: Number, required: true },
  },
  { _id: false }
);

const OutletSchema = new Schema(
  {
    companyId: { type: Types.ObjectId, ref: "Company", required: true, index: true },
    name: { type: String, required: true },
    outletId: { type: String, required: true, unique: true },
    city: { type: String },
    // Authentication: password for outlet-level login (hashed)
    passwordHash: { type: String, required: true },
    // Optional: bind this outlet to a single device (first successful login)
    deviceId: { type: String },
    deviceBoundAt: { type: Date },
    monthlyTarget: { type: Number, default: 0 },
    cashBox: { type: Number, default: 0 },
    incentiveSlabs: { type: [IncentiveSlabSchema], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

OutletSchema.index({ companyId: 1, name: 1 }, { unique: true });

export const Outlet = model("Outlet", OutletSchema);
