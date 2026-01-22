'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAuthState } from '@/lib/useAuth';
import { IOutlet, IDailySales, ICashTransaction } from '@/lib/definitions';
import { Card } from '@/components/Card';
import apiClient from '@/lib/apiClient';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type DashboardData = {
  outlet: IOutlet;
  sales: IDailySales[];
  cashTransactions: ICashTransaction[];
  stats: {
    totalSales: number;
    cashInHand: number;
    totalExpenses: number;
    totalWithdrawals: number;
  };
};

const OutletDashboardPage = () => {
  const { user } = useAuthState();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.outletId) return;
      setLoading(true);
      try {
        const response = await apiClient.get<DashboardData>(
          `/outlet/dashboard?outletId=${user.outletId}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        );
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, dateRange]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const { outlet, sales, cashTransactions, stats } = data;

  const salesChartData = {
    labels: sales.map((s) => new Date(s.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Sales',
        data: sales.map((s) => s.totalSales),
        backgroundColor: 'rgba(128, 128, 128, 0.6)',
      },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{outlet.name} Dashboard</h1>
        <Link href="/outlet/sales">
          <a className="bg-black text-white px-4 py-2 rounded-md">Go to Sales Page</a>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card title="Total Sales" value={stats.totalSales} />
        <Card title="Cash in Hand" value={stats.cashInHand} />
        <Card title="Total Expenses" value={stats.totalExpenses} />
        <Card title="Total Withdrawals" value={stats.totalWithdrawals} />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Sales Chart</h2>
        <Bar data={salesChartData} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Daily Sales</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Total Sales</th>
                  <th className="py-2 px-4 border-b">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s._id}>
                    <td className="py-2 px-4 border-b">
                      {new Date(s.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b">{s.totalSales}</td>
                    <td className="py-2 px-4 border-b">{s.totalTransactions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Cash Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Type</th>
                  <th className="py-2 px-4 border-b">Amount</th>
                  <th className="py-2 px-4 border-b">Reason</th>
                </tr>
              </thead>
              <tbody>
                {cashTransactions.map((t) => (
                  <tr key={t._id}>
                    <td className="py-2 px-4 border-b">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-4 border-b">{t.type}</td>
                    <td className="py-2 px-4 border-b">{t.amount}</td>
                    <td className="py-2 px-4 border-b">{t.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutletDashboardPage;
