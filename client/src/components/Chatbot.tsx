import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatRole = "user" | "assistant";
interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const HISTORY_KEY = "portfolio_chat_history";
const CONTACT_KEYWORDS = [
  "contacto",
  "correo",
  "email",
  "hablar contigo",
  "contratar",
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isContactIntent(text: string) {
  const normalized = text.toLowerCase().trim();
  return CONTACT_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [contactMode, setContactMode] = useState(false);
  const [isSendingContact, setIsSendingContact] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: "",
    email: "",
    message: "",
  });
  const [contactErrors, setContactErrors] = useState<Partial<ContactForm>>({});
  const { t } = useI18n();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Array<{ role: string; content: string }>;
      if (!Array.isArray(parsed)) return;

      const restored = parsed.filter(
        (item): item is ChatMessage =>
          typeof item?.content === "string" &&
          (item?.role === "user" || item?.role === "assistant"),
      );

      setMessages(restored);
    } catch (error) {
      console.error("No se pudo restaurar historial de chat:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(messages),
      );
    } catch (error) {
      console.error("No se pudo guardar historial de chat:", error);
    }
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping, contactMode]);

  const canSendMessage = useMemo(
    () => !!input.trim() && !isTyping && !isSendingContact,
    [input, isTyping, isSendingContact],
  );

  const appendMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const sendChatRequest = async (historyWithUserMessage: ChatMessage[]) => {
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyWithUserMessage }),
      });

      if (!response.ok) {
        throw new Error("No se pudo contactar al asistente. Intenta de nuevo.");
      }

      const data = await response.json();
      const assistantContent =
        data?.message ?? data?.reply ?? data?.choices?.[0]?.message?.content;

      if (typeof assistantContent !== "string" || !assistantContent.trim()) {
        appendMessage({
          role: "assistant",
          content: "No se pudo contactar al asistente. Intenta de nuevo.",
        });
        return;
      }

      appendMessage({ role: "assistant", content: assistantContent.trim() });
    } catch (error) {
      console.error("Chat error:", error);
      appendMessage({
        role: "assistant",
        content: "No se pudo contactar al asistente. Intenta de nuevo.",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSendMessage) return;

    const text = input.trim();
    const userMessage: ChatMessage = { role: "user", content: text };
    const historyWithUserMessage = [...messages, userMessage];

    appendMessage(userMessage);
    setInput("");

    if (isContactIntent(text)) {
      setContactMode(true);
      setContactErrors({});
      appendMessage({
        role: "assistant",
        content:
          "Claro, compárteme tu nombre, correo y mensaje en el formulario para contactarte.",
      });
      return;
    }

    await sendChatRequest(historyWithUserMessage);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingContact) return;

    const nextErrors: Partial<ContactForm> = {};
    const trimmedName = contactForm.name.trim();
    const trimmedEmail = contactForm.email.trim();
    const trimmedMessage = contactForm.message.trim();

    if (!trimmedName) nextErrors.name = "Tu nombre es requerido.";
    if (!trimmedEmail) {
      nextErrors.email = "Tu correo es requerido.";
    } else if (!isValidEmail(trimmedEmail)) {
      nextErrors.email = "Escribe un correo válido.";
    }
    if (!trimmedMessage) {
      nextErrors.message = "Tu mensaje es requerido.";
    } else if (trimmedMessage.length < 10) {
      nextErrors.message = "El mensaje debe tener al menos 10 caracteres.";
    }

    setContactErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSendingContact(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          message: trimmedMessage,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload?.ok !== true) {
        appendMessage({ role: "assistant", content: "No se pudo enviar. Intenta más tarde." });
        return;
      }

      appendMessage({ role: "assistant", content: "Listo, mensaje enviado ✅" });
      setContactForm({ name: "", email: "", message: "" });
      setContactErrors({});
      setContactMode(false);
    } catch (error) {
      console.error("Contact error:", error);
      appendMessage({
        role: "assistant",
        content: "No se pudo enviar. Intenta más tarde.",
      });
    } finally {
      setIsSendingContact(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setContactMode(false);
    setContactForm({ name: "", email: "", message: "" });
    setContactErrors({});
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      console.error("No se pudo limpiar historial:", error);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 sm:right-8 w-[350px] h-[500px] max-h-[80vh] bg-card border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{t("chat.title")}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  onClick={handleClearChat}
                >
                  Limpiar
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-4">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground mt-10 p-6 bg-muted/30 rounded-xl">
                    {t("chat.empty")}
                  </div>
                )}
                
                {messages.map((msg, index) => (
                  <div key={`${msg.role}-${index}-${msg.content.slice(0, 16)}`} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"}`}>
                      {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>
                    <div className={`text-sm px-4 py-2.5 rounded-2xl max-w-[80%] leading-relaxed ${
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-muted text-foreground rounded-tl-none border border-border/50"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3" />
                    </div>
                    <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-none border border-border/50 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Escribiendo…</span>
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-foreground/40 rounded-full" />
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-foreground/40 rounded-full" />
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-foreground/40 rounded-full" />
                    </div>
                  </div>
                )}

                {contactMode && (
                  <div className="bg-muted/30 border border-border/60 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Formulario de contacto
                    </p>
                    <form onSubmit={handleContactSubmit} className="space-y-2">
                      <div>
                        <Input
                          value={contactForm.name}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Tu nombre"
                          className="h-9"
                        />
                        {contactErrors.name && (
                          <p className="text-[11px] text-destructive mt-1">{contactErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          type="email"
                          value={contactForm.email}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          placeholder="Tu correo"
                          className="h-9"
                        />
                        {contactErrors.email && (
                          <p className="text-[11px] text-destructive mt-1">{contactErrors.email}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          value={contactForm.message}
                          onChange={(e) =>
                            setContactForm((prev) => ({
                              ...prev,
                              message: e.target.value,
                            }))
                          }
                          placeholder="Tu mensaje"
                          className="h-9"
                        />
                        {contactErrors.message && (
                          <p className="text-[11px] text-destructive mt-1">{contactErrors.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-9"
                        disabled={isSendingContact}
                      >
                        {isSendingContact ? "Enviando..." : "Enviar contacto"}
                      </Button>
                    </form>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t border-border bg-background">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("chat.placeholder")}
                  className="rounded-full focus-visible:ring-1 focus-visible:ring-primary/20 bg-muted/50 border-transparent hover:border-border"
                />
                <Button type="submit" size="icon" disabled={!canSendMessage} className="rounded-full shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="icon"
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 h-12 w-12 rounded-full shadow-xl shadow-primary/20 z-50 transition-transform hover:scale-105"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
      </Button>
    </>
  );
}
