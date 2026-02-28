import { db } from "./db";
import {
  projects, profile, skills, certifications, blogPosts,
  type Project, type InsertProject,
  type Profile, type InsertProfile,
  type Skill, type InsertSkill,
  type Certification, type InsertCertification,
  type BlogPost, type InsertBlogPost
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getProjects(): Promise<Project[]>;
  getProject(slug: string): Promise<Project | undefined>;
  getProjectById(id: number): Promise<Project | undefined>;
  getProfile(): Promise<Profile>;
  getSkills(): Promise<Skill[]>;
  getSkillById(id: number): Promise<Skill | undefined>;
  getCertifications(): Promise<Certification[]>;
  getCertificationById(id: number): Promise<Certification | undefined>;
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  getBlogPostById(id: number): Promise<BlogPost | undefined>;

  createProject(project: InsertProject): Promise<Project>;
  upsertProfile(data: Partial<InsertProfile>): Promise<Profile>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  createCertification(cert: InsertCertification): Promise<Certification>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;

  updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined>;
  updateSkill(id: number, data: Partial<InsertSkill>): Promise<Skill | undefined>;
  updateCertification(id: number, data: Partial<InsertCertification>): Promise<Certification | undefined>;
  updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;

  deleteProject(id: number): Promise<boolean>;
  deleteSkill(id: number): Promise<boolean>;
  deleteCertification(id: number): Promise<boolean>;
  deleteBlogPost(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(slug: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.slug, slug));
    return project;
  }

  async getProjectById(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProfile(): Promise<Profile> {
    const [existing] = await db.select().from(profile).where(eq(profile.id, 1));
    if (existing) return existing;

    const [created] = await db.insert(profile).values({ id: 1 }).returning();
    return created;
  }

  async getSkills(): Promise<Skill[]> {
    return await db.select().from(skills);
  }

  async getSkillById(id: number): Promise<Skill | undefined> {
    const [s] = await db.select().from(skills).where(eq(skills.id, id));
    return s;
  }

  async getCertifications(): Promise<Certification[]> {
    return await db.select().from(certifications);
  }

  async getCertificationById(id: number): Promise<Certification | undefined> {
    const [c] = await db.select().from(certifications).where(eq(certifications.id, id));
    return c;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts);
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post;
  }

  async getBlogPostById(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const p = { ...project, stack: [...(project.stack || [])] };
    const [result] = await db.insert(projects).values(p).returning();
    return result;
  }

  async upsertProfile(data: Partial<InsertProfile>): Promise<Profile> {
    await this.getProfile();
    const [updated] = await db
      .update(profile)
      .set(data)
      .where(eq(profile.id, 1))
      .returning();
    return updated;
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

  async updateProject(id: number, data: Partial<InsertProject>): Promise<Project | undefined> {
    const set: Partial<InsertProject> =
      data.stack != null ? { ...data, stack: [...data.stack] } : { ...data };
    const [p] = await db.update(projects).set(set as Record<string, unknown>).where(eq(projects.id, id)).returning();
    return p;
  }

  async updateSkill(id: number, data: Partial<InsertSkill>): Promise<Skill | undefined> {
    const [s] = await db.update(skills).set(data).where(eq(skills.id, id)).returning();
    return s;
  }

  async updateCertification(id: number, data: Partial<InsertCertification>): Promise<Certification | undefined> {
    const [c] = await db.update(certifications).set(data).where(eq(certifications.id, id)).returning();
    return c;
  }

  async updateBlogPost(id: number, data: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const [p] = await db.update(blogPosts).set(data).where(eq(blogPosts.id, id)).returning();
    return p;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteSkill(id: number): Promise<boolean> {
    const result = await db.delete(skills).where(eq(skills.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteCertification(id: number): Promise<boolean> {
    const result = await db.delete(certifications).where(eq(certifications.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
