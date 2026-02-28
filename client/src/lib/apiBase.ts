/**
 * Base URL para peticiones API (vacío = mismo origen).
 * En Docker + Traefik con subpath, define VITE_API_BASE en el build, ej: /app
 */
export function getApiBase(): string {
  return (import.meta.env.VITE_API_BASE as string) || "";
}

export function apiUrl(path: string): string {
  const base = getApiBase().replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}
