import { useQuery } from "@tanstack/react-query";
import { portfolioCertifications, portfolioSkills } from "@/data/portfolio";

export function useSkills() {
  return useQuery({
    queryKey: ["portfolio", "skills"],
    queryFn: async () => portfolioSkills,
  });
}

export function useCertifications() {
  return useQuery({
    queryKey: ["portfolio", "certifications"],
    queryFn: async () => portfolioCertifications,
  });
}
