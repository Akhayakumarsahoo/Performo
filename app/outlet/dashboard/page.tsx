'use client';

import { useEffect, useState } from 'react';
import { SalesEntry } from './SalesEntry';
import { OutletStats } from '@/lib/dashboard';
import { IDailySales } from '@/lib/definitions';

export default function Dashboard() {
  const [sales, setSales] = useState<IDailySales[]>([]);
  const [stats, setStats] = useState<OutletStats>({
    totalSales: 0,
    totalTransactions: 0,
    avgTransactionValue: 0,
    todaySales: 0,
    monthlyProgress: 0,
    performance: 0,
    monthlyTarget: 0,
  });

  useEffect(() => {
    fetch('/api/sales')
      .then((res) => res.json())
      .then((data) => setSales(data));

    fetch('/api/dashboard/outlet')
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, [sales]);

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-4'>Outlet Dashboard</h1>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
        <div className='bg-white p-4 rounded-lg shadow'>
          <h2 className='text-xl font-bold mb-2'>Today's Sales</h2>
          <p className='text-4xl font-bold'>${stats.todaySales.toFixed(2)}</p>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <h2 className='text-xl font-bold mb-2'>Monthly Progress</h2>
          <div className='w-full bg-gray-200 rounded-full h-4'>
            <div
              className='bg-blue-500 h-4 rounded-full'
              style={{ width: `${stats.monthlyProgress}%` }}
            ></div>
          </div>
          <p className='text-right text-sm mt-1'>
            {stats.monthlyProgress}% of ${stats.monthlyTarget} target
          </p>
        </div>
        <div className='bg-white p-4 rounded-lg shadow'>
          <h2 className='text-xl font-bold mb-2'>Performance</h2>
          <p className='text-green-500 font-bold'>
            +{stats.performance}% from last month
          </p>
        </div>
      </div>

      <div>
        <h2 className='text-2xl font-bold mb-4'>Previous Sales</h2>
        <div className='space-y-4'>
          {sales.map((sale: IDailySales) => (
            <SalesEntry key={sale._id} sale={sale} />
          ))}
        </div>
      </div>
    </div>
  );
}
