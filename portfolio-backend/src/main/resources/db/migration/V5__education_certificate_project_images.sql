ALTER TABLE education
  ADD COLUMN certificate_url VARCHAR(2048);

ALTER TABLE projects
  ADD COLUMN image_url_1 VARCHAR(2048),
  ADD COLUMN image_url_2 VARCHAR(2048);
