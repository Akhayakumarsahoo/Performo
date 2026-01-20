'use client';

import { useEffect, useState, useCallback } from 'react';
import NavBar from '@/components/NavBar';
import { Card } from '@/components/Card';
import { apiFetch } from '@/lib/api';
import { useAuthState } from '@/lib/useAuth';

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminUsersPage() {
  const { user } = useAuthState();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isOwner = user?.role === 'owner';

  const load = useCallback(async () => {
    if (!isOwner) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<User[]>('/admin/users');
      setUsers(data);
    } catch (err) {
      const error = err as Error
      setMessage(error.message || 'Failed to load users');
    }
    setLoading(false);
  }, [isOwner]);

  useEffect(() => {
    if (isOwner) {
      load();
    }
  }, [isOwner]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setMessage('User created');
      setForm({ name: '', email: '', password: '', role: 'manager' });
      await load();
    } catch (err) {
      const error = err as Error
      setMessage(error.message || 'Failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
        {isOwner ? (
          <>
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
                </select>
                <button className="rounded-md bg-black py-2 text-white font-semibold sm:col-span-2">
                  Create
                </button>
              </form>
              {message && (
                <div className="mt-2 text-sm text-slate-600">{message}</div>
              )}
            </Card>

            <Card>
              <h1 className="text-lg font-semibold">Existing Users</h1>
              {loading && <div className="mt-2">Loading...</div>}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {users.map((user) => (
                  <div key={user._id} className="rounded-md border border-slate-200 p-4">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-sm text-slate-500">{user.email}</div>
                    <div className="text-sm text-slate-500">{user.role}</div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        ) : (
          <div className="text-center text-slate-500 pt-10">You do not have permission to view this page.</div>
        )}
      </main>
    </div>
  );
}
