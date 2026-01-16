'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiBase } from '@/lib/api';
import { getOrCreateDeviceId, getOutletSession, setOutletSession } from '@/lib/outlet';

interface OutletLoginResponse {
  token: string;
  outlet: {
    id: string;
    name: string;
    city?: string | null;
  };
}

export default function OutletLoginPage() {
  const router = useRouter();
  const [outletId, setOutletId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in as outlet, go directly to sales page
  useEffect(() => {
    const session = getOutletSession();
    if (session) {
      router.replace('/outlet/sales');
    }
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const deviceId = getOrCreateDeviceId();
      const res = await fetch(`${apiBase()}/outlet/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ outletId, password, deviceId }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Login failed');
      }
      const data = (await res.json()) as OutletLoginResponse;
      setOutletSession({ token: data.token, outlet: data.outlet });
      router.push('/outlet/sales');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/10 p-6 shadow-lg backdrop-blur">
        <h1 className="text-2xl font-semibold mb-2">Outlet Login</h1>
        <p className="text-sm text-slate-200 mb-6">
          Salespersons log in with Outlet ID and Outlet Password only.
        </p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-slate-200">Outlet ID</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={outletId}
              onChange={(e) => setOutletId(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-200">Outlet Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-300">
          This login is only for outlet devices. Admin users should continue using the normal login page.
        </p>
      </div>
    </div>
  );
}
