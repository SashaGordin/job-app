CREATE TABLE submission_log (
  application_id INTEGER NOT NULL REFERENCES applications (id),
  platform TEXT NOT NULL,
  submitted_at TEXT,
  response_status TEXT
);
