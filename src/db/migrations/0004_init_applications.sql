CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER NOT NULL REFERENCES job_postings (id),
  state TEXT NOT NULL,
  tailored_resume_ref TEXT,
  cover_letter_ref TEXT,
  diff_json TEXT,
  created_at TEXT,
  submitted_at TEXT
);
