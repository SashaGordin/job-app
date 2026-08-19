import { CONFIG } from "./config/env.js";
import { createConnection } from "./db/connection.js";
import { runMigrations } from "./db/migrate.js";
import { createApp } from "./http/app.js";
import { startScheduler } from "./scheduler/cron.js";

const db = createConnection(CONFIG.dbPath);
runMigrations(db);
db.close();

const app = createApp();
app.listen(CONFIG.port, () => {
  console.log(`[server] listening on port ${CONFIG.port}`);
});

startScheduler();
