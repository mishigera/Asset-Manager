import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { apiUrl } from "@/lib/apiBase";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PublicProfile {
  aboutImageUrl?: string | null;
  cvUrl?: string | null;
  bio?: string | null;
}

export default function About() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<PublicProfile | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await fetch(apiUrl("/api/profile"));
        if (!res.ok) return;
        const payload = await res.json();
        if (!mounted) return;
        setProfile(payload);
      } catch {
        // ignore and keep static fallback
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const philosophy = [
    "Simplicidad ante todo. Menos código, menos deuda técnica.",
    "El rendimiento es una característica, no una idea de último momento.",
    "Diseño pensado para el usuario final, iterando sobre feedback real.",
    "La IA es un multiplicador de fuerza, utilízala sabiamente."
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 md:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">{t("about.title")}</h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
              {profile?.bio || "Soy Gerardo, un ingeniero de software de Guadalajara apasionado por crear experiencias digitales excepcionales utilizando las últimas tecnologías web e inteligencia artificial."}
            </p>

            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p>
                Inicié mi viaje en el desarrollo construyendo pequeños scripts y automatizaciones. Hoy en día, he construido aplicaciones complejas de pila completa que sirven a miles de usuarios.
              </p>
              <p>
                Me especializo en el ecosistema de TypeScript:  React en el frontend y Node.js/PostgreSQL en el backend. o el stack MEAN (Mongo express Angular Node). Sin embargo, me considero agnóstico a la tecnología; elijo la herramienta adecuada para el trabajo adecuado.
              </p>
            </div>

            <h3 className="text-2xl font-bold tracking-tight mt-16 mb-6">{t("about.philosophy")}</h3>
            <ul className="space-y-4">
              {philosophy.map((item, i) => (
                <li key={i} className="flex gap-3 text-lg text-muted-foreground">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-8"
          >
            <div className="p-8 rounded-3xl bg-muted/30 border border-border">
              <h3 className="font-bold text-xl mb-6">{t("about.ai")}</h3>
              <div className="space-y-6">
                <div>
                  <div className="font-medium mb-2">Modelos</div>
                  <div className="flex flex-wrap gap-2">
                    {['GPT-5o nano', 'Claude 3.5 Sonnet', 'Llama 3', 'Tinyllama'].map(s => (
                      <span key={s} className="px-3 py-1 bg-background border border-border rounded-full text-sm">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-medium mb-2">Herramientas</div>
                  <div className="flex flex-wrap gap-2">
                    {['Vercel AI SDK', 'LangChain', 'Pinecone', 'OpenAI API'].map(s => (
                      <span key={s} className="px-3 py-1 bg-background border border-border rounded-full text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {profile?.cvUrl && (
                <a
                  href={profile.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm hover:bg-muted/40 transition-colors"
                >
                  Descargar CV
                </a>
              )}
              {profile?.aboutImageUrl ? (
                <img
                  src={profile.aboutImageUrl}
                  alt="Foto de perfil"
                  className="aspect-square w-full object-cover rounded-3xl border border-border/50"
                />
              ) : (
                <div className="aspect-square rounded-3xl bg-primary/5 border border-border/50 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                  <span className="font-bold text-6xl text-primary/20 tracking-tighter">GM.</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
