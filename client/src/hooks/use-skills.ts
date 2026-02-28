import { useQuery } from "@tanstack/react-query";
import type { Certification, Skill } from "@shared/schema";
import { api, buildUrl } from "@shared/routes";
import { apiUrl } from "@/lib/apiBase";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path));
  if (!res.ok) {
    throw new Error("No se pudieron cargar los datos");
  }
  return res.json() as Promise<T>;
}

export function useSkills() {
  return useQuery({
    queryKey: ["portfolio", "skills"],
    queryFn: () => fetchApi<Skill[]>(buildUrl(api.skills.list.path)),
  });
}

export function useCertifications() {
  return useQuery({
    queryKey: ["portfolio", "certifications"],
    queryFn: () =>
      fetchApi<Certification[]>(buildUrl(api.certifications.list.path)),
  });
}
