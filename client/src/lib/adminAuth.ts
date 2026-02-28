import { apiUrl } from "@/lib/apiBase";

const ADMIN_TOKEN_KEY = "admin_token";

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

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export async function adminLogin(username: string, password: string): Promise<void> {
  const response = await fetch(apiUrl("/api/admin/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || typeof payload?.token !== "string") {
    throw new Error(payload?.message || "No se pudo iniciar sesión");
  }

  setAdminToken(payload.token);
}

export async function checkAdminSession(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  const response = await fetch(apiUrl("/api/admin/session"), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    clearAdminToken();
    return false;
  }

  return true;
}

export async function adminFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAdminToken();
  const isFormData = options.body instanceof FormData;

  const baseHeaders: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (!isFormData) {
    baseHeaders["Content-Type"] = "application/json";
  }

  return fetch(apiUrl(path), {
    ...options,
    headers: {
      ...baseHeaders,
      ...options.headers,
    },
  });
}
