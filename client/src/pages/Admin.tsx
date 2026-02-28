import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/adminAuth";
import { useProjects } from "@/hooks/use-projects";
import { useSkills, useCertifications } from "@/hooks/use-skills";
import { useBlogPosts } from "@/hooks/use-blog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project, Skill, Certification, BlogPost } from "@shared/schema";
import { Plus, Trash2 } from "lucide-react";

export default function Admin() {
  const queryClient = useQueryClient();
  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["portfolio"] });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background px-4 py-3">
        <h1 className="font-semibold text-lg">Panel Admin</h1>
        <p className="text-sm text-muted-foreground">Gestiona proyectos, skills, certificaciones y blog.</p>
      </header>
      <div className="container max-w-5xl py-6 px-4">
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="projects">Proyectos</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="certifications">Certificaciones</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <AdminProjects onMutate={invalidateAll} />
          </TabsContent>
          <TabsContent value="skills" className="space-y-4">
            <AdminSkills onMutate={invalidateAll} />
          </TabsContent>
          <TabsContent value="certifications" className="space-y-4">
            <AdminCertifications onMutate={invalidateAll} />
          </TabsContent>
          <TabsContent value="blog" className="space-y-4">
            <AdminBlog onMutate={invalidateAll} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdminProjects({ onMutate }: { onMutate: () => void }) {
  const { data: items, isLoading } = useProjects();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    description: "",
    content: "",
    stack: "" as string,
    imageUrl: "",
    githubUrl: "",
    demoUrl: "",
    featured: false,
  });

  const create = async () => {
    const stack = form.stack.split(",").map((s) => s.trim()).filter(Boolean);
    const res = await adminFetch("/api/admin/projects", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        stack,
        imageUrl: form.imageUrl || null,
        githubUrl: form.githubUrl || null,
        demoUrl: form.demoUrl || null,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.message || "Error al crear");
    }
    onMutate();
    setCreating(false);
    setForm({
      slug: "",
      title: "",
      description: "",
      content: "",
      stack: "",
      imageUrl: "",
      githubUrl: "",
      demoUrl: "",
      featured: false,
    });
  };

  const remove = async (id: number) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    const res = await adminFetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
    onMutate();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Proyectos</CardTitle>
          <CardDescription>Gestiona los proyectos del portfolio</CardDescription>
        </div>
        <Button size="sm" onClick={() => setCreating(!creating)}>
          <Plus className="w-4 h-4 mr-2" />
          Añadir
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {creating && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="mi-proyecto"
                />
              </div>
              <div className="space-y-1">
                <Label>Título</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Descripción</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Contenido (Markdown)</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label>Stack (separado por comas)</Label>
              <Input
                value={form.stack}
                onChange={(e) => setForm((f) => ({ ...f, stack: e.target.value }))}
                placeholder="React, TypeScript"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={create}>
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Cargando…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((p: Project) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.slug}</TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => remove(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AdminSkills({ onMutate }: { onMutate: () => void }) {
  const { data: items, isLoading } = useSkills();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ category: "", name: "", icon: "" });

  const create = async () => {
    const res = await adminFetch("/api/admin/skills", {
      method: "POST",
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.message || "Error al crear");
    }
    onMutate();
    setCreating(false);
    setForm({ category: "", name: "", icon: "" });
  };

  const remove = async (id: number) => {
    if (!confirm("¿Eliminar esta skill?")) return;
    const res = await adminFetch(`/api/admin/skills/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
    onMutate();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Skills</CardTitle>
          <CardDescription>Categorías y tecnologías</CardDescription>
        </div>
        <Button size="sm" onClick={() => setCreating(!creating)}>
          <Plus className="w-4 h-4 mr-2" />
          Añadir
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {creating && (
          <div className="rounded-lg border p-4 flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <Label>Categoría</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Frontend"
              />
            </div>
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="React"
              />
            </div>
            <div className="space-y-1">
              <Label>Icono (lucide)</Label>
              <Input
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder="Code"
              />
            </div>
            <Button size="sm" onClick={create}>
              Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCreating(false)}>
              Cancelar
            </Button>
          </div>
        )}
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Cargando…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Categoría</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Icono</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((s: Skill) => (
                <TableRow key={s.id}>
                  <TableCell>{s.category}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell className="font-mono text-sm">{s.icon}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => remove(s.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AdminCertifications({ onMutate }: { onMutate: () => void }) {
  const { data: items, isLoading } = useCertifications();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    issuer: "",
    year: "",
    url: "",
  });

  const create = async () => {
    const res = await adminFetch("/api/admin/certifications", {
      method: "POST",
      body: JSON.stringify({ ...form, url: form.url || null }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.message || "Error al crear");
    }
    onMutate();
    setCreating(false);
    setForm({ title: "", issuer: "", year: "", url: "" });
  };

  const remove = async (id: number) => {
    if (!confirm("¿Eliminar esta certificación?")) return;
    const res = await adminFetch(`/api/admin/certifications/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Error al eliminar");
    onMutate();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Certificaciones</CardTitle>
          <CardDescription>Títulos y certificados</CardDescription>
        </div>
        <Button size="sm" onClick={() => setCreating(!creating)}>
          <Plus className="w-4 h-4 mr-2" />
          Añadir
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {creating && (
          <div className="rounded-lg border p-4 grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Emisor</Label>
              <Input
                value={form.issuer}
                onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Año</Label>
              <Input
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>URL</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <Button size="sm" onClick={create}>
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Cargando…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Emisor</TableHead>
                <TableHead>Año</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((c: Certification) => (
                <TableRow key={c.id}>
                  <TableCell>{c.title}</TableCell>
                  <TableCell>{c.issuer}</TableCell>
                  <TableCell>{c.year}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => remove(c.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function AdminBlog({ onMutate }: { onMutate: () => void }) {
  const { data: items, isLoading } = useBlogPosts();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    excerpt: "",
    content: "",
    readTime: "3 min",
  });

  const create = async () => {
    const res = await adminFetch("/api/admin/blog", {
      method: "POST",
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.message || "Error al crear");
    }
    onMutate();
    setCreating(false);
    setForm({
      slug: "",
      title: "",
      excerpt: "",
      content: "",
      readTime: "3 min",
    });
  };

  const remove = async (id: number) => {
    if (!confirm("¿Eliminar este post?")) return;
    const res = await adminFetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error al eliminar");
    onMutate();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Blog</CardTitle>
          <CardDescription>Posts del blog</CardDescription>
        </div>
        <Button size="sm" onClick={() => setCreating(!creating)}>
          <Plus className="w-4 h-4 mr-2" />
          Añadir
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {creating && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="mi-post"
                />
              </div>
              <div className="space-y-1">
                <Label>Título</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Extracto</Label>
              <Input
                value={form.excerpt}
                onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Contenido (Markdown)</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="space-y-1">
              <Label>Tiempo de lectura</Label>
              <Input
                value={form.readTime}
                onChange={(e) => setForm((f) => ({ ...f, readTime: e.target.value }))}
                placeholder="3 min"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={create}>
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setCreating(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Cargando…</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((p: BlogPost) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.slug}</TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => remove(p.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
