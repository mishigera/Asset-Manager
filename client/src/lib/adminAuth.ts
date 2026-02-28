import { apiUrl } from "@/lib/apiBase";

const ADMIN_TOKEN_KEY = "tfk_admin_token";

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function getAdminAuthHeaders(): HeadersInit {
  const token = getAdminToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function adminLogin(username: string, password: string): Promise<{ token: string }> {
  const res = await fetch(apiUrl("/api/admin/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("El servidor no respondió con JSON. Revisa la URL y que el backend esté en marcha.");
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Error al iniciar sesión");
  }
  return data;
}

export async function adminFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(apiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAdminAuthHeaders(),
      ...options.headers,
    },
  });
}
