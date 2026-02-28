import { useQuery } from "@tanstack/react-query";
import type { BlogPost } from "@shared/schema";
import { api, buildUrl } from "@shared/routes";

const API_BASE = "";

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(path.startsWith("http") ? path : `${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error("No se pudieron cargar los datos");
  }
  return res.json() as Promise<T>;
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ["portfolio", "blog"],
    queryFn: () => fetchApi<BlogPost[]>(buildUrl(api.blog.list.path)),
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["portfolio", "blog", slug],
    queryFn: async () => {
      const path = buildUrl(api.blog.get.path, { slug });
      const res = await fetch(path.startsWith("http") ? path : `${API_BASE}${path}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("No se pudo cargar el post");
      return res.json() as Promise<BlogPost>;
    },
    enabled: !!slug,
  });
}
