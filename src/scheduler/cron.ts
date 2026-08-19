import cron from "node-cron";
import { CONFIG } from "../config/env.js";
import { runScan } from "../scan/runScan.js";

export function startScheduler(): void {
  cron.schedule(CONFIG.scanCron, () => {
    void runScan();
  });
  console.log(`[scheduler] scan scheduled with cron expression "${CONFIG.scanCron}"`);
}
