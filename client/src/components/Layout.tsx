import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { Chatbot } from "./Chatbot";
import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Github, Linkedin, Menu, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useBlogAnalytics } from "@/hooks/use-blog-analytics";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { t } = useI18n();

  const blogSlug = location.startsWith("/blog/")
    ? decodeURIComponent(location.replace("/blog/", "").split("/")[0] || "") || null
    : null;

  useBlogAnalytics({ blogSlug, path: location });

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/projects", label: t("nav.projects") },
    { href: "/about", label: t("nav.about") },
    { href: "/blog", label: t("nav.blog") },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-40 w-full glass-panel border-b-0 border-t-0 border-x-0">
        <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2 group">
            <div className="w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center font-black text-xs transition-transform group-hover:scale-110">
              GM
            </div>
            Gerardo.
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={`transition-colors hover:text-foreground relative py-1 ${location === link.href ? "text-foreground" : ""}`}
              >
                {link.label}
                {location === link.href && (
                  <motion.div 
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menú de navegación">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] max-w-xs">
                <SheetHeader>
                  <SheetTitle>Menú</SheetTitle>
                </SheetHeader>
                <nav className="mt-6 flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted ${location === link.href ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>

      <footer className="border-t border-border bg-muted/20 py-12 mt-24">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-semibold">
            <div className="w-5 h-5 bg-foreground text-background rounded flex items-center justify-center font-black text-[10px]">
              GM
            </div>
            Gerardo Melgoza
          </div>
          
          <div className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Gerardo Melgoza. {t("footer.rights")}
          </div>

          <div className="flex gap-4 text-muted-foreground">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
}
