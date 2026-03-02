import { useEffect } from "react";
import { apiUrl } from "@/lib/apiBase";

const VISITOR_KEY = "portfolio_visitor_id";

function getVisitorId(): string {
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;

    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(VISITOR_KEY, newId);
    return newId;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

interface UseBlogAnalyticsOptions {
  blogSlug?: string | null;
  path?: string;
}

export function useBlogAnalytics(options: UseBlogAnalyticsOptions = {}) {
  useEffect(() => {
    let active = true;
    let completed = false;
    let visitId: number | null = null;
    const startedAt = Date.now();

    const visitorId = getVisitorId();
    const path = options.path || window.location.pathname;
    const referrer = document.referrer || null;

    const startVisit = async () => {
      try {
        const response = await fetch(apiUrl("/api/analytics/blog-visits/start"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            visitorId,
            path,
            blogSlug: options.blogSlug || null,
            referrer,
          }),
        });

        if (!response.ok) return;
        const data = await response.json();
        if (!active) return;
        if (typeof data?.visitId === "number") {
          visitId = data.visitId;
        }
      } catch {
        // silently ignore
      }
    };

    void startVisit();

    const finishVisit = () => {
      if (completed || !visitId) return;
      completed = true;

      const durationSeconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
      const payload = JSON.stringify({ visitId, durationSeconds });
      const endUrl = apiUrl("/api/analytics/blog-visits/end");

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], { type: "application/json" });
        navigator.sendBeacon(endUrl, blob);
        return;
      }

      void fetch(endUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        finishVisit();
      }
    };

    window.addEventListener("pagehide", finishVisit);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", finishVisit);
      finishVisit();
    };
  }, [options.blogSlug, options.path]);
}
