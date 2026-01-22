"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiBase } from "@/lib/api";
import { getOutletSession, clearOutletSession } from "@/lib/outlet";

interface OutletSalesPayload {
  date: string;
  totalSales: number;
  payments: {
    cash: number;
    upi: number;
    card: number;
    zomato: number;
    swiggy: number;
  };
  actualCash: number;
  enteredByName: string;
  cashExpenses?: number;
  cashWithdrawal?: number;
}

export default function OutletSalesPage() {
  const router = useRouter();
  const [date, setDate] = useState<string>("");
  const [totalSales, setTotalSales] = useState<number>(0);
  const [payments, setPayments] = useState({
    cash: 0,
    upi: 0,
    card: 0,
    zomato: 0,
    swiggy: 0,
  });
  const [actualCash, setActualCash] = useState<number>(0);
  const [enteredByName, setEnteredByName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [outletName, setOutletName] = useState<string>("");

  useEffect(() => {
    const session = getOutletSession();
    if (!session) {
      router.replace("/outlet/login");
      return;
    }
    setOutletName(session.outlet.name);
    // Set default date on mount to avoid SSR/client mismatch
    setDate(new Date().toISOString().slice(0, 10));
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const session = getOutletSession();
      if (!session) {
        router.replace("/outlet/login");
        return;
      }
      const payload: OutletSalesPayload = {
        date,
        totalSales,
        payments,
        actualCash,
        enteredByName,
      };
      const res = await fetch(`${apiBase()}/outlet/sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401 || res.status === 403) {
        clearOutletSession();
        router.replace("/outlet/login");
        return;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to submit");
      }
      setMessage("Sales report submitted.");
    } catch (err) {
      const error = err as Error;
      setMessage(error.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const sumPayments =
    payments.cash +
    payments.upi +
    payments.card +
    payments.zomato +
    payments.swiggy;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Outlet Sales Entry</h1>
            <p className="text-xs text-slate-500">
              Outlet:{" "}
              <span className="font-medium">{outletName || "Loading..."}</span>
            </p>
          </div>
          <button
            className="text-xs text-red-500 underline"
            type="button"
            onClick={() => {
              clearOutletSession();
              router.push("/outlet/login");
            }}
          >
            Logout
          </button>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-slate-600">
              Date
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 bg-slate-100"
                value={date}
                readOnly
              />
            </label>
            <label className="text-sm text-slate-600">
              Who entered this report?
              <input
                className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                placeholder="Salesperson name"
                value={enteredByName}
                onChange={(e) => setEnteredByName(e.target.value)}
                required
              />
            </label>
          </div>
          <label className="text-sm text-slate-600">
            Total Sales (₹)
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
              value={totalSales}
              onChange={(e) => setTotalSales(Number(e.target.value))}
              required
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {(["cash", "upi", "card", "zomato", "swiggy"] as const).map(
              (key) => (
                <label key={key} className="text-sm text-slate-600">
                  {key.toUpperCase()} (₹)
                  <input
                    type="number"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                    value={payments[key]}
                    onChange={(e) =>
                      setPayments({
                        ...payments,
                        [key]: Number(e.target.value),
                      })
                    }
                    required
                  />
                </label>
              )
            )}
          </div>
          <div className="text-xs text-slate-500">
            Sum: ₹{sumPayments.toLocaleString()} (must equal Total)
          </div>
          <label className="text-sm text-slate-600">
            Actual Cash (₹)
            <input
              type="number"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
              value={actualCash}
              onChange={(e) => setActualCash(Number(e.target.value))}
              required
            />
          </label>
          {message && (
            <div className="rounded-md bg-slate-100 px-3 py-2 text-sm">
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !enteredByName || totalSales !== sumPayments}
            className="w-full rounded-md bg-black py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
