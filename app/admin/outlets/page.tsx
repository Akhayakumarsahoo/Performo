"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/Card";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";

type Outlet = {
  _id: string;
  name: string;
  outletId: string;
  city?: string;
  monthlyTarget: number;
  cashBox: number;
};

export default function AdminOutletsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Outlet[]>([]);
  const [companySalespersons, setCompanySalespersons] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    outletId: "",
    city: "",
    monthlyTarget: 0,
    cashBox: 0,
    password: "",
  });
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [outletToDelete, setOutletToDelete] = useState<Outlet | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isOwner = user?.role === "owner";

  const load = async () => {
    if (!isOwner) return;
    setLoading(true);
    const data = await apiFetch<Outlet[]>("/admin/outlets");
    const company = await apiFetch<{ salespersons: string[] }>(
      "/admin/company/salespersons"
    );
    setItems(data);
    setCompanySalespersons((company.salespersons || []).join(", "));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [isOwner]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await apiFetch("/admin/outlets", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setMessage("Outlet created");
      setForm({
        name: "",
        outletId: "",
        city: "",
        monthlyTarget: 0,
        cashBox: 0,
        password: "",
      });
      setShowCreateForm(false);
      await load();
    } catch (err: any) {
      setMessage(err.message || "Failed");
    }
  };

  const handleEdit = (outlet: Outlet) => {
    setEditingOutlet(outlet);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOutlet) return;
    setMessage(null);
    try {
      await apiFetch(`/admin/outlets/${editingOutlet._id}`, {
        method: "PATCH",
        body: JSON.stringify(editingOutlet),
      });
      setMessage("Outlet updated");
      setEditingOutlet(null);
      await load();
    } catch (err: any) {
      setMessage(err.message || "Failed");
    }
  };

  const handleDelete = async () => {
    if (!outletToDelete) return;
    setMessage(null);
    try {
      await apiFetch(`/admin/outlets/${outletToDelete._id}`, {
        method: "DELETE",
      });
      setMessage("Outlet deleted");
      setOutletToDelete(null);
      await load();
    } catch (err: any) {
      setMessage(err.message || "Failed");
    }
  };


  const saveCompanySalespersons = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const salespersons = companySalespersons
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await apiFetch("/admin/company/salespersons", {
        method: "PUT",
        body: JSON.stringify({ salespersons }),
      });
      setMessage("Salespersons updated");
    } catch (err: any) {
      setMessage(err.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
        {isOwner ? (
          <>
            <Card>
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold">Outlets</h1>

                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="rounded-md bg-emerald-500 px-4 py-2 text-white text-sm font-semibold hover:bg-emerald-600 transition"
                >
                  {showCreateForm ? "Close" : "➕ Create Outlet"}
                </button>
              </div>

              {showCreateForm && (
                <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={create}>
                  <input
                    placeholder="Name"
                    className="rounded-md border border-slate-200 px-3 text-black py-2"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                  <input
                    placeholder="Outlet ID"
                    className="rounded-md border border-slate-200 px-3 text-black py-2"
                    value={form.outletId}
                    onChange={(e) => setForm({ ...form, outletId: e.target.value })}
                    required
                  />
                  <input
                    placeholder="City"
                    className="rounded-md border border-slate-200 px-3 text-black py-2 sm:col-span-2"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Monthly target"
                    className="rounded-md border border-slate-200 px-3 text-black py-2"
                    value={form.monthlyTarget}
                    onChange={(e) =>
                      setForm({ ...form, monthlyTarget: Number(e.target.value) })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Cash box"
                    className="rounded-md border text-black border-slate-200 px-3 py-2"
                    value={form.cashBox}
                    onChange={(e) =>
                      setForm({ ...form, cashBox: Number(e.target.value) })
                    }
                  />
                  <input
                    type="password"
                    placeholder="Outlet password"
                    className="rounded-md border text-black border-slate-200 px-3 py-2"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                  />
                  <button className="rounded-md bg-emerald-500 py-2 text-white font-semibold sm:col-span-2">
                    Create
                  </button>
                </form>
              )}
              {message && (
                <div className="mt-2 text-sm text-slate-600">{message}</div>
              )}
              <div className="grid gap-3 sm:grid-cols-2 m-5">
                {loading && <div>Loading...</div>}
                {items.map((o) => (
                  <Card key={o._id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">{o.name}</div>
                        <div className="text-xs text-slate-500">
                          ID: {o.outletId}
                        </div>
                        <div className="text-xs text-slate-500">{o.city}</div>
                      </div>
                      <div className="text-right text-sm text-slate-600">
                        <div>Target ₹{o.monthlyTarget.toLocaleString()}</div>
                        <div>Cash box ₹{o.cashBox.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(o)}
                        className="flex-1 rounded-md bg-slate-200 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setOutletToDelete(o)}
                        className="flex-1 rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>

            <Card>
              <h1 className="text-lg font-semibold">Company salespersons</h1>
              <form className="mt-3 space-y-3" onSubmit={saveCompanySalespersons}>
                <textarea
                  placeholder="Salesperson names (comma-separated)"
                  className="w-full rounded-md border text-black border-slate-200 px-3 py-2"
                  value={companySalespersons}
                  onChange={(e) => setCompanySalespersons(e.target.value)}
                />
                <button className="rounded-md bg-emerald-500 py-2 px-4 text-white font-semibold">
                  Save
                </button>
              </form>
            </Card>
          </>
        ) : (
          <div className="text-center text-slate-500">You do not have permission to view this page.</div>
        )}
      </main>

      {editingOutlet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Edit Outlet</h2>
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleUpdate}>
              <input
                placeholder="Name"
                className="rounded-md border border-slate-200 px-3 text-black py-2"
                value={editingOutlet.name}
                onChange={(e) =>
                  setEditingOutlet({ ...editingOutlet, name: e.target.value })
                }
                required
              />
              <input
                placeholder="Outlet ID"
                className="rounded-md border border-slate-200 px-3 text-black py-2"
                value={editingOutlet.outletId}
                onChange={(e) =>
                  setEditingOutlet({
                    ...editingOutlet,
                    outletId: e.target.value,
                  })
                }
                required
              />
              <input
                placeholder="City"
                className="rounded-md border border-slate-200 px-3 text-black py-2 sm:col-span-2"
                value={editingOutlet.city}
                onChange={(e) =>
                  setEditingOutlet({ ...editingOutlet, city: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Monthly target"
                className="rounded-md border border-slate-200 px-3 text-black py-2"
                value={editingOutlet.monthlyTarget}
                onChange={(e) =>
                  setEditingOutlet({
                    ...editingOutlet,
                    monthlyTarget: Number(e.target.value),
                  })
                }
              />
              <input
                type="number"
                placeholder="Cash box"
                className="rounded-md border text-black border-slate-200 px-3 py-2"
                value={editingOutlet.cashBox}
                onChange={(e) =>
                  setEditingOutlet({
                    ...editingOutlet,
                    cashBox: Number(e.target.value),
                  })
                }
              />
              <div className="sm:col-span-2 flex gap-3">
                 <button
                  type="button"
                  onClick={() => setEditingOutlet(null)}
                  className="flex-1 rounded-md bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-emerald-500 px-4 py-2 font-medium text-white hover:bg-emerald-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {outletToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Confirm Delete</h2>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete outlet "{outletToDelete.name}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setOutletToDelete(null)}
                className="flex-1 rounded-md bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-md bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
