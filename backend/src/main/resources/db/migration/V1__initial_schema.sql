-- users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ
);

-- verification_tokens
CREATE TABLE verification_tokens (
  id SERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  CONSTRAINT fk_verification_token_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_verification_tokens_user_id
ON verification_tokens(user_id);

-- essay_groups
CREATE TABLE essay_groups (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  position INT NOT NULL,
  name TEXT NOT NULL,
  CONSTRAINT fk_essay_groups_users FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_essay_groups_id_user UNIQUE (id, user_id),
  CONSTRAINT uq_essay_groups_user_name UNIQUE (user_id, name),
  CONSTRAINT uq_essay_groups_user_position UNIQUE (user_id, position)
);

-- companies
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  position INT NOT NULL,
  name TEXT NOT NULL,
  priority SMALLINT NOT NULL,
  widget_basic_info BOOLEAN NOT NULL DEFAULT FALSE,
  widget_links BOOLEAN NOT NULL DEFAULT FALSE,
  widget_selection BOOLEAN NOT NULL DEFAULT FALSE,
  widget_note BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  CONSTRAINT fk_companies_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_companies_id_user UNIQUE (id, user_id),
  CONSTRAINT uq_companies_user_name UNIQUE (user_id, name),
  CONSTRAINT uq_companies_user_priority_position UNIQUE (user_id, priority, position),
  CONSTRAINT chk_companies_priority CHECK(priority BETWEEN 0 AND 6)
);

CREATE INDEX idx_companies
ON companies(user_id);

-- company_documents
CREATE TABLE company_documents (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL,
  position INT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  CONSTRAINT fk_company_documents_companies FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT uq_company_documents_company_position UNIQUE (company_id, position)
);

CREATE INDEX idx_company_documents
ON company_documents(company_id);

-- company_infos
CREATE TABLE company_basic_infos (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL,
  position INT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  CONSTRAINT fk_company_infos_companies FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT uq_company_basic_infos_company_position UNIQUE (company_id, position)
);

CREATE INDEX idx_company_basic_infos
ON company_basic_infos(company_id);

-- company_urls
CREATE TABLE company_urls (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL,
  position INT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  CONSTRAINT fk_company_urls_companies FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT uq_company_urls_company_position UNIQUE (company_id, position)
);

CREATE INDEX idx_company_urls
ON company_urls(company_id);

-- selections
CREATE TABLE selections (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL,
  title TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_selections_companies FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idx_selections
ON selections(company_id);

CREATE UNIQUE INDEX uq_selections_active_company
ON selections(company_id)
WHERE is_active = TRUE;

-- selection_steps
CREATE TABLE selection_steps (
  id SERIAL PRIMARY KEY,
  selection_id INT NOT NULL,
  step_no SMALLINT NOT NULL,
  title TEXT NOT NULL,
  held_at TIMESTAMPTZ,
  note TEXT,
  status TEXT NOT NULL,
  CONSTRAINT fk_selection_steps_selections FOREIGN KEY(selection_id) REFERENCES selections(id) ON DELETE CASCADE,
  CONSTRAINT uq_selections_steps_selection_step_no UNIQUE (selection_id, step_no),
  CONSTRAINT chk_selection_steps_status CHECK (status IN ('not_started', 'pending', 'passed', 'failed'))
);

CREATE INDEX idx_selection_steps
ON selection_steps(selection_id);

-- events
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  company_id INT,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  is_all_day BOOLEAN NOT NULL DEFAULT FALSE,
  start_date DATE,
  end_date DATE,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  is_attending BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_events_users FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_events_company_owner FOREIGN KEY(company_id, user_id) REFERENCES companies(id, user_id) ON DELETE CASCADE,
  CONSTRAINT chk_events_category CHECK (category IN ('session', 'chat', 'interview', 'internship', 'other')),
  CONSTRAINT chk_events_date CHECK (end_date >= start_date),
  CONSTRAINT chk_events_datetime CHECK (end_time > start_time),
  CONSTRAINT chk_events_all_day CHECK (
    (
      is_all_day = TRUE
      AND start_date IS NOT NULL
      AND end_date IS NOT NULL
      AND start_time IS NULL
      AND end_time IS NULL
    )
    OR
    (
      is_all_day = FALSE
      AND start_time IS NOT NULL
      AND end_time IS NOT NULL
      AND start_date IS NULL
      AND end_date IS NULL
    )
  )
);

CREATE INDEX idx_events
ON events(user_id);

CREATE INDEX idx_events_company_owner
ON events(company_id, user_id);

-- tasks
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  company_id INT,
  title TEXT NOT NULL,
  note TEXT,
  deadline TIMESTAMPTZ,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_tasks_users FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tasks_company_owner FOREIGN KEY(company_id, user_id) REFERENCES companies(id, user_id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks
ON tasks(user_id);

CREATE INDEX idx_tasks_user_deadline
ON tasks(user_id, deadline);

CREATE INDEX idx_tasks_company_owner
ON tasks(company_id, user_id);

-- essays
CREATE TABLE essays (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  company_id INT,
  essay_group_id INT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  CONSTRAINT fk_essays_users FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_essays_company_owner FOREIGN KEY(company_id, user_id) REFERENCES companies(id, user_id) ON DELETE CASCADE,
  CONSTRAINT fk_essays_group_owner FOREIGN KEY(essay_group_id, user_id) REFERENCES essay_groups(id, user_id) ON DELETE RESTRICT
);

CREATE INDEX idx_essays
ON essays(user_id);

CREATE INDEX idx_essays_company_owner
ON essays(company_id, user_id);

CREATE INDEX idx_essays_group_owner
ON essays(essay_group_id, user_id);

-- documents

CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  position INT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  CONSTRAINT fk_documents_users FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_documents_user_position UNIQUE (user_id, position)
);

CREATE INDEX idx_documents
ON documents(user_id);
