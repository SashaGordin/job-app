import type Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CONFIG } from "../config/env.js";
import { createConnection } from "./connection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, "migrations");

export function runMigrations(db: Database.Database, migrationsDir: string = MIGRATIONS_DIR): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `);

  const applied = new Set(
    db
      .prepare("SELECT id FROM schema_migrations")
      .all()
      .map((row) => (row as { id: string }).id),
  );

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    const applyMigration = db.transaction(() => {
      db.exec(sql);
      db.prepare("INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)").run(
        file,
        new Date().toISOString(),
      );
    });
    applyMigration();
  }
}

const isMain = process.argv[1] !== undefined && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const db = createConnection(CONFIG.dbPath);
  runMigrations(db);
  console.log(`Migrations applied against ${CONFIG.dbPath}`);
  db.close();
}
