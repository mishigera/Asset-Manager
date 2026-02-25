import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Terminal, Database, Sparkles, Code2, MoveRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ProjectCard";
import { useProjects, useSkills } from "@/hooks/use-projects"; // Reuse or split
import { Skeleton } from "@/components/ui/skeleton";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Home() {
  const { t } = useI18n();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  
  const featuredProjects = projects?.filter(p => p.featured).slice(0, 3) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-36 md:pb-48 overflow-hidden">
        {/* Abstract background gradient elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-3xl mx-auto text-center flex flex-col items-center"
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-medium text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {t("hero.badge")}
              </span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
              <span className="text-gradient-primary">{t("hero.title")}</span><br />
              {t("hero.subtitle")}
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl">
              {t("hero.description")}
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <Button size="lg" className="rounded-full h-12 px-8 shadow-lg shadow-primary/20 group">
                {t("hero.cta")}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full h-12 px-8 bg-transparent" asChild>
                <Link href="/projects">{t("hero.secondary")}</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">{t("section.featured")}</h2>
              <p className="text-muted-foreground">Obras selectas y aplicaciones recientes.</p>
            </div>
            <Link href="/projects" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              {t("section.viewAll")} <MoveRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectsLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="w-full aspect-[16/9] rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))
            ) : (
              featuredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
          
          <div className="mt-8 sm:hidden flex justify-center">
            <Button variant="outline" className="rounded-full w-full" asChild>
              <Link href="/projects">{t("section.viewAll")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Skills / What I Do */}
      <section className="py-32">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{t("section.skills")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Arquitectura moderna y herramientas de última generación para construir de manera rápida y escalable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-border bg-card card-hover">
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-6">
                <Code2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Frontend Engineering</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Creación de interfaces fluidas, responsivas y accesibles con React, Next.js y animaciones complejas.
              </p>
              <div className="flex flex-wrap gap-2">
                {['React', 'TypeScript', 'Tailwind', 'Framer Motion'].map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card card-hover">
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Backend & Systems</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                APIs robustas, diseño de bases de datos relacionales y microservicios escalables.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Node.js', 'PostgreSQL', 'Drizzle ORM', 'Redis'].map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-border bg-card card-hover">
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Integration</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Implementación de LLMs, embeddings y RAG para crear experiencias inteligentes y personalizadas.
              </p>
              <div className="flex flex-wrap gap-2">
                {['OpenAI', 'LangChain', 'Vector DBs', 'Vercel AI SDK'].map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-md bg-muted text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
