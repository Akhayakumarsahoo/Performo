"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/Card";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/lib/useAuth";

type Outlet = {
  _id: string;
  name: string;
  outletId: string;
  city?: string;
  monthlyTarget: number;
  cashBox: number;
};

export default function OutletDashboardPage() {
  useRequireAuth(); // Redirects to login if not authenticated
  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Outlet>("/outlet/dashboard");
      setOutlet(data);
    } catch (err: any) {
      setMessage(err.message || "Failed to load dashboard");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
        <h1 className="text-lg font-semibold">Outlet Dashboard</h1>
        {loading && <div>Loading...</div>}
        {message && <div className="text-red-500">{message}</div>}
        {outlet && (
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold">{outlet.name}</div>
                <div className="text-xs text-slate-500">ID: {outlet.outletId}</div>
                <div className="text-xs text-slate-500">{outlet.city}</div>
              </div>
              <div className="text-right text-sm text-slate-600">
                <div>Target ₹{outlet.monthlyTarget.toLocaleString()}</div>
                <div>Cash box ₹{outlet.cashBox.toLocaleString()}</div>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
