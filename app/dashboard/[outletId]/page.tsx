'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
import { IOutlet, IDailySales } from '@/lib/definitions';
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

type Stats = {
  totalSales: number;
  totalTransactions: number;
  avgTransactionValue: number;
  monthlyTarget: number;
  targetAchieved: number;
};

const OutletPage = () => {
  const { outletId } = useParams();
  const [outlet, setOutlet] = useState<IOutlet | null>(null);
  const [sales, setSales] = useState<IDailySales[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useAuthState();

  useEffect(() => {
    const fetchOutletData = async () => {
      try {
        const { data } = await apiClient.get<{outlet: IOutlet, sales: IDailySales[], stats: Stats}>(`/dashboard/outlet/${outletId}`);
        setOutlet(data.outlet);
        setSales(data.sales);
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching outlet data:', error as Error);
      } finally {
        setLoading(false);
      }
    };

    if (outletId) {
      fetchOutletData();
    }
  }, [outletId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!outlet) {
    return <div>Outlet not found</div>;
  }

  const chartData = {
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
      <h1 className="text-2xl font-bold mb-4">{outlet.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card title="Total Sales" value={stats?.totalSales} />
        <Card title="Monthly Target" value={stats?.monthlyTarget} />
        <Card title="Target Achieved" value={`${stats?.targetAchieved.toFixed(2)}%`} />
        <Card
          title="Average Transaction Value"
          value={stats?.avgTransactionValue}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Sales Chart</h2>
        <Bar data={chartData} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Sales Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Total Sales</th>
                <th className="py-2 px-4 border-b">Total Transactions</th>
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
    </div>
  );
};

export default OutletPage;
