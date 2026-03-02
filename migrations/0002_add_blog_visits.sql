CREATE TABLE IF NOT EXISTS blog_visits (
  id serial PRIMARY KEY,
  visitor_id text NOT NULL,
  path text NOT NULL,
  blog_slug text,
  ip text,
  user_agent text,
  referrer text,
  started_at timestamp DEFAULT now() NOT NULL,
  ended_at timestamp,
  duration_seconds integer
);

CREATE INDEX IF NOT EXISTS idx_blog_visits_started_at
  ON blog_visits (started_at DESC);

CREATE INDEX IF NOT EXISTS idx_blog_visits_slug
  ON blog_visits (blog_slug);
