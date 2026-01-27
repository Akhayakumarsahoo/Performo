
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Outlet from '../../../../server/models/Outlet';
import DailySales from '../../../../server/models/DailySales';
import CashTransaction from '../../../../server/models/CashTransaction';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const outletId = searchParams.get('outletId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!outletId || !startDate || !endDate) {
    return NextResponse.json({ message: 'Missing required parameters' }, { status: 400 });
  }

  await dbConnect();

  const outlet = await Outlet.findById(outletId);
  if (!outlet) {
    return NextResponse.json({ message: 'Outlet not found' }, { status: 404 });
  }

  const sales = await DailySales.find({
    outletId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).sort({ date: -1 });

  const cashTransactions = await CashTransaction.find({
    outletId,
    date: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).sort({ date: -1 });

  const stats = {
    totalSales: sales.reduce((acc, s) => acc + s.totalSales, 0),
    cashInHand: outlet.cashInHand,
    totalExpenses: cashTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
    totalWithdrawals: cashTransactions.filter(t => t.type === 'withdrawal').reduce((acc, t) => acc + t.amount, 0),
  };

  return NextResponse.json({ outlet, sales, cashTransactions, stats });
}
