import { z } from "zod";

// A detailed payment schema including online options
const detailedPaymentsSchema = z.object({
  cash: z.number().min(0).default(0),
  upi: z.number().min(0).default(0),
  card: z.number().min(0).default(0),
  online: z.object({
    zomato: z.number().min(0).default(0),
    swiggy: z.number().min(0).default(0),
  }).default({ zomato: 0, swiggy: 0 }),
});

// Schema for sales creation by an admin or higher-level user
export const createSalesSchema = z
  .object({
    outletId: z.string(),
    date: z.string().or(z.date()).transform((v) => new Date(v)),
    totalSales: z.number().min(0), // Total sales from the billing system (e.g., Petpooja)
    billedPayments: detailedPaymentsSchema, // Payments as per the billing system
    actualPayments: detailedPaymentsSchema, // Actual payments received at closing
    actualCashInBox: z.number().min(0), // Physical cash counted in the cashbox
    evidenceImages: z.array(z.string().url()).optional(),
    cashExpenses: z.number().min(0).optional(),
    cashWithdrawal: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      const billedTotal =
        data.billedPayments.cash +
        data.billedPayments.upi +
        data.billedPayments.card +
        data.billedPayments.online.zomato +
        data.billedPayments.online.swiggy;
      // Use a small tolerance for potential floating point inaccuracies
      return Math.abs(data.totalSales - billedTotal) < 0.01;
    },
    {
      message: "The sum of all billed payment methods (cash, UPI, card, Zomato, Swiggy) must equal the Total Sales.",
      path: ["billedPayments"],
    }
  );

// Schema for sales creation by an authenticated outlet user
export const createOutletSalesSchema = z
  .object({
    date: z.string().or(z.date()).transform((v) => new Date(v)),
    totalSales: z.number().min(0),
    billedPayments: detailedPaymentsSchema,
    actualPayments: detailedPaymentsSchema,
    actualCashInBox: z.number().min(0),
    enteredByName: z.string().min(1),
    evidenceImages: z.array(z.string().url()).optional(),
    cashExpenses: z.number().min(0).optional(),
    cashWithdrawal: z.number().min(0).optional(),
  })
  .refine(
    (data) => {
      const billedTotal =
        data.billedPayments.cash +
        data.billedPayments.upi +
        data.billedPayments.card +
        data.billedPayments.online.zomato +
        data.billedPayments.online.swiggy;
      // Use a small tolerance for potential floating point inaccuracies
      return Math.abs(data.totalSales - billedTotal) < 0.01;
    },
    {
      message: "The sum of all billed payment methods (cash, UPI, card, Zomato, Swiggy) must equal the Total Sales.",
      path: ["billedPayments"],
    }
  );

// This schema may be used for a separate approval step if needed in the future,
// but for now, the primary sales entry includes all necessary fields.
export const approveSalesSchema = z.object({
  note: z.string().optional(),
});
