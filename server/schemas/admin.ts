import { z } from "zod";

export const incentiveSlabSchema = z.object({
  percent: z.number().min(0),
  bonus: z.number().min(0),
});

export const createOutletSchema = z.object({
  name: z.string().min(2),
  outletId: z.string().min(1),
  city: z.string().optional(),
  monthlyTarget: z.number().min(0).default(0),
  cashBox: z.number().min(0).default(0),
  incentiveSlabs: z.array(incentiveSlabSchema).default([]),
  // Password that admin sets for outlet-level login
  password: z.string().min(6),
});

export const updateOutletSchema = createOutletSchema.partial();

// No user creation schema needed since there's only one owner per company
