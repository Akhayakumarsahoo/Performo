import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signupSchema = z.object({
  ownerName: z.string().min(1),
  email: z.string().email(),
  phoneNumber: z.string().min(10),
  password: z.string().min(6),
  companyName: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

// Login for outlet-level access (salespersons use outletId + password + deviceId)
export const outletLoginSchema = z.object({
  outletId: z.string().min(1),
  password: z.string().min(6),
  deviceId: z.string().min(6),
});
