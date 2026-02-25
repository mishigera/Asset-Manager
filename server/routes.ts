import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedDatabase() {
  const existingProjects = await storage.getProjects();
  if (existingProjects.length === 0) {
    await storage.createProject({
      slug: "invitacion-boda",
      title: "Invitación Boda",
      description: "App invitación con RSVP e info del evento.",
      content: "Una aplicación moderna construida para gestionar invitados, RSVP y detalles de un evento. Se utilizó Firebase para autenticación y almacenamiento en tiempo real.",
      stack: ["Ionic", "Angular", "Firebase"],
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      demoUrl: "https://example.com",
      githubUrl: "https://github.com/example/invitacion"
    });

    await storage.createProject({
      slug: "coming-soon-1",
      title: "AI Code Assistant (Coming Soon)",
      description: "Una extensión para editor impulsada por LLMs para autocompletado avanzado.",
      content: "Proyecto en desarrollo enfocado en la generación de código y revisión automática de PRs.",
      stack: ["React", "TypeScript", "OpenAI"],
      featured: true,
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      demoUrl: null,
      githubUrl: null
    });

    await storage.createProject({
      slug: "coming-soon-2",
      title: "FinTech Dashboard (Coming Soon)",
      description: "Dashboard financiero con analíticas en tiempo real.",
      content: "Panel de control para la gestión de finanzas personales, integrando múltiples fuentes de datos y gráficos interactivos.",
      stack: ["Next.js", "Tailwind", "Recharts"],
      featured: false,
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      demoUrl: null,
      githubUrl: null
    });

    await storage.createSkill({ category: "Frontend", name: "React / Next.js", icon: "Code" });
    await storage.createSkill({ category: "Frontend", name: "TailwindCSS", icon: "Palette" });
    await storage.createSkill({ category: "Frontend", name: "Framer Motion", icon: "Zap" });
    
    await storage.createSkill({ category: "Backend", name: "Node.js / Express", icon: "Server" });
    await storage.createSkill({ category: "Backend", name: "PostgreSQL", icon: "Database" });
    
    await storage.createSkill({ category: "AI Tooling", name: "LLMs / Prompt Engineering", icon: "BrainCircuit" });
    await storage.createSkill({ category: "AI Tooling", name: "Codegen Tools", icon: "Bot" });

    await storage.createCertification({
      title: "AWS Certified Developer",
      issuer: "Amazon Web Services",
      year: "2023",
      url: "https://aws.amazon.com/certification/"
    });
    
    await storage.createCertification({
      title: "Fullstack JavaScript",
      issuer: "Platzi",
      year: "2022",
      url: "https://platzi.com/"
    });

    await storage.createBlogPost({
      slug: "bienvenidos-a-mi-portfolio",
      title: "Bienvenidos a mi nuevo portfolio AI-powered",
      excerpt: "Un pequeño recorrido sobre cómo construí este sitio y las tecnologías que elegí.",
      content: "Hola a todos, este es el primer post de mi portfolio. Decidí utilizar tecnologías modernas como Vite, React y TailwindCSS para crear una experiencia minimalista inspirada en Vercel y Linear. En el futuro, estaré compartiendo más sobre mi experiencia integrando herramientas de IA.",
      readTime: "3 min"
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed DB silently in background
  seedDatabase().catch(console.error);
  
  app.get(api.projects.list.path, async (req, res) => {
    const items = await storage.getProjects();
    res.json(items);
  });

  app.get(api.projects.get.path, async (req, res) => {
    const item = await storage.getProject(req.params.slug);
    if (!item) return res.status(404).json({ message: "Project not found" });
    res.json(item);
  });

  app.get(api.skills.list.path, async (req, res) => {
    const items = await storage.getSkills();
    res.json(items);
  });

  app.get(api.certifications.list.path, async (req, res) => {
    const items = await storage.getCertifications();
    res.json(items);
  });

  app.get(api.blog.list.path, async (req, res) => {
    const items = await storage.getBlogPosts();
    res.json(items);
  });

  app.get(api.blog.get.path, async (req, res) => {
    const item = await storage.getBlogPost(req.params.slug);
    if (!item) return res.status(404).json({ message: "Post not found" });
    res.json(item);
  });

  // Chatbot SSE stub endpoint
  app.post('/api/chat', async (req, res) => {
    const body = req.body;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const message = body.message || "Hola";
    const responseText = `Recibí tu mensaje: "${message}". Esto es un stream de prueba. Próximamente conectaré un LLM aquí.`;
    const tokens = responseText.split(' ');

    let i = 0;
    const interval = setInterval(() => {
      if (i < tokens.length) {
        const chunk = { text: tokens[i] + (i < tokens.length - 1 ? ' ' : ''), done: false };
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        i++;
      } else {
        res.write(`data: ${JSON.stringify({ text: '', done: true })}\n\n`);
        clearInterval(interval);
        res.end();
      }
    }, 50);

    req.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  });

  return httpServer;
}
