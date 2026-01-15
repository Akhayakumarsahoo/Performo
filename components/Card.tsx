"use client";

import React from "react";

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">{children}</div>;
}

export function StatTile({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "green" | "amber" | "red";
}) {
  const color =
    accent === "green" ? "text-emerald-600" : accent === "amber" ? "text-amber-600" : accent === "red" ? "text-red-600" : "text-slate-800";
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
      {hint && <div className="text-xs text-slate-500">{hint}</div>}
    </div>
  );
}
