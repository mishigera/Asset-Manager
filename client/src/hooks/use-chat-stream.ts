import { useState, useCallback } from "react";
import { streams } from "@shared/routes";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function useChatStream() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantMessageId, role: "assistant", content: "" }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) throw new Error("Chat request failed");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          
          // Basic SSE parsing logic (handling "data: {...}\n\n")
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                const parsed = streams.chat.chunk.parse(data);
                
                setMessages((prev) => 
                  prev.map((msg) => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: msg.content + parsed.text } 
                      : msg
                  )
                );
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === assistantMessageId 
            ? { ...msg, content: "Lo siento, ha ocurrido un error de conexión." } 
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  }, []);

  return { messages, sendMessage, isTyping };
}
