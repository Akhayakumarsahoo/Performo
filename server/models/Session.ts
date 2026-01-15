import { Schema, Types, model } from "mongoose";

const SessionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    companyId: { type: Types.ObjectId, ref: "Company", required: true },
    token: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
    userAgent: { type: String },
  },
  { timestamps: true }
);

SessionSchema.index({ token: 1 }, { unique: true });

export const Session = model("Session", SessionSchema);
