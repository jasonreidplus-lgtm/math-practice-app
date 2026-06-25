PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS subjects (
  subject_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS source_files (
  source_id TEXT PRIMARY KEY,
  source_path TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL CHECK (source_type IN ('question', 'solution', 'asset', 'other')),
  year INTEGER,
  paper TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
  question_id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(subject_id),
  year INTEGER NOT NULL,
  paper TEXT NOT NULL,
  paper_slug TEXT NOT NULL,
  question_no INTEGER NOT NULL,
  content_md TEXT NOT NULL,
  source_path TEXT NOT NULL,
  relative_source_path TEXT NOT NULL DEFAULT '',
  has_assets INTEGER NOT NULL DEFAULT 0 CHECK (has_assets IN (0, 1)),
  quality_status TEXT NOT NULL DEFAULT 'ok' CHECK (quality_status IN ('ok', 'manual_check')),
  search_text TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solutions (
  solution_id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  question_no INTEGER NOT NULL,
  chunk_no INTEGER,
  source_chunk_index INTEGER,
  content_md TEXT NOT NULL,
  source_path TEXT NOT NULL,
  quality_status TEXT NOT NULL DEFAULT 'ok' CHECK (quality_status IN ('ok', 'manual_check')),
  map_method TEXT NOT NULL DEFAULT '',
  match_score REAL,
  direct_key TEXT NOT NULL DEFAULT '',
  best_chunk_no INTEGER,
  best_score REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS question_assets (
  asset_id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  asset_ref TEXT NOT NULL,
  resolved_path TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS tags (
  tag_id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS question_tags (
  question_id TEXT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
  PRIMARY KEY (question_id, tag_id)
);

CREATE TABLE IF NOT EXISTS practice_records (
  record_id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unseen' CHECK (status IN ('unseen', 'done', 'wrong', 'review')),
  favorite INTEGER NOT NULL DEFAULT 0 CHECK (favorite IN (0, 1)),
  manual_flag INTEGER NOT NULL DEFAULT 0 CHECK (manual_flag IN (0, 1)),
  reason TEXT NOT NULL DEFAULT '',
  answer TEXT NOT NULL DEFAULT '',
  thought TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  seconds INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS review_tasks (
  task_id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('manual_check', 'missing_solution', 'needs_fix')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'needs_fix', 'fixed', 'skipped')),
  note TEXT NOT NULL DEFAULT '',
  priority INTEGER NOT NULL DEFAULT 0,
  due_at TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solution_overrides (
  override_id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
  content_md TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'rejected')),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_year_no ON questions(year, paper_slug, question_no);
CREATE INDEX IF NOT EXISTS idx_questions_quality ON questions(quality_status);
CREATE INDEX IF NOT EXISTS idx_solutions_question ON solutions(question_id);
CREATE INDEX IF NOT EXISTS idx_solutions_quality ON solutions(quality_status);
CREATE INDEX IF NOT EXISTS idx_practice_question ON practice_records(question_id);
CREATE INDEX IF NOT EXISTS idx_review_status ON review_tasks(status, task_type);
