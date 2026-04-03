-- Usuarios del panel (portfolio Windows XP)
CREATE TABLE portfolio_users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE about_me (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE REFERENCES portfolio_users (id) ON DELETE CASCADE,
  headline VARCHAR(255),
  bio TEXT,
  tagline VARCHAR(400),
  luna_quote VARCHAR(500),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE projects (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES portfolio_users (id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  project_url VARCHAR(500),
  technologies VARCHAR(500),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE education (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES portfolio_users (id) ON DELETE CASCADE,
  institution VARCHAR(255) NOT NULL,
  degree VARCHAR(255),
  period_label VARCHAR(120),
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE skills (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES portfolio_users (id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(80),
  notes VARCHAR(500),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects (user_id);
CREATE INDEX idx_education_user ON education (user_id);
CREATE INDEX idx_skills_user ON skills (user_id);
