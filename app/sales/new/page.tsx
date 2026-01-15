"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/Card";
import { apiFetch, getAuth } from "@/lib/api";
import { useRequireAuth } from "@/lib/useAuth";

type SignatureResp = {
  timestamp: number;
  folder: string;
  signature: string;
  apiKey: string;
  cloudName: string;
};

export default function NewSalePage() {
  useRequireAuth(); // Redirects to login if not authenticated
  const [outletId, setOutletId] = useState("");
  const [date, setDate] = useState<string>("");
  const [totalSales, setTotalSales] = useState<number>(0);
  const [payments, setPayments] = useState({ cash: 0, upi: 0, card: 0 });
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const auth = getAuth();

  useEffect(() => {
    if (!outletId && auth?.user.outletIds?.length) {
      setOutletId(auth.user.outletIds[0]);
    }
    if (!date) {
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [auth, outletId, date]);

  const uploadFile = async (file: File) => {
    const sig = await apiFetch<SignatureResp>("/uploads/signature");
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", sig.timestamp.toString());
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
      { method: "POST", body: form }
    );
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "Upload failed");
    return json.secure_url as string;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const body = {
        outletId,
        date,
        totalSales,
        payments,
        evidenceImages: evidenceUrls,
      };
      await apiFetch("/sales", { method: "POST", body: JSON.stringify(body) });
      setMessage("Submitted for approval");
    } catch (err: any) {
      setMessage(err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const sumPayments = payments.cash + payments.upi + payments.card;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto w-full max-w-3xl space-y-4 px-4 py-4">
        <Card>
          <h1 className="text-lg font-semibold">New Sales Entry</h1>
          <form className="mt-4 space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-slate-600">
                Outlet ID
                <input
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                  value={outletId}
                  onChange={(e) => setOutletId(e.target.value)}
                  required
                />
              </label>
              <label className="text-sm text-slate-600">
                Date
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
              {(["cash", "upi", "card"] as const).map((key) => (
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
              ))}
            </div>
            <div className="text-xs text-slate-500">
              Sum: ₹{sumPayments.toLocaleString()} (must equal Total)
            </div>
            <div>
              <label className="text-sm text-slate-600">
                Evidence (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 block w-full text-sm"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setLoading(true);
                  try {
                    const url = await uploadFile(file);
                    setEvidenceUrls((prev) => [...prev, url]);
                  } catch (err: any) {
                    setMessage(err.message);
                  } finally {
                    setLoading(false);
                  }
                }}
              />
              {evidenceUrls.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-emerald-600">
                  {evidenceUrls.map((u) => (
                    <span key={u} className="rounded bg-emerald-50 px-2 py-1">
                      Uploaded
                    </span>
                  ))}
                </div>
              )}
            </div>
            {message && (
              <div className="rounded-md bg-slate-100 px-3 py-2 text-sm">
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || totalSales !== sumPayments}
              className="w-full rounded-md bg-emerald-500 py-2 font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Submit"}
            </button>
          </form>
        </Card>
      </main>
    </div>
  );
}
