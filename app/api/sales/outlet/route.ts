import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import DailySales from '@/models/DailySales';
import CashTransaction from '@/models/CashTransaction';
import Outlet from '@/models/Outlet';
import { createOutletSalesSchema } from '@/app/schemas/sales';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const validation = createOutletSalesSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ message: 'Invalid input', errors: validation.error.formErrors.fieldErrors }, { status: 400 });
  }

  const { date, totalSales, billedPayments, actualPayments, enteredByName, cashWithdrawal, withdrawnBy, cashExpenses, expenseReason, outletId } = validation.data;

  await dbConnect();

  const outlet = await Outlet.findById(outletId);
  if (!outlet) {
    return NextResponse.json({ message: 'Outlet not found' }, { status: 404 });
  }

  const sales = new DailySales({
    date,
    outletId,
    companyId: outlet.companyId,
    totalSales,
    billedPayments,
    actualPayments,
    enteredByName,
    totalTransactions: 0, // Placeholder, can be updated later
    approved: false, // Sales entered by salespeople are not auto-approved
  });

  await sales.save();

  // Create unapproved cash transactions
  if (cashWithdrawal && cashWithdrawal > 0) {
    const withdrawal = new CashTransaction({
      date,
      outletId,
      companyId: outlet.companyId,
      type: 'withdrawal',
      amount: cashWithdrawal,
      withdrawnBy: withdrawnBy,
      approved: false, // Mark as unapproved
    });
    await withdrawal.save();
  }

  if (cashExpenses && cashExpenses > 0) {
    const expense = new CashTransaction({
      date,
      outletId,
      companyId: outlet.companyId,
      type: 'expense',
      amount: cashExpenses,
      reason: expenseReason,
      approved: false, // Mark as unapproved
    });
    await expense.save();
  }
  
  // Update cash in hand only with approved transactions
  const outletToUpdate = await Outlet.findById(outletId);
  if (outletToUpdate) {
    const approvedCashTransactions = await CashTransaction.find({ outletId: outletId, approved: true });
    const totalApprovedCash = approvedCashTransactions.reduce((acc, t) => {
        if (t.type === 'sales_cash') return acc + t.amount;
        if (t.type === 'expense' || t.type === 'withdrawal') return acc - t.amount;
        return acc;
    }, 0);
    outletToUpdate.cashInHand = totalApprovedCash;
    await outletToUpdate.save();
  }

  return NextResponse.json({ message: 'Sales data submitted successfully' });
}
