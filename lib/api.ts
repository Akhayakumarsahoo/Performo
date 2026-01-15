export type StoredUser = {
  id: string;
  name: string;
};

const STORAGE_KEY = "performo_auth";

type AuthState = {
  accessToken: string;
  refreshToken: string;
  user: StoredUser;
};

export function getAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAuth(auth: AuthState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function apiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000/v1";
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = getAuth();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (auth?.accessToken) headers.Authorization = `Bearer ${auth.accessToken}`;

  const res = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAuth();
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return (await res.json()) as T;
}
