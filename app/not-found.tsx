'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <h1 className="text-3xl font-bold text-slate-800">404 - Page Not Found</h1>
        <p className="mt-4 text-slate-500">
          The page you are looking for does not exist.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="rounded-md bg-black px-4 py-3 text-center font-semibold text-white transition hover:bg-gray-800"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
