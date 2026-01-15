import { z } from "zod";

const paymentsSchema = z.object({
  cash: z.number().min(0),
  upi: z.number().min(0),
  card: z.number().min(0),
});

export const createSalesSchema = z
  .object({
    outletId: z.string(),
    date: z.string().or(z.date()).transform((v) => new Date(v)),
    totalSales: z.number().min(0),
    payments: paymentsSchema,
    evidenceImages: z.array(z.string().url()).optional(),
    cashExpenses: z.number().min(0).optional(),
    cashWithdrawal: z.number().min(0).optional(),
  })
  .refine(
    (data) => data.totalSales === data.payments.cash + data.payments.upi + data.payments.card,
    { message: "cash+upi+card must equal totalSales", path: ["payments"] }
  );

// Schema for outlet-authenticated sales entry (outletId comes from token, not body)
export const createOutletSalesSchema = z
  .object({
    date: z.string().or(z.date()).transform((v) => new Date(v)),
    totalSales: z.number().min(0),
    payments: paymentsSchema,
    enteredByName: z.string().min(1),
    evidenceImages: z.array(z.string().url()).optional(),
    cashExpenses: z.number().min(0).optional(),
    cashWithdrawal: z.number().min(0).optional(),
  })
  .refine(
    (data) => data.totalSales === data.payments.cash + data.payments.upi + data.payments.card,
    { message: "cash+upi+card must equal totalSales", path: ["payments"] }
  );

export const approveSalesSchema = z.object({
  actualPayments: paymentsSchema.optional(),
  cashExpenses: z.number().min(0).optional(),
  cashWithdrawal: z.number().min(0).optional(),
  note: z.string().optional(),
});
