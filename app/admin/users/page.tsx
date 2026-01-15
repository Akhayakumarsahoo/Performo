"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/Card";
import { apiFetch } from "@/lib/api";
import { useRequireAuth } from "@/lib/useAuth";

export default function AdminUsersPage() {
  useRequireAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager",
  });
  const [message, setMessage] = useState<string | null>(null);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage("User created");
      setForm({ name: "", email: "", password: "", role: "manager" });
    } catch (err: any) {
      setMessage(err.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
        <Card>
          <h1 className="text-lg font-semibold">Create User</h1>
          <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={create}>
            <input
              placeholder="Name"
              className="rounded-md border border-slate-200 px-3 text-black py-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Email"
              type="email"
              className="rounded-md border border-slate-200 px-3 text-black py-2"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="rounded-md border text-black border-slate-200 px-3 py-2"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <select
              className="rounded-md border border-slate-200 px-3 text-black py-2"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="manager">Manager</option>
              <option value="owner">Owner</option>
            </select>
            <button className="rounded-md bg-emerald-500 py-2 text-white font-semibold sm:col-span-2">
              Create
            </button>
          </form>
          {message && (
            <div className="mt-2 text-sm text-slate-600">{message}</div>
          )}
        </Card>
      </main>
    </div>
  );
}