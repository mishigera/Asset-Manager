import type { BlogPost, Certification, Project, Skill } from "@shared/schema";

export const portfolioProjects: Project[] = [
  {
    id: 1,
    slug: "invitacion-personalizada",
    title: "Invitación Personalizada",
    description: "Aplicación web de ejemplo con interfaz responsive y panel administrativo.",
    content:
      "## Resumen\n\nProyecto de ejemplo para mostrar arquitectura frontend y backend desacoplada.\n\n## Alcance\n\n- Gestión básica de contenido\n- Panel administrativo\n- Diseño responsive",
    stack: ["React", "TypeScript", "Node.js"],
    imageUrl: null,
    githubUrl: null,
    demoUrl: null,
    featured: true,
  },
  {
    id: 2,
    slug: "dashboard-analitico",
    title: "Dashboard Analítico",
    description: "Dashboard analítico de ejemplo con visualización de métricas clave.",
    content:
      "## Resumen\n\nDashboard de ejemplo para monitoreo de indicadores en tiempo real.\n\n## Funcionalidades\n\n- Visualización de métricas\n- Filtros básicos\n- Reportes resumidos",
    stack: ["React", "Tailwind", "PostgreSQL"],
    imageUrl: null,
    githubUrl: null,
    demoUrl: null,
    featured: true,
  },
  {
    id: 3,
    slug: "sitio-corporativo",
    title: "Sitio Corporativo",
    description: "Sitio corporativo de ejemplo con secciones de contenido dinámico.",
    content:
      "## Resumen\n\nImplementación de sitio web de ejemplo orientado a performance y mantenibilidad.\n\n## Incluye\n\n- Secciones dinámicas\n- SEO técnico base\n- Componentes reutilizables",
    stack: ["Vite", "TypeScript", "CSS"],
    imageUrl: null,
    githubUrl: null,
    demoUrl: null,
    featured: false,
  },
];

export const portfolioSkills: Skill[] = [
  { id: 1, category: "Frontend", name: "React", icon: "Code2" },
  { id: 2, category: "Frontend", name: "TypeScript", icon: "FileCode" },
  { id: 3, category: "Backend", name: "Node.js", icon: "Server" },
  { id: 4, category: "Data", name: "PostgreSQL", icon: "Database" },
];

export const portfolioCertifications: Certification[] = [
  {
    id: 1,
    title: "Certificación Técnica A (Ejemplo)",
    issuer: "Proveedor de formación",
    year: "2025",
    url: null,
  },
  {
    id: 2,
    title: "Certificación Técnica B (Ejemplo)",
    issuer: "Academia online",
    year: "2024",
    url: null,
  },
];

export const portfolioBlogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "post-ejemplo-a",
    title: "Post de ejemplo A",
    excerpt: "Ideas base para estructurar un proyecto frontend mantenible.",
    content:
      "## Post de ejemplo\n\nContenido de ejemplo para mantener el blog operativo mientras se conecta a la fuente real de datos.",
    publishedAt: new Date("2025-06-15T10:00:00.000Z"),
    readTime: "4 min",
  },
  {
    id: 2,
    slug: "post-ejemplo-b",
    title: "Post de ejemplo B",
    excerpt: "Buenas prácticas para mejorar experiencia de usuario y rendimiento.",
    content:
      "## Post de ejemplo\n\nEste artículo es de placeholder y puede ser reemplazado por contenido real cuando exista un endpoint o CMS definitivo.",
    publishedAt: new Date("2025-07-10T10:00:00.000Z"),
    readTime: "5 min",
  },
];
