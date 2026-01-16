"use client";

import { useEffect, useState } from "react";
import { clearAuth, getAuth, setAuth, StoredUser } from "./api";
import { useRouter } from "next/navigation";

export function useAuthState() {
  const [user, setUser] = useState<StoredUser | null>(
    () => getAuth()?.user ?? null
  );
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = (auth: {
    accessToken: string;
    refreshToken: string;
    user: StoredUser;
  }) => {
    setAuth(auth);
    setUser(auth.user);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    router.push("/login");
  };

  return { user, setUser, loading, setLoading, login, logout };
}

export function useRequireAuth() {
  const { user } = useAuthState();
  const router = useRouter();
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);
  return user;
}

export function useRedirectIfAuthenticated() {
  const { user } = useAuthState();
  const router = useRouter();
  useEffect(() => {
    if (user) {
      router.replace(roleToDefaultPath());
    }
  }, [user, router]);
}

export function roleToDefaultPath() {
  // All owners go to admin dashboard since there's only one owner per company
  return "/dashboard";
}
