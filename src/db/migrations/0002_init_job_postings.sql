CREATE TABLE job_postings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  location TEXT,
  url TEXT,
  description TEXT,
  posted_at TEXT,
  discovered_at TEXT,
  raw_json TEXT,
  UNIQUE (source, external_id)
);
