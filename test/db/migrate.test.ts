import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { runMigrations } from "../../src/db/migrate.js";

function tableNames(db: Database.Database): string[] {
  return db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all()
    .map((row) => (row as { name: string }).name);
}

describe("runMigrations", () => {
  it("creates all five core tables plus the migrations tracking table", () => {
    const db = new Database(":memory:");

    runMigrations(db);

    expect(tableNames(db)).toEqual(
      expect.arrayContaining([
        "applications",
        "job_postings",
        "job_scores",
        "profile",
        "schema_migrations",
        "submission_log",
      ]),
    );
  });

  it("is idempotent: running twice does not error or duplicate migration records", () => {
    const db = new Database(":memory:");

    runMigrations(db);
    runMigrations(db);

    const { count } = db.prepare("SELECT COUNT(*) as count FROM schema_migrations").get() as {
      count: number;
    };
    expect(count).toBe(5);
  });

  it("enforces the (source, external_id) dedupe constraint on job_postings", () => {
    const db = new Database(":memory:");
    runMigrations(db);

    const insert = db.prepare(
      "INSERT INTO job_postings (source, external_id, title) VALUES (?, ?, ?)",
    );
    insert.run("greenhouse", "abc123", "Engineer");

    expect(() => insert.run("greenhouse", "abc123", "Engineer (dup)")).toThrow();
  });
});
