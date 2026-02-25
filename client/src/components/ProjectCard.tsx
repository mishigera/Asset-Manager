import { Link } from "wouter";
import { ArrowRight, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Project } from "@shared/schema";
import { useI18n } from "@/lib/i18n";

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useI18n();

  return (
    <Link href={`/projects/${project.slug}`}>
      <div className="group flex flex-col h-full bg-card rounded-2xl border border-border/50 overflow-hidden card-hover cursor-pointer">
        {project.imageUrl && (
          <div className="w-full aspect-[16/9] overflow-hidden bg-muted relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* dynamic image rendering assuming standard URLs */}
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <ArrowRight className="w-4 h-4 text-muted-foreground -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-primary" />
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-2 mt-auto">
            {project.stack.slice(0, 4).map((tech) => (
              <Badge key={tech} variant="secondary" className="bg-muted text-muted-foreground font-medium rounded-md px-2 py-0.5 text-xs border-transparent">
                {tech}
              </Badge>
            ))}
            {project.stack.length > 4 && (
              <Badge variant="secondary" className="bg-muted text-muted-foreground font-medium rounded-md px-2 py-0.5 text-xs border-transparent">
                +{project.stack.length - 4}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
