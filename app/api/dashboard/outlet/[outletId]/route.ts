
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Outlet from '@/server/models/Outlet';
import { DailySales } from '@/server/models/DailySales';

export async function GET(
  req: Request,
  { params }: { params: { outletId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== 'owner' && session.user.role !== 'manager')) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const outlet = await Outlet.findById(params.outletId);
  if (!outlet) {
    return NextResponse.json({ message: 'Outlet not found' }, { status: 404 });
  }

  const sales = await DailySales.find({
    outletId: params.outletId,
  }).sort({ date: -1 });

  const totalSales = sales.reduce((acc, s) => acc + s.totalSales, 0);
  const totalTransactions = sales.reduce((acc, s) => acc + s.totalTransactions, 0);
  const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;
  const targetAchieved = outlet.monthlyTarget > 0 ? (totalSales / outlet.monthlyTarget) * 100 : 0;

  const stats = {
    totalSales,
    totalTransactions,
    avgTransactionValue,
    monthlyTarget: outlet.monthlyTarget,
    targetAchieved,
  };

  return NextResponse.json({ outlet, sales, stats });
}
