import { Schema, model } from "mongoose";

const CompanySchema = new Schema(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    passwordHash: { type: String },
    plan: { type: String, default: "standard" },
    salespersons: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Company = model("Company", CompanySchema);
