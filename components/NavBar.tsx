'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { clearAuth, getAuth } from '@/lib/api';

const ownerLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/admin/outlets', label: 'Outlets' },
  { href: '/approvals', label: 'Approvals' },
  { href: '/admin/users', label: 'Users' },
];

const managerLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/admin/outlets', label: 'Outlets' },
  { href: '/approvals', label: 'Approvals' },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = getAuth();
  const isOwner = auth?.user?.role === 'owner';
  const links = isOwner ? ownerLinks : managerLinks;
  const [showConfirm, setShowConfirm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  if (!auth) return null;

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <div className="text-lg font-semibold">Performo</div>
          <nav className="flex items-center gap-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1 font-medium ${
                  pathname === link.href
                    ? 'bg-black text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-md px-3 py-1 text-slate-600 hover:bg-slate-100"
              >
                <span>{auth?.user.name}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg">
                  <Link
                    href="/profile/edit"
                    className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Edit Profile
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowConfirm(true);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold">Confirm Logout</h2>
            <p className="mb-4 text-slate-600">
              Are you sure you want to logout?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-md bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 rounded-md bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
