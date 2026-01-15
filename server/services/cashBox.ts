import { Types } from "mongoose";
import { CashTransaction } from "../models/CashTransaction";
import { Outlet } from "../models/Outlet";

export interface CashTransactionData {
  companyId: string;
  outletId: string;
  type: "sales_cash" | "expense" | "withdrawal";
  amount: number;
  reason: string;
  enteredBy: string;
  date: Date;
  relatedSalesId?: string;
}

/**
 * Create a cash transaction and update outlet cash box balance
 */
export async function createCashTransaction(data: CashTransactionData) {
  const session = await CashTransaction.startSession();
  
  try {
    await session.withTransaction(async () => {
      // Create the transaction record
      const transaction = await CashTransaction.create([{
        companyId: data.companyId,
        outletId: data.outletId,
        type: data.type,
        amount: data.amount,
        reason: data.reason,
        enteredBy: data.enteredBy,
        date: data.date,
        relatedSalesId: data.relatedSalesId,
        approved: data.type === "sales_cash", // Auto-approve sales cash
      }], { session });

      // Update outlet cash box balance
      await updateCashBoxBalance(data.outletId, session);
      
      return transaction[0];
    });
  } finally {
    await session.endSession();
  }
}

/**
 * Calculate and update outlet cash box balance from all approved transactions
 */
export async function updateCashBoxBalance(outletId: string, session?: any) {
  // Calculate total from all approved transactions
  const result = await CashTransaction.aggregate([
    { 
      $match: { 
        outletId: new Types.ObjectId(outletId), 
        approved: true 
      } 
    },
    { 
      $group: { 
        _id: null, 
        total: { $sum: "$amount" } 
      } 
    }
  ]).session(session || null);

  const balance = result.length > 0 ? result[0].total : 0;
  
  // Update outlet cash box field
  await Outlet.updateOne(
    { _id: outletId },
    { cashBox: Math.max(0, balance) }, // Ensure non-negative
    { session }
  );
  
  return balance;
}

/**
 * Get current cash box balance for an outlet
 */
export async function getCashBoxBalance(outletId: string): Promise<number> {
  const outlet = await Outlet.findById(outletId).select('cashBox').lean();
  return outlet?.cashBox || 0;
}

/**
 * Get cash transactions for an outlet with pagination
 */
export async function getCashTransactions(
  outletId: string, 
  limit: number = 50, 
  offset: number = 0
) {
  const transactions = await CashTransaction.find({ outletId })
    .sort({ date: -1, createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .lean();

  const total = await CashTransaction.countDocuments({ outletId });
  
  return {
    transactions,
    total,
    hasMore: offset + limit < total
  };
}

/**
 * Validate if a cash withdrawal/expense would result in negative balance
 */
export async function validateCashTransaction(
  outletId: string, 
  amount: number, 
  type: "expense" | "withdrawal"
): Promise<{ valid: boolean; currentBalance: number; newBalance: number }> {
  const currentBalance = await getCashBoxBalance(outletId);
  const newBalance = currentBalance + amount; // amount should be negative for expenses/withdrawals
  
  return {
    valid: newBalance >= 0,
    currentBalance,
    newBalance: Math.max(0, newBalance)
  };
}