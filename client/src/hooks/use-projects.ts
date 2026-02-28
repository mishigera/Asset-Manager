import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { apiUrl } from "@/lib/apiBase";

export function useProjects() {
  return useQuery({
    queryKey: ["portfolio", "projects"],
    queryFn: async () => {
      const res = await fetch(apiUrl(buildUrl(api.projects.list.path)));
      if (!res.ok) {
        throw new Error("No se pudieron cargar los proyectos");
      }
      return api.projects.list.responses[200].parse(await res.json());
    },
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ["portfolio", "project", slug],
    queryFn: async () => {
      const res = await fetch(apiUrl(buildUrl(api.projects.get.path, { slug })));
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        throw new Error("No se pudo cargar el proyecto");
      }
      return api.projects.get.responses[200].parse(await res.json());
    },
    enabled: !!slug,
  });
}
