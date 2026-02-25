import { Layout } from "@/components/Layout";
import { ProjectCard } from "@/components/ProjectCard";
import { useProjects } from "@/hooks/use-projects";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function Projects() {
  const { t } = useI18n();
  const { data: projects, isLoading } = useProjects();

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-20 md:py-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{t("projects.title")}</h1>
          <p className="text-lg text-muted-foreground">{t("projects.subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="w-full aspect-[16/9] rounded-2xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))
          ) : (
            projects?.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
