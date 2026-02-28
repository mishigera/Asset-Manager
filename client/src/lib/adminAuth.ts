import { apiUrl } from "@/lib/apiBase";

/**
 * Peticiones al panel admin (sin login; protege /tfkadmin en Traefik si quieres).
 */
export async function adminFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(apiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}
