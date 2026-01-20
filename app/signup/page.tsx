'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, setAuth, getAuth } from '@/lib/api';
import { roleToDefaultPath } from '@/lib/useAuth';

type SignupResponse = {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
  };
};

export default function SignupPage() {
  const router = useRouter();
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    const auth = getAuth();
    if (auth?.user) {
      router.replace(roleToDefaultPath());
    }
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch<SignupResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ ownerName, email, phoneNumber, password, companyName }),
      });
      setAuth(data);
      router.push(roleToDefaultPath());
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-white/10 p-6 shadow-lg backdrop-blur">
        <h1 className="text-2xl font-semibold mb-2">Performo Signup</h1>
        <p className="text-sm text-slate-200 mb-6">
          Create your company account. You'll be set up as the admin.
        </p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-sm text-slate-200">Company Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-200">Owner Name</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-200">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-200">Phone Number</label>
            <input
              type="tel"
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-200">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="text-sm text-slate-200">Confirm Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
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
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-300">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-slate-400 hover:text-slate-300 underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
