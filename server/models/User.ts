import { Schema, Types, model } from "mongoose";

const UserSchema = new Schema(
  {
    companyId: {
      type: Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String },
    active: { type: Boolean, default: true },
    role: { type: String, required: true, default: "manager" },
  },
  { timestamps: true }
);

UserSchema.index({ companyId: 1, email: 1 }, { unique: true });

export const User = model("User", UserSchema);
