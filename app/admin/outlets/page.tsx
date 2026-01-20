'use client';

import { useEffect, useState, useCallback } from 'react';
import NavBar from '@/components/NavBar';
import { Card } from '@/components/Card';
import { apiFetch } from '@/lib/api';
import { useAuthState } from '@/lib/useAuth';

type Outlet = {
  _id: string;
  name: string;
  outletId: string;
  city?: string;
  monthlyTarget: number;
  cashBox: number;
};

export default function AdminOutletsPage() {
  const { user } = useAuthState();
  const [items, setItems] = useState<Outlet[]>([]);
  const [companySalespersons, setCompanySalespersons] = useState<string[]>([]);
  const [newSalesperson, setNewSalesperson] = useState('');
  const [form, setForm] = useState({
    name: '',
    outletId: '',
    city: '',
    monthlyTarget: 0,
    cashBox: 0,
    password: '',
  });
  const [editingOutlet, setEditingOutlet] = useState<Outlet | null>(null);
  const [outletToDelete, setOutletToDelete] = useState<Outlet | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const isOwner = user?.role === 'owner';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const outlets = await apiFetch<Outlet[]>('/admin/outlets');
      setItems(outlets);
      if (isOwner) {
        const company = await apiFetch<{ salespersons: string[] }>(
          '/admin/company/salespersons'
        );
        setCompanySalespersons(company.salespersons || []);
      }
    } catch (err) {
        const error = err as Error
      setMessage(error.message || 'Failed to load data');
    }
    setLoading(false);
  }, [isOwner]);

  useEffect(() => {
    if (user) load();
  }, [user, isOwner, load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await apiFetch('/admin/outlets', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage('Outlet created');
      setForm({
        name: '',
        outletId: '',
        city: '',
        monthlyTarget: 0,
        cashBox: 0,
        password: '',
      });
      setShowCreateForm(false);
      await load();
    } catch (err) {
        const error = err as Error
      setMessage(error.message || 'Failed');
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
      const { _id, ...updateData } = editingOutlet;
      await apiFetch(`/admin/outlets/${_id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      setMessage('Outlet updated');
      setEditingOutlet(null);
      await load();
    } catch (err) {
        const error = err as Error
      setMessage(error.message || 'Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!outletToDelete) return;
    setMessage(null);
    try {
      await apiFetch(`/admin/outlets/${outletToDelete._id}`, {
        method: 'DELETE',
      });
      setMessage('Outlet deleted');
      setOutletToDelete(null);
      await load();
    } catch (err) {
        const error = err as Error
      setMessage(error.message || 'Failed to delete');
    }
  };

  const addSalesperson = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await apiFetch<{ salespersons: string[] }>(
        '/admin/company/salespersons',
        {
          method: 'POST',
          body: JSON.stringify({ salesperson: newSalesperson }),
        }
      );
      setMessage('Salesperson added');
      setCompanySalespersons(res.salespersons);
      setNewSalesperson('');
    } catch (err) {
        const error = err as Error
      setMessage(error.message || 'Failed to add salesperson');
    }
  };

  const removeSalesperson = async (salesperson: string) => {
    setMessage(null);
    try {
      const res = await apiFetch<{ salespersons: string[] }>(
        '/admin/company/salespersons',
        {
          method: 'DELETE',
          body: JSON.stringify({ salesperson }),
        }
      );
      setMessage('Salesperson removed');
      setCompanySalespersons(res.salespersons);
    } catch (err) {
        const error = err as Error
      setMessage(error.message || 'Failed to remove salesperson');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
        <Card>
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Outlets</h1>
            {isOwner && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                {showCreateForm ? 'Close' : '➕ Create Outlet'}
              </button>
            )}
          </div>

          {isOwner && showCreateForm && (
            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={create}>
              <input
                placeholder="Name"
                className="rounded-md border border-slate-200 px-3 py-2 text-black"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                placeholder="Outlet ID"
                className="rounded-md border border-slate-200 px-3 py-2 text-black"
                value={form.outletId}
                onChange={(e) => setForm({ ...form, outletId: e.target.value })}
                required
              />
              <input
                placeholder="City"
                className="rounded-md border border-slate-200 px-3 py-2 text-black sm:col-span-2"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
              <input
                type="number"
                placeholder="Monthly target"
                className="rounded-md border border-slate-200 px-3 py-2 text-black"
                value={form.monthlyTarget}
                onChange={(e) =>
                  setForm({ ...form, monthlyTarget: Number(e.target.value) })
                }
              />
              <input
                type="number"
                placeholder="Cash box"
                className="rounded-md border border-slate-200 px-3 py-2 text-black"
                value={form.cashBox}
                onChange={(e) =>
                  setForm({ ...form, cashBox: Number(e.target.value) })
                }
              />
              <input
                type="password"
                placeholder="Outlet password"
                className="rounded-md border border-slate-200 px-3 py-2 text-black"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button className="rounded-md bg-black py-2 font-semibold text-white sm:col-span-2">
                Create
              </button>
            </form>
          )}
          {message && <div className="mt-2 text-sm text-slate-600">{message}</div>}
          <div className="m-5 grid gap-3 sm:grid-cols-2">
            {loading && <div>Loading...</div>}
            {items.map((o) => (
              <Card key={o._id}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">{o.name}</div>
                    <div className="text-xs text-slate-500">ID: {o.outletId}</div>
                    <div className="text-xs text-slate-500">{o.city}</div>
                  </div>
                  <div className="text-right text-sm text-slate-600">
                    <div>Target ₹{o.monthlyTarget.toLocaleString()}</div>
                    <div>Cash box ₹{o.cashBox.toLocaleString()}</div>
                  </div>
                </div>
                {isOwner && (
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
                )}
              </Card>
            ))}
          </div>
        </Card>

        {isOwner && (
          <Card>
            <h1 className="text-lg font-semibold">Company Salespersons</h1>
            <form className="mt-3 flex gap-2" onSubmit={addSalesperson}>
              <input
                placeholder="New salesperson name"
                className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-black"
                value={newSalesperson}
                onChange={(e) => setNewSalesperson(e.target.value)}
                required
              />
              <button
                type="submit"
                className="rounded-md bg-black py-2 px-4 font-semibold text-white"
              >
                Add
              </button>
            </form>

            <div className="mt-4 space-y-2">
              {companySalespersons.map((name) => (
                <div
                  key={name}
                  className="flex items-center justify-between rounded-md border border-slate-200 p-2"
                >
                  <span>{name}</span>
                  <button
                    onClick={() => removeSalesperson(name)}
                    className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      {editingOutlet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Edit Outlet</h2>
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleUpdate}>
              <input
                placeholder="Name"
                className="rounded-md border border-slate-200 px-3 py-2 text-black"
                value={editingOutlet.name}
                onChange={(e) =>
                  setEditingOutlet({ ...editingOutlet, name: e.target.value })
                }
                required
              />
              <input
                placeholder="Outlet ID"
                className="rounded-md border border-slate-200 px-3 py-2 text-black"
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
                className="rounded-md border border-slate-200 px-3 py-2 text-black sm:col-span-2"
                value={editingOutlet.city}
                onChange={(e) =>
                  setEditingOutlet({ ...editingOutlet, city: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Monthly target"
                className="rounded-md border border-slate-200 px-3 py-2 text-black"
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
                className="rounded-md border border-slate-200 px-3 py-2 text-black"
                value={editingOutlet.cashBox}
                onChange={(e) =>
                  setEditingOutlet({
                    ...editingOutlet,
                    cashBox: Number(e.target.value),
                  })
                }
              />
              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setEditingOutlet(null)}
                  className="flex-1 rounded-md bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-black px-4 py-2 font-medium text-white hover:bg-gray-800"
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
            <h2 className="mb-2 text-lg font-semibold">Confirm Delete</h2>
            <p className="mb-4 text-slate-600">
              Are you sure you want to delete outlet “{outletToDelete.name}”?
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
