-- users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP
);

-- verification_tokens
CREATE TABLE verification_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_verification_token_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_verification_tokens_user_id
ON verification_tokens(user_id);

-- company_industries
CREATE TABLE company_industries (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  name TEXT NOT NULL,
  CONSTRAINT fk_company_industries_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_company_industries
ON company_industries(user_id);

-- essay_groups
CREATE TABLE essay_groups (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  name TEXT NOT NULL,
  CONSTRAINT fk_essays_users FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_essay_groups_user_name UNIQUE (user_id, name)
);

-- companies
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  name TEXT NOT NULL,
  industry_id INT NOT NULL,
  priority SMALLINT,
  basic_info JSONB,
  text TEXT,
  CONSTRAINT fk_companies_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_companies_company_industries FOREIGN KEY(industry_id) REFERENCES company_industries(id) ON DELETE RESTRICT,
  CONSTRAINT uq_companies_user_name UNIQUE (user_id, name),
  CONSTRAINT chk_companies_priority CHECK(priority BETWEEN 1 AND 5)
);

CREATE INDEX idx_companies
ON companies(user_id);

CREATE INDEX idx_companies_user_priority
ON companies(user_id, priority);

-- company_urls
CREATE TABLE company_urls (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  CONSTRAINT fk_company_urls_companies FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_company_urls
ON company_urls(company_id);

-- events
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  company_id INT,
  title TEXT NOT NULL,
  notes TEXT,
  starts_at TIMESTAMP NOT NULL,
  ends_at TIMESTAMP NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  is_attending BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_events_users FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_events_companies FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_events
ON events(user_id);

-- selections
CREATE TABLE selections (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL,
  type TEXT NOT NULL,
  CONSTRAINT fk_selections_companies FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_selections
ON selections(company_id);

-- selection_steps
CREATE TABLE selection_steps (
  id SERIAL PRIMARY KEY,
  selection_id INT NOT NULL,
  step_no SMALLINT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL,
  CONSTRAINT fk_selection_steps_selections FOREIGN KEY(selection_id) REFERENCES selections(id) ON DELETE CASCADE,
  CONSTRAINT chk_selection_steps_status CHECK (status IN ('pending', 'passed', 'failed'))
);

CREATE INDEX idx_selection_steps
ON selection_steps(selection_id);

-- tasks
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  company_id INT,
  title TEXT NOT NULL,
  details TEXT,
  deadline TIMESTAMP,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_tasks_users FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_companies FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks
ON tasks(user_id);

CREATE INDEX idx_tasks_user_deadline
ON tasks(user_id, deadline);

-- essays
CREATE TABLE essays (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  company_id INT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  essay_group_id INT NOT NULL,
  CONSTRAINT fk_essays_users FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_essays_companies FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_essays_essay_groups FOREIGN KEY(essay_group_id) REFERENCES essay_groups(id) ON DELETE RESTRICT 
);

CREATE INDEX idx_essays
ON essays(user_id);
