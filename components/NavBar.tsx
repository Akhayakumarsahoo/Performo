"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearAuth, getAuth } from "@/lib/api";

// All owners have the same navigation links
const ownerLinks = [
  { href: "/dashboard/admin", label: "Dashboard" },
  { href: "/admin/outlets", label: "Outlets" },
  { href: "/approvals", label: "Approvals" },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = getAuth();
  const links = ownerLinks;
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
          <div className="text-lg font-semibold">Performo</div>
          <nav className="flex items-center gap-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1 font-medium ${
                  pathname === link.href
                    ? "bg-emerald-100 text-emerald-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => setShowConfirm(true)}
              className="rounded-md px-3 py-1 text-slate-600 hover:bg-slate-100"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-2">Confirm Logout</h2>
            <p className="text-slate-600 mb-4">Are you sure you want to logout?</p>
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
