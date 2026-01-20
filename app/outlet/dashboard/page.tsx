'use client';

import { useRouter } from 'next/navigation';

export default function OutletDashboard() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold mb-4">Outlet Dashboard</h1>
        <button
          onClick={() => router.push('/outlet/sales')}
          className="w-full rounded-md bg-black py-2 font-semibold text-white hover:bg-gray-800"
        >
          Enter Today's Sales
        </button>
      </div>
    </div>
  );
}
