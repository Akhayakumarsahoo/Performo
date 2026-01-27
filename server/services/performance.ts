import { Types } from "mongoose";
import { DailySales } from "../models/DailySales";
import { MonthlyPerformance } from "../models/MonthlyPerformance";
import { Outlet } from "../models/Outlet";
import { daysInMonth, getMonthKey, getMonthRange } from "../utils/date";

export type OutletStats = {
  outletId: string;
  name: string;
  month: string;
  target: number;
  achieved: number;
  achievedUnapproved: number;
  percent: number;
  incentive: number;
  forecastedEnd: number;
  remainingTarget: number;
  remainingDays: number;
  requiredPerDay: number;
  payments: { cash: number; upi: number; card: number };
  paymentsUnapproved: { cash: number; upi: number; card: number };
  alerts: string[];
  pendingApprovals: number;
};

function pickIncentive(percent: number, slabs: { percent: number; bonus: number }[]) {
  const sorted = [...slabs].sort((a, b) => a.percent - b.percent);
  let incentive = 0;
  for (const slab of sorted) {
    if (percent >= slab.percent) incentive = slab.bonus;
  }
  return incentive;
}

function evaluateAlerts(stats: OutletStats) {
  const alerts: string[] = [];
  const totalPayments = stats.payments.cash + stats.payments.upi + stats.payments.card;
  const cashRatio = totalPayments > 0 ? stats.payments.cash / totalPayments : 0;
  if (cashRatio > 0.6) alerts.push("Cash percentage unusually high");
  if (stats.percent < 80 && stats.remainingDays <= 10) alerts.push("Target at risk");
  if (stats.requiredPerDay > stats.target / daysInMonth()) alerts.push("Daily requirement above average");
  return alerts;
}

export async function getSalesReport(
  companyId: string,
  startDate: Date,
  endDate: Date
) {
  const sales = await DailySales.find({
    companyId,
    date: { $gte: startDate, $lte: endDate },
    approved: true,
  }).lean();

  const totalSales = sales.reduce((sum, s) => sum + s.totalSales, 0);
  const totalTransactions = sales.length;
  const avgTransactionValue = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const salesByDay = sales.reduce((acc, s) => {
    const date = s.date.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = { date, totalSales: 0, totalTransactions: 0 };
    }
    acc[date].totalSales += s.totalSales;
    acc[date].totalTransactions += 1;
    return acc;
  }, {} as Record<string, { date: string; totalSales: number; totalTransactions: number }>);

  return {
    totalSales,
    totalTransactions,
    avgTransactionValue,
    salesByDay: Object.values(salesByDay),
  };
}

export async function computeOutletStats(
  companyId: string,
  outletId: string,
  date: Date = new Date(),
  endDate?: Date
): Promise<OutletStats | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const outlet = (await Outlet.findOne({ _id: outletId, companyId })) as any;
  if (!outlet) return null;

  const { start, end } = getMonthRange(date);
  const monthKey = getMonthKey(date);

  const finalEndDate = endDate || end;

  // Get approved sales
  const approvedSales = await DailySales.find({
    companyId,
    outletId,
    approved: true,
    date: { $gte: start, $lte: finalEndDate },
  }).lean();

  // Get unapproved sales
  const unapprovedSales = await DailySales.find({
    companyId,
    outletId,
    approved: false,
    date: { $gte: start, $lte: finalEndDate },
  }).lean();

  const achieved = approvedSales.reduce((sum, s) => sum + (s.totalSales || 0), 0);
  const achievedUnapproved = unapprovedSales.reduce((sum, s) => sum + (s.totalSales || 0), 0);

  const payments = approvedSales.reduce(
    (acc, s) => ({
      cash: acc.cash + s.payments.cash,
      upi: acc.upi + s.payments.upi,
      card: acc.card + s.payments.card,
    }),
    { cash: 0, upi: 0, card: 0 }
  );

  const paymentsUnapproved = unapprovedSales.reduce(
    (acc, s) => ({
      cash: acc.cash + s.payments.cash,
      upi: acc.upi + s.payments.upi,
      card: acc.card + s.payments.card,
    }),
    { cash: 0, upi: 0, card: 0 }
  );

  const target = outlet.monthlyTarget || 0;
  const percent = target > 0 ? (achieved / target) * 100 : 0;
  const incentive = pickIncentive(percent, outlet.incentiveSlabs || []);

  const dayOfMonth = date.getDate();
  const dim = daysInMonth(date);
  const remainingDays = Math.max(dim - dayOfMonth, 0);
  const remainingTarget = Math.max(target - achieved, 0);
  const avgSoFar = dayOfMonth > 0 ? achieved / dayOfMonth : 0;
  const requiredPerDay = remainingDays > 0 ? remainingTarget / remainingDays : 0;
  const forecastedEnd = achieved + avgSoFar * remainingDays;

  const stats: OutletStats = {
    outletId,
    name: outlet.name,
    month: monthKey,
    target,
    achieved,
    achievedUnapproved,
    percent,
    incentive,
    forecastedEnd,
    remainingTarget,
    remainingDays,
    requiredPerDay,
    payments,
    paymentsUnapproved,
    alerts: [],
    pendingApprovals: unapprovedSales.length,
  };

  stats.alerts = evaluateAlerts(stats);
  return stats;
}

export async function recomputeMonthlyPerformance(companyId: string, date = new Date()) {
  const outlets = await Outlet.find({ companyId, active: true }).lean();
  const results: OutletStats[] = [];
  for (const outlet of outlets) {
    const stats = await computeOutletStats(companyId, outlet._id.toString(), date);
    if (stats) {
      await MonthlyPerformance.findOneAndUpdate(
        { companyId: new Types.ObjectId(companyId), outletId: outlet._id, month: stats.month },
        {
          $set: {
            target: stats.target,
            achieved: stats.achieved,
            percent: stats.percent,
            incentive: stats.incentive,
            forecastedEnd: stats.forecastedEnd,
            alerts: stats.alerts,
          },
        },
        { upsert: true, new: true }
      );
      results.push(stats);
    }
  }
  return results;
}
