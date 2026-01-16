'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { Card } from '@/components/Card';
import { apiFetch } from '@/lib/api';
import { useRequireAuth } from '@/lib/useAuth';

type AdminResponse = {
  stats: any[];
  totals: { target: number; achieved: number; percent: number };
};

export default function AdminDashboard() {
  useRequireAuth(); // Redirects to login if not authenticated
  const [data, setData] = useState<AdminResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = startDate && endDate ? `/dashboard/admin?startDate=${startDate}&endDate=${endDate}` : '/dashboard/admin';
      const res = await apiFetch<AdminResponse>(url);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    if (startDate && endDate) {
      fetchData();
    }
  };

  if (error)
    return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-lg font-semibold">Admin Dashboard</h1>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                onClick={handleFilter}
                className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Filter
              </button>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="p-4">Loading...</div>
        ) : data && (
          <>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-500">Company total</div>
                  <div className="text-2xl font-semibold">
                    ₹{data.totals.achieved.toLocaleString()}
                  </div>
                </div>
<<<<<<< HEAD
                <div className="mt-2 flex gap-2 text-xs text-slate-600">
                  <span>Remaining: ₹{s.remainingTarget.toLocaleString()}</span>
                  <span>| Forecast: ₹{s.forecastedEnd.toLocaleString()}</span>
                </div>
                {s.achievedUnapproved > 0 && (
                  <div className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-600">
                        ⏳ Pending Approval:
                      </span>
                      <span className="font-medium text-amber-800">
                        ₹{s.achievedUnapproved.toLocaleString()}
                      </span>
                      <span className="text-amber-600">
                        ({s.pendingApprovals} entries)
                      </span>
                    </div>
=======
                <div className="text-right text-sm">
                  <div className="font-semibold">
                    {data.totals.percent.toFixed(1)}%
>>>>>>> 5c6876f53adf2680f847ed3f03d5ba330fba15c2
                  </div>
                  <div className="text-slate-500">
                    Target ₹{data.totals.target.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2">
              {data.stats.map((s: any) => (
                <Link href={`/dashboard/outlet/${s.outletId}`} key={s.outletId}>
                  <Card>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase text-slate-500">
                          {s.month}
                        </div>
                        <div className="text-lg font-semibold">{s.name}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-semibold">{s.percent.toFixed(1)}%</div>
                        <div className="text-slate-500">
                          ₹{s.achieved.toLocaleString()} / ₹
                          {s.target.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2 text-xs text-slate-600">
                      <span>Remaining: ₹{s.remainingTarget.toLocaleString()}</span>
                      <span>| Forecast: ₹{s.forecastedEnd.toLocaleString()}</span>
                    </div>
                    {s.achievedUnapproved > 0 && (
                      <div className="mt-2 rounded-md bg-amber-50 px-2 py-1 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-amber-600">⏳ Pending Approval:</span>
                          <span className="font-medium text-amber-800">
                            ₹{s.achievedUnapproved.toLocaleString()}
                          </span>
                          <span className="text-amber-600">({s.pendingApprovals} entries)</span>
                        </div>
                      </div>
                    )}
                    {s.alerts?.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-red-600">
                        {s.alerts.map((a: string) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}