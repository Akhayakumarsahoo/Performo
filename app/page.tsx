'use client';

import Link from 'next/link';
import { useRedirectIfAuthenticated } from '@/lib/useAuth';

export default function HomePage() {
  useRedirectIfAuthenticated();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-slate-800">Performo</h1>
        <p className="mt-2 text-center text-slate-500">Your sales performance tracker</p>
        <div className="mt-8 space-y-4">
          <Link
            href="/login"
            className="block w-full rounded-md bg-emerald-500 py-3 px-4 text-center font-semibold text-white transition hover:bg-emerald-600"
          >
            Login / Signup
          </Link>
          <Link
            href="/outlet/login"
            className="block w-full rounded-md bg-slate-200 py-3 px-4 text-center font-semibold text-slate-700 transition hover:bg-slate-300"
          >
            Login for Outlet
          </Link>
        </div>
      </div>
    </div>
  );
}
