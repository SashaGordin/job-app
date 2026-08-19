CREATE TABLE job_scores (
  job_id INTEGER NOT NULL REFERENCES job_postings (id),
  role_tier_score REAL,
  seniority_score REAL,
  tech_fit_score REAL,
  location_score REAL,
  comp_score REAL,
  industry_score REAL,
  total_score REAL,
  bucket TEXT
);
