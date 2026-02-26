import { useQuery } from "@tanstack/react-query";
import { portfolioProjects } from "@/data/portfolio";

export function useProjects() {
  return useQuery({
    queryKey: ["portfolio", "projects"],
    queryFn: async () => portfolioProjects,
  });
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: ["portfolio", "project", slug],
    queryFn: async () =>
      portfolioProjects.find((project) => project.slug === slug) ?? null,
    enabled: !!slug,
  });
}
