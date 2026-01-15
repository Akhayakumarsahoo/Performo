"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/api";
import { roleToDefaultPath } from "@/lib/useAuth";

export default function DashboardRouter() {
  const router = useRouter();
  useEffect(() => {
    const auth = getAuth();
    router.replace(roleToDefaultPath(auth?.user.role));
  }, [router]);
  return null;
}
