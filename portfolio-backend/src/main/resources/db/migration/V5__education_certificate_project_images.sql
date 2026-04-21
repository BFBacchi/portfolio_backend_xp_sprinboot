-- Idempotente: si ya aplicaste el SQL a mano, Flyway puede completar V5 sin error.
ALTER TABLE education
  ADD COLUMN IF NOT EXISTS certificate_url VARCHAR(2048);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS image_url_1 VARCHAR(2048);

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS image_url_2 VARCHAR(2048);
