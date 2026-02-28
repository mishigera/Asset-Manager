ALTER TABLE projects
ADD COLUMN IF NOT EXISTS image_key text;

CREATE TABLE IF NOT EXISTS profile (
  id serial PRIMARY KEY,
  about_image_key text,
  about_image_url text,
  cv_key text,
  cv_url text,
  bio text
);

INSERT INTO profile (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
