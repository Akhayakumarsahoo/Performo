export type OutletSession = {
  token: string;
  outlet: {
    id: string;
    name: string;
    city?: string | null;
  };
};

const OUTLET_AUTH_KEY = "performo_outlet_auth";
const DEVICE_ID_KEY = "performo_outlet_device_id";

export function getOutletSession(): OutletSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(OUTLET_AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OutletSession;
  } catch {
    return null;
  }
}

export function setOutletSession(session: OutletSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(OUTLET_AUTH_KEY, JSON.stringify(session));
}

export function clearOutletSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(OUTLET_AUTH_KEY);
}

function createDeviceId() {
  if (typeof window === "undefined") return "";
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as Crypto).randomUUID();
  }
  return `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = createDeviceId();
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
