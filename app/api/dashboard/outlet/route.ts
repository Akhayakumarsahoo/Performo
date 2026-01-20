
import { NextResponse } from 'next/server';
import { OutletStats } from '@/lib/dashboard';
import { DailySales } from '@/server/models/DailySales';
import { Company } from '@/server/models/Company';
import { auth } from '@/server/middleware/auth';
import { Outlet } from '@/server/models/Outlet';

export async function GET(req: Request) {
  try {
    const user = await auth(req);
    if (!user || user.role !== 'manager') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const outlet = await Outlet.findOne({
      _id: user.outletId,
      companyId: user.companyId,
    }).lean();

    if (!outlet) {
      return new NextResponse('Outlet not found', { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailySales = await DailySales.find({
      outletId: outlet._id,
      createdAt: { $gte: today },
    });

    const totalSales = dailySales.reduce((acc, sale) => acc + sale.totalSales, 0);
    const totalTransactions = dailySales.length;
    const avgTransactionValue = totalSales / totalTransactions || 0;

    // Calculate monthly progress
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlySales = await DailySales.aggregate([
      { $match: { outletId: outlet._id, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalSales' } } },
    ]);

    const company = await Company.findOne({ _id: user.companyId });
    if (!company) {
      return new NextResponse('Company not found', { status: 404 });
    }

    const monthlyProgress = (monthlySales[0]?.total / company.monthlyTarget) * 100 || 0;

    // Calculate performance (example: vs. last month)
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    const lastMonthSales = await DailySales.aggregate([
      { $match: { outletId: outlet._id, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$totalSales' } } },
    ]);

    const performance = lastMonthSales[0]?.total
      ? ((monthlySales[0]?.total - lastMonthSales[0]?.total) / lastMonthSales[0]?.total) * 100
      : 100;

    const stats: OutletStats = {
      totalSales: totalSales,
      totalTransactions: totalTransactions,
      avgTransactionValue: avgTransactionValue,
      todaySales: totalSales,
      monthlyProgress: monthlyProgress,
      performance: performance,
      monthlyTarget: company.monthlyTarget,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
