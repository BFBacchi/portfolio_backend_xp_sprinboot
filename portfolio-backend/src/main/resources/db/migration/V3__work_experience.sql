CREATE TABLE work_experience (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES portfolio_users (id) ON DELETE CASCADE,
  company VARCHAR(255) NOT NULL,
  role_title VARCHAR(255),
  period_label VARCHAR(120),
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_work_experience_user ON work_experience (user_id);
