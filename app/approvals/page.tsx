'use client';

import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { Card } from '@/components/Card';
import { apiFetch } from '@/lib/api';
import { useRequireAuth } from '@/lib/useAuth';

type Sale = {
  _id: string;
  outletId: string;
  date: string;
  totalSales: number;
  payments: { cash: number; upi: number; card: number };
  approved: boolean;
};

export default function ApprovalsPage() {
  useRequireAuth(); // Redirects to login if not authenticated
  const [items, setItems] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<Sale[]>('/sales');
      setItems(res.filter((s) => !s.approved));
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    setActionMessage(null);
    try {
      await apiFetch(`/sales/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      setActionMessage('Approved');
      await load();
    } catch (err: any) {
      setActionMessage(err.message || 'Failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
        <h1 className="text-lg font-semibold">Pending approvals</h1>
        {loading && <div>Loading...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {actionMessage && (
          <div className="rounded bg-slate-100 px-3 py-2 text-sm">
            {actionMessage}
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((s) => (
            <Card key={s._id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">
                    ₹{s.totalSales.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(s.date).toDateString()}
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div>Cash: ₹{s.payments.cash}</div>
                  <div>UPI: ₹{s.payments.upi}</div>
                  <div>Card: ₹{s.payments.card}</div>
                </div>
              </div>
              <button
                onClick={() => approve(s._id)}
                className="mt-3 w-full rounded-md bg-black py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Approve
              </button>
            </Card>
          ))}
        </div>
        {!loading && items.length === 0 && (
          <div className="text-sm text-slate-500">No pending approvals.</div>
        )}
      </main>
    </div>
  );
}
