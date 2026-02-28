import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "es" | "en";

interface Dictionary {
  [key: string]: string;
}

const dictionaries: Record<Language, Dictionary> = {
  es: {
    "nav.home": "Inicio",
    "nav.projects": "Proyectos",
    "nav.about": "Sobre mí",
    "nav.blog": "Blog",
    "hero.badge": "Disponible para nuevas oportunidades",
    "hero.title": "Gerardo Melgoza",
    "hero.subtitle": "Desarrollador Fullstack impulsado por IA.",
    "hero.description": "Construyendo interfaces hermosas y sistemas escalables desde Guadalajara, México. Transformo ideas en productos digitales de alto impacto.",
    "hero.cta": "Contáctame",
    "hero.secondary": "Ver proyectos",
    "section.featured": "Proyectos Destacados",
    "section.skills": "Habilidades Técnicas",
    "section.learning": "Aprendiendo Actualmente",
    "section.certifications": "Certificaciones",
    "section.viewAll": "Ver todos",
    "chat.title": "Chatbot IA",
    "chat.placeholder": "Pregúntame sobre la experiencia de Gerardo...",
    "chat.empty": "¡Hola! Soy el asistente de IA de Gerardo. ¿En qué te puedo ayudar hoy?",
    "projects.title": "Mis Proyectos",
    "projects.subtitle": "Una colección de aplicaciones, herramientas y experimentos.",
    "projects.notfound": "Proyecto no encontrado.",
    "projects.demo": "Ver Demo",
    "projects.github": "Ver Código",
    "about.title": "Sobre mí",
    "about.subtitle": "Mi historia, filosofía y herramientas.",
    "about.philosophy": "Filosofía UX",
    "about.ai": "Kit de herramientas IA",
    "blog.title": "Blog",
    "blog.subtitle": "Pensamientos sobre desarrollo, diseño e IA.",
    "blog.readTime": "min de lectura",
    "footer.rights": "Todos los derechos reservados.",
  },
  en: {
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.about": "About",
    "nav.blog": "Blog",
    "hero.badge": "Available for new opportunities",
    "hero.title": "Gerardo Melgoza",
    "hero.subtitle": "AI-powered Fullstack Developer.",
    "hero.description": "Building beautiful interfaces and scalable systems from Guadalajara, Mexico. I transform ideas into high-impact digital products.",
    "hero.cta": "Contact Me",
    "hero.secondary": "View Projects",
    "section.featured": "Featured Projects",
    "section.skills": "Technical Skills",
    "section.learning": "Currently Learning",
    "section.certifications": "Certifications",
    "section.viewAll": "View all",
    "chat.title": "AI Chatbot",
    "chat.placeholder": "Ask me about Gerardo's experience...",
    "chat.empty": "Hi! I'm Gerardo's AI assistant. How can I help you today?",
    "projects.title": "My Projects",
    "projects.subtitle": "A collection of apps, tools, and experiments.",
    "projects.notfound": "Project not found.",
    "projects.demo": "View Demo",
    "projects.github": "View Code",
    "about.title": "About Me",
    "about.subtitle": "My background, philosophy, and tools.",
    "about.philosophy": "UX Philosophy",
    "about.ai": "AI Toolkit",
    "blog.title": "Blog",
    "blog.subtitle": "Thoughts on development, design, and AI.",
    "blog.readTime": "min read",
    "footer.rights": "All rights reserved.",
  }
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("es");

  const t = (key: string) => {
    return dictionaries[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
