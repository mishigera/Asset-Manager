import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import {
  insertProjectSchema,
  insertProfileSchema,
  insertSkillSchema,
  insertCertificationSchema,
  insertBlogPostSchema,
} from "@shared/schema";
import { z } from "zod";
import multer, { MulterError } from "multer";
import {
  authMiddleware,
  createToken,
  validateAdminCredentials,
} from "./auth";
import {
  buildObjectKey,
  uploadBufferToS3,
  uploadLimits,
  validateUpload,
} from "./s3";

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
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: uploadLimits.maxAnyBytes,
    },
  });
  const uploadSingleFile = upload.single("file");

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

  app.get("/api/profile", async (_req, res) => {
    const item = await storage.getProfile();
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

  app.post("/api/admin/login", async (req, res) => {
    const schema = z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const { username, password } = parsed.data;
    const valid = await validateAdminCredentials(username, password);

    if (!valid) {
      return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }

    const token = createToken(username);
    return res.status(200).json({ token });
  });

  app.get("/api/admin/session", authMiddleware, (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.post(
    "/api/admin/upload",
    authMiddleware,
    async (req, res) => {
      uploadSingleFile(req, res, (uploadError: unknown) => {
        if (uploadError) {
          if (uploadError instanceof MulterError && uploadError.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "Archivo demasiado grande" });
          }
          return res.status(400).json({ message: "No se pudo procesar el archivo" });
        }

        (async () => {
          try {
            const file = req.file;
            if (!file) {
              return res.status(400).json({ message: "Archivo requerido en field 'file'" });
            }

            const kind = validateUpload(file.mimetype, file.size);
            const key = buildObjectKey(kind, file.originalname, file.mimetype);
            const uploaded = await uploadBufferToS3({
              key,
              contentType: file.mimetype,
              body: file.buffer,
              kind,
            });

            return res.status(200).json({ ok: true, ...uploaded });
          } catch (error) {
            const message = error instanceof Error ? error.message : "Error al subir archivo";
            return res.status(400).json({ message });
          }
        })();
      });
    },
  );

  // --- Admin: CRUD con login
  const idParam = (req: Request) => parseInt(String(req.params.id), 10);

  // Projects
  app.post("/api/admin/projects", authMiddleware, async (req, res) => {
    const parsed = insertProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
    }
    const data = { ...parsed.data, stack: [...(parsed.data.stack || [])] };
    const project = await storage.createProject(data);
    res.status(201).json(project);
  });
  app.put("/api/admin/projects/:id", authMiddleware, async (req, res) => {
    const id = idParam(req);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const parsed = insertProjectSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
    }
    const data = parsed.data.stack != null
      ? { ...parsed.data, stack: [...parsed.data.stack] }
      : parsed.data;
    const project = await storage.updateProject(id, data);
    if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });
    res.json(project);
  });
  app.patch("/api/admin/projects/:id", authMiddleware, async (req, res) => {
    const id = idParam(req);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const parsed = insertProjectSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
    }
    const data = parsed.data.stack != null
      ? { ...parsed.data, stack: [...parsed.data.stack] }
      : parsed.data;
    const project = await storage.updateProject(id, data);
    if (!project) return res.status(404).json({ message: "Proyecto no encontrado" });
    res.json(project);
  });
  app.delete("/api/admin/projects/:id", authMiddleware, async (req, res) => {
    const id = idParam(req);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const deleted = await storage.deleteProject(id);
    if (!deleted) return res.status(404).json({ message: "Proyecto no encontrado" });
    res.status(204).send();
  });

  app.get("/api/admin/profile", authMiddleware, async (_req, res) => {
    const item = await storage.getProfile();
    res.json(item);
  });

  app.patch("/api/admin/profile", authMiddleware, async (req, res) => {
    const parsed = insertProfileSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
    }

    const updated = await storage.upsertProfile(parsed.data);
    res.json(updated);
  });

  // Skills
  app.post("/api/admin/skills", authMiddleware, async (req, res) => {
    const parsed = insertSkillSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
    }
    const skill = await storage.createSkill(parsed.data);
    res.status(201).json(skill);
  });
  app.put("/api/admin/skills/:id", authMiddleware, async (req, res) => {
    const id = idParam(req);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const parsed = insertSkillSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
    }
    const skill = await storage.updateSkill(id, parsed.data);
    if (!skill) return res.status(404).json({ message: "Skill no encontrado" });
    res.json(skill);
  });
  app.delete("/api/admin/skills/:id", authMiddleware, async (req, res) => {
    const id = idParam(req);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const deleted = await storage.deleteSkill(id);
    if (!deleted) return res.status(404).json({ message: "Skill no encontrado" });
    res.status(204).send();
  });

  // Certifications
  app.post("/api/admin/certifications", authMiddleware, async (req, res) => {
    const parsed = insertCertificationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
    }
    const cert = await storage.createCertification(parsed.data);
    res.status(201).json(cert);
  });
  app.put("/api/admin/certifications/:id", authMiddleware, async (req, res) => {
    const id = idParam(req);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const parsed = insertCertificationSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
    }
    const cert = await storage.updateCertification(id, parsed.data);
    if (!cert) return res.status(404).json({ message: "Certificación no encontrada" });
    res.json(cert);
  });
  app.delete("/api/admin/certifications/:id", authMiddleware, async (req, res) => {
    const id = idParam(req);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const deleted = await storage.deleteCertification(id);
    if (!deleted) return res.status(404).json({ message: "Certificación no encontrada" });
    res.status(204).send();
  });

  // Blog
  app.post("/api/admin/blog", authMiddleware, async (req, res) => {
    const parsed = insertBlogPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
    }
    const post = await storage.createBlogPost(parsed.data);
    res.status(201).json(post);
  });
  app.put("/api/admin/blog/:id", authMiddleware, async (req, res) => {
    const id = idParam(req);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const parsed = insertBlogPostSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.flatten() });
    }
    const post = await storage.updateBlogPost(id, parsed.data);
    if (!post) return res.status(404).json({ message: "Post no encontrado" });
    res.json(post);
  });
  app.delete("/api/admin/blog/:id", authMiddleware, async (req, res) => {
    const id = idParam(req);
    if (Number.isNaN(id)) return res.status(400).json({ message: "ID inválido" });
    const deleted = await storage.deleteBlogPost(id);
    if (!deleted) return res.status(404).json({ message: "Post no encontrado" });
    res.status(204).send();
  });

  return httpServer;
}
