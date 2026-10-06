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

CREATE INDEX idx_essay_groups_user_position
ON essay_groups(user_id, position);

-- companies
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  priority SMALLINT NOT NULL,
  position INT NOT NULL,
  name TEXT NOT NULL,
  show_basic_info_widget BOOLEAN NOT NULL DEFAULT FALSE,
  show_selection_widget BOOLEAN NOT NULL DEFAULT FALSE,
  document TEXT,
  CONSTRAINT fk_companies_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uq_companies_id_user UNIQUE (id, user_id),
  CONSTRAINT uq_companies_user_name UNIQUE (user_id, name),
  CONSTRAINT uq_companies_user_priority_position UNIQUE (user_id, priority, position),
  CONSTRAINT chk_companies_priority CHECK(priority BETWEEN 0 AND 6)
);

CREATE INDEX idx_companies_user_priority_position
ON companies(user_id, priority, position);

-- company_basic_infos
CREATE TABLE company_basic_infos (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL,
  position INT NOT NULL,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  CONSTRAINT fk_company_infos_companies FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT uq_company_basic_infos_company_position UNIQUE (company_id, position)
);

CREATE INDEX idx_company_basic_infos_company_position
ON company_basic_infos(company_id, position);

-- company_activities
CREATE TABLE company_activities (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  by_user BOOLEAN NOT NULL,
  text TEXT NOT NULL,
  CONSTRAINT fk_company_activities_companies FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE
);

CREATE INDEX idk_company_activities_company_occurred_at
ON company_activities(company_id, occurred_at);

-- selections
CREATE TABLE selections (
  id SERIAL PRIMARY KEY,
  company_id INT NOT NULL,
  title TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_selections_companies FOREIGN KEY(company_id) REFERENCES companies(id) ON DELETE CASCADE,
);

CREATE INDEX idx_selections_company
ON selections(company_id);

CREATE UNIQUE INDEX uq_selections_active_company
ON selections(company_id)
WHERE is_active = TRUE;

-- selection_steps
CREATE TABLE selection_steps (
  id SERIAL PRIMARY KEY,
  selection_id INT NOT NULL,
  position INT NOT NULL,
  status TEXT NOT NULL,
  name TEXT NOT NULL,
  note TEXT,
  CONSTRAINT fk_selection_steps_selections FOREIGN KEY(selection_id) REFERENCES selections(id) ON DELETE CASCADE,
  CONSTRAINT uq_selections_steps_selection_step_no UNIQUE (selection_id, step_no),
  CONSTRAINT chk_selection_steps_status CHECK (status IN ('NOT_STARTED', 'PENDING', 'PASSED', 'FAILED'))
);

CREATE INDEX idx_selection_steps_selection_position
ON selection_steps(selection_id, position);

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
  CONSTRAINT chk_events_category CHECK (category IN ('SESSION', 'CHAT', 'INTERVIEW', 'INTERNSHIP', 'OTHER')),
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

CREATE INDEX idx_events_user_start_time
ON events(user_id, start_time);

CREATE INDEX idx_events_user_start_date
ON events(company_id, start_date);

CREATE INDEX idx_events_company_start_time
ON events(company_id, start_time);

CREATE INDEX idx_events_company_start_date
ON events(company_id, start_date);

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

CREATE INDEX idx_tasks_user_deadline
ON tasks(user_id, deadline);

CREATE INDEX idx_tasks_company_deadline
ON tasks(company_id, deadline);

-- essays
CREATE TABLE essays (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  company_id INT,
  essay_group_id INT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  CONSTRAINT fk_essays_users FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_essays_company_owner FOREIGN KEY(company_id, user_id) REFERENCES companies(id, user_id) ON DELETE CASCADE,
  CONSTRAINT fk_essays_group_owner FOREIGN KEY(essay_group_id, user_id) REFERENCES essay_groups(id, user_id) ON DELETE RESTRICT
);

CREATE INDEX idx_essays_essay_group
ON essays(essay_group_id);

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

CREATE INDEX idx_documents_user_position
ON documents(user_id, position);
