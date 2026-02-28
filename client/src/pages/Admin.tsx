import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  adminFetch,
  adminLogin,
  checkAdminSession,
  clearAdminToken,
} from "@/lib/adminAuth";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Project, Skill, Certification, BlogPost, Profile } from "@shared/schema";
import { Plus, Trash2 } from "lucide-react";

type UploadKind = "image" | "cv";

async function uploadAdminFile(file: File, expected: UploadKind) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await adminFetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok || payload?.ok !== true) {
    throw new Error(payload?.message || "No se pudo subir el archivo");
  }

  if (payload.kind !== expected) {
    throw new Error(
      expected === "image"
        ? "Debes subir una imagen válida"
        : "Debes subir un PDF válido",
    );
  }

  return payload as { ok: true; key: string; url: string; kind: UploadKind };
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [credentials, setCredentials] = useState({ username: "", password: "" });

  useEffect(() => {
    let mounted = true;

    const validate = async () => {
      const valid = await checkAdminSession();
      if (!mounted) return;
      setIsLoggedIn(valid);
      setIsCheckingAuth(false);
    };

    validate();

    return () => {
      mounted = false;
    };
  }, []);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["portfolio"] });
  }, [queryClient]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setLoginError("Completa usuario y contraseña.");
      return;
    }

    setIsLoggingIn(true);
    setLoginError("");

    try {
      await adminLogin(credentials.username.trim(), credentials.password);
      setIsLoggedIn(true);
      setCredentials({ username: "", password: "" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesión";
      setLoginError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearAdminToken();
    setIsLoggedIn(false);
    setCredentials({ username: "", password: "" });
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30 px-4">
        <p className="text-sm text-muted-foreground">Verificando sesión…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30 px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Acceso Admin</CardTitle>
            <CardDescription>Inicia sesión para gestionar el contenido.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="admin-username">Usuario</Label>
                <Input
                  id="admin-username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials((prev) => ({ ...prev, username: e.target.value }))
                  }
                  autoComplete="username"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="admin-password">Contraseña</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => ({ ...prev, password: e.target.value }))
                  }
                  autoComplete="current-password"
                />
              </div>
              {loginError && (
                <p className="text-sm text-destructive">{loginError}</p>
              )}
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? "Ingresando…" : "Ingresar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-semibold text-lg">Panel Admin</h1>
          <p className="text-sm text-muted-foreground">Gestiona proyectos, skills, certificaciones y blog.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </header>
      <div className="container max-w-5xl py-6 px-4">
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="projects">Proyectos</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="certifications">Certificaciones</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
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
          <TabsContent value="profile" className="space-y-4">
            <AdminProfile onMutate={invalidateAll} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdminProjects({ onMutate }: { onMutate: () => void }) {
  const { data: items, isLoading } = useProjects();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    slug: "",
    title: "",
    description: "",
    content: "",
    stack: "" as string,
    imageKey: "",
    imageUrl: "",
    githubUrl: "",
    demoUrl: "",
    featured: false,
  });

  const resetForm = () => {
    setCreating(false);
    setEditingId(null);
    setFormError("");
    setForm({
      slug: "",
      title: "",
      description: "",
      content: "",
      stack: "",
      imageKey: "",
      imageUrl: "",
      githubUrl: "",
      demoUrl: "",
      featured: false,
    });
  };

  const save = async () => {
    setFormError("");
    const stack = form.stack.split(",").map((s) => s.trim()).filter(Boolean);
    const res = await adminFetch(editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects", {
      method: editingId ? "PATCH" : "POST",
      body: JSON.stringify({
        ...form,
        stack,
        imageKey: form.imageKey || null,
        imageUrl: form.imageUrl || null,
        githubUrl: form.githubUrl || null,
        demoUrl: form.demoUrl || null,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      const message = d?.message || "Error al guardar proyecto";
      setFormError(message);
      throw new Error(message);
    }
    onMutate();
    resetForm();
  };

  const edit = (project: Project) => {
    setFormError("");
    setCreating(true);
    setEditingId(project.id);
    setForm({
      slug: project.slug,
      title: project.title,
      description: project.description,
      content: project.content,
      stack: Array.isArray(project.stack) ? project.stack.join(", ") : "",
      imageKey: project.imageKey || "",
      imageUrl: project.imageUrl || "",
      githubUrl: project.githubUrl || "",
      demoUrl: project.demoUrl || "",
      featured: !!project.featured,
    });
  };

  const handleImageSelected = async (file: File | null) => {
    if (!file) return;
    setUploadingImage(true);
    setFormError("");

    try {
      const uploaded = await uploadAdminFile(file, "image");
      setForm((prev) => ({
        ...prev,
        imageKey: uploaded.key,
        imageUrl: uploaded.url,
      }));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "No se pudo subir la imagen");
    } finally {
      setUploadingImage(false);
    }
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
          {creating ? "Cerrar" : "Añadir"}
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
                  disabled={editingId !== null}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Subir imagen</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelected(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">
                  Máximo 10MB. {uploadingImage ? "Subiendo..." : ""}
                </p>
              </div>
              <div className="space-y-1">
                <Label>Image Key</Label>
                <Input
                  value={form.imageKey}
                  onChange={(e) => setForm((f) => ({ ...f, imageKey: e.target.value }))}
                  placeholder="uploads/images/..."
                />
              </div>
              <div className="space-y-1">
                <Label>Image URL</Label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>GitHub URL</Label>
                <Input
                  value={form.githubUrl}
                  onChange={(e) => setForm((f) => ({ ...f, githubUrl: e.target.value }))}
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-1">
                <Label>Demo URL</Label>
                <Input
                  value={form.demoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, demoUrl: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <div className="flex items-center gap-2">
              <Checkbox
                id="featured-project"
                checked={form.featured}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, featured: checked === true }))
                }
              />
              <Label htmlFor="featured-project">Proyecto destacado</Label>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} disabled={uploadingImage}>
                {editingId ? "Actualizar" : "Guardar"}
              </Button>
              <Button size="sm" variant="outline" onClick={resetForm}>
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
                <TableHead className="w-36"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items?.map((p: Project) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-sm">{p.slug}</TableCell>
                  <TableCell>{p.title}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => edit(p)}
                    >
                      Editar
                    </Button>
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

function AdminProfile({ onMutate }: { onMutate: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState<Partial<Profile>>({
    aboutImageKey: "",
    aboutImageUrl: "",
    cvKey: "",
    cvUrl: "",
    bio: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminFetch("/api/admin/profile");
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "No se pudo cargar el perfil");
      }
      setForm({
        aboutImageKey: payload.aboutImageKey || "",
        aboutImageUrl: payload.aboutImageUrl || "",
        cvKey: payload.cvKey || "",
        cvUrl: payload.cvUrl || "",
        bio: payload.bio || "",
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadImage = async (file: File | null) => {
    if (!file) return;
    setUploadingImage(true);
    setError("");
    setSuccess("");
    try {
      const uploaded = await uploadAdminFile(file, "image");
      setForm((prev) => ({
        ...prev,
        aboutImageKey: uploaded.key,
        aboutImageUrl: uploaded.url,
      }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir la foto");
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadCv = async (file: File | null) => {
    if (!file) return;
    setUploadingCv(true);
    setError("");
    setSuccess("");
    try {
      const uploaded = await uploadAdminFile(file, "cv");
      setForm((prev) => ({
        ...prev,
        cvKey: uploaded.key,
        cvUrl: uploaded.url,
      }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir el CV");
    } finally {
      setUploadingCv(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await adminFetch("/api/admin/profile", {
        method: "PATCH",
        body: JSON.stringify({
          aboutImageKey: form.aboutImageKey || null,
          aboutImageUrl: form.aboutImageUrl || null,
          cvKey: form.cvKey || null,
          cvUrl: form.cvUrl || null,
          bio: form.bio || null,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload?.message || "No se pudo guardar el perfil");
      }
      setSuccess("Perfil actualizado");
      onMutate();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">Cargando perfil...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil / About</CardTitle>
        <CardDescription>Configura foto de perfil, CV y biografía.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Subir foto</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => uploadImage(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground">
              Máximo 10MB. {uploadingImage ? "Subiendo..." : ""}
            </p>
          </div>
          <div className="space-y-1">
            <Label>Subir CV (PDF)</Label>
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => uploadCv(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground">
              Máximo 20MB. {uploadingCv ? "Subiendo..." : ""}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>aboutImageKey</Label>
            <Input
              value={form.aboutImageKey || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, aboutImageKey: e.target.value }))}
              placeholder="uploads/images/..."
            />
          </div>
          <div className="space-y-1">
            <Label>aboutImageUrl</Label>
            <Input
              value={form.aboutImageUrl || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, aboutImageUrl: e.target.value }))}
              placeholder="https://s3..."
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>cvKey</Label>
            <Input
              value={form.cvKey || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, cvKey: e.target.value }))}
              placeholder="uploads/cv/..."
            />
          </div>
          <div className="space-y-1">
            <Label>cvUrl</Label>
            <Input
              value={form.cvUrl || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, cvUrl: e.target.value }))}
              placeholder="https://s3..."
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Bio</Label>
          <Textarea
            rows={5}
            value={form.bio || ""}
            onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-emerald-600">{success}</p>}

        <Button onClick={save} disabled={saving || uploadingImage || uploadingCv}>
          {saving ? "Guardando..." : "Guardar perfil"}
        </Button>
      </CardContent>
    </Card>
  );
}
