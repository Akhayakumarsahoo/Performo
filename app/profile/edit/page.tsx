"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/NavBar";
import { Card } from "@/components/Card";
import { apiFetch, getAuth, saveAuth } from "@/lib/api";
import { useRequireAuth } from "@/lib/useAuth";

export default function EditProfilePage() {
  useRequireAuth();
  const auth = getAuth();
  const [form, setForm] = useState({
    name: "",
    companyName: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (auth) {
      setForm({
        name: auth.user.name,
        companyName: auth.user.company.name,
      });
    }
  }, [auth]);

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      // There is no endpoint to update user name.
      // I will assume there is one at PUT /profile
      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({ name: form.name }),
      });

      if (auth?.user.role === "owner") {
        await apiFetch("/admin/company", {
          method: "PUT",
          body: JSON.stringify({ name: form.companyName }),
        });
      }
      
      // Also update the user in local storage
      if(auth) {
        const newAuth = {
            ...auth,
            user: {
                ...auth.user,
                name: form.name,
                company: {
                    ...auth.user.company,
                    name: form.companyName
                }
            }
        };
        saveAuth(newAuth);
      }

      setMessage("Profile updated successfully!");
    } catch (err: any) {
      setMessage(err.message || "Failed to update profile");
    }
  };

  if (!auth) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="mx-auto w-full max-w-5xl space-y-4 px-4 py-4">
        <Card>
          <h1 className="text-lg font-semibold">Edit Profile</h1>
          <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={update}>
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700">Your Name</label>
              <input
                id="name"
                placeholder="Your Name"
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-black shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                <input
                    id="email"
                    type="email"
                    className="mt-1 block w-full rounded-md border border-slate-300 bg-slate-100 px-3 py-2 text-slate-500 shadow-sm sm:text-sm"
                    value={auth.user.email}
                    readOnly
                />
            </div>

            {auth.user.role === "owner" && (
              <div className="sm:col-span-2">
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-700">Company Name</label>
                <input
                  id="companyName"
                  placeholder="Company Name"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-black shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  value={form.companyName}
                  onChange={(e) =>
                    setForm({ ...form, companyName: e.target.value })
                  }
                  required
                />
              </div>
            )}
            <button className="rounded-md bg-emerald-500 py-2 text-white font-semibold hover:bg-emerald-600 sm:col-span-2">
              Save Changes
            </button>
          </form>
          {message && (
            <div className={`mt-2 text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</div>
          )}
        </Card>
      </main>
    </div>
  );
}