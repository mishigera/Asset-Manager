import { useQuery } from "@tanstack/react-query";
import { portfolioBlogPosts } from "@/data/portfolio";

export function useBlogPosts() {
  return useQuery({
    queryKey: ["portfolio", "blog"],
    queryFn: async () => portfolioBlogPosts,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ["portfolio", "blog", slug],
    queryFn: async () => portfolioBlogPosts.find((post) => post.slug === slug) ?? null,
    enabled: !!slug,
  });
}
