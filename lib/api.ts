import apiClient from "./apiClient";
import { getAuth } from "./auth";

export { getAuth };

export async function apiFetch<T>(url: string, options: any = {}): Promise<T> {
  const { method = "GET", ...rest } = options;
  const response = await apiClient({
    url,
    method,
    ...rest,
  });
  return response.data;
}
