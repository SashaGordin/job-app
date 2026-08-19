import "dotenv/config";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const CONFIG = {
  port: Number(requireEnv("PORT")),
  dbPath: requireEnv("DB_PATH"),
  scanCron: requireEnv("SCAN_CRON"),
};
