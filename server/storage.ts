import { db } from "./db";
import {
  projects, skills, certifications, blogPosts,
  type Project, type InsertProject,
  type Skill, type InsertSkill,
  type Certification, type InsertCertification,
  type BlogPost, type InsertBlogPost
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getProject(slug: string): Promise<Project | undefined>;
  getSkills(): Promise<Skill[]>;
  getCertifications(): Promise<Certification[]>;
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  
  // Seed helpers
  createProject(project: InsertProject): Promise<Project>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  createCertification(cert: InsertCertification): Promise<Certification>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(slug: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
    return project;
  }

  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }

  async getCertifications(): Promise<Certification[]> {
    return await db.select().from(certifications);
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts);
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [p] = await db.insert(projects).values(project).returning();
    return p;
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [s] = await db.insert(skills).values(skill).returning();
    return s;
  }

  async createCertification(cert: InsertCertification): Promise<Certification> {
    const [c] = await db.insert(certifications).values(cert).returning();
    return c;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [p] = await db.insert(blogPosts).values(post).returning();
    return p;
  }
}

export const storage = new DatabaseStorage();
