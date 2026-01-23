'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { setAuth, useAuth } from '@/lib/auth';
import { User } from '@/lib/user';

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (auth?.user) {
      router.replace(auth.defaultPath);
    }
  }, [router, auth]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });
      setAuth(data);
      router.push(auth!.defaultPath);
    } catch (err) {
      setError(
        (err as { response?: { data?: { message: string } } })?.response?.data?.message ||
          'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">Performo Login</h1>
        <p className="text-sm text-slate-500 mb-6">
          Track sales, approvals, and incentives.
        </p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black py-2 font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-slate-600 hover:text-slate-900 underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
