"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/Card";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/lib/useAuth";

type ManagerResponse = { stats: any[]; pendingApprovals: number };

export default function ManagerDashboard() {
  useRequireAuth(); // Redirects to login if not authenticated
  const [data, setData] = useState<ManagerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<ManagerResponse>("/dashboard/manager");
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error || !data)
    return <div className="p-4 text-red-600">{error || "No data"}</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Pending approvals</div>
              <div className="text-2xl font-semibold">
                {data.pendingApprovals}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {data.stats.map((s: any) => (
            <Card key={s.outletId}>
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
                <span>| Req/day: ₹{s.requiredPerDay.toFixed(0)}</span>
              </div>
              {s.alerts?.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-red-600">
                  {s.alerts.map((a: string) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
