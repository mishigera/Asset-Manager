import { useParams, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Layout } from "@/components/Layout";
import { useProject } from "@/hooks/use-projects";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { motion } from "framer-motion";

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: project, isLoading, error } = useProject(slug || "");
  const { t } = useI18n();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 py-20">
          <Skeleton className="h-8 w-32 mb-12" />
          <Skeleton className="h-16 w-3/4 mb-6" />
          <Skeleton className="h-6 w-full max-w-2xl mb-12" />
          <Skeleton className="w-full aspect-video rounded-3xl mb-16" />
          <div className="space-y-4 max-w-3xl mx-auto">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 md:px-8 py-32 text-center">
          <h1 className="text-3xl font-bold mb-4">{t("projects.notfound")}</h1>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/projects">
              <ArrowLeft className="mr-2 w-4 h-4" /> Volver a proyectos
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container mx-auto px-4 md:px-8 py-20 md:py-32">
        <Link href="/projects" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-12 transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4" /> Todos los proyectos
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl"
        >
          <div className="flex flex-wrap gap-2 mb-6">
            {project.stack.map(tech => (
              <Badge key={tech} variant="secondary" className="rounded-md bg-muted text-muted-foreground">{tech}</Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">{project.title}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-3xl">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            {project.demoUrl && (
              <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20">
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 w-4 h-4" /> {t("projects.demo")}
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Github className="mr-2 w-4 h-4" /> {t("projects.github")}
                </a>
              </Button>
            )}
          </div>
        </motion.div>

        {project.imageUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden border border-border bg-muted mb-20 shadow-2xl"
          >
            <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover" />
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg dark:prose-invert max-w-3xl mx-auto prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {project.content}
          </ReactMarkdown>
        </motion.div>
      </article>
    </Layout>
  );
}
