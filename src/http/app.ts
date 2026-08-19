import express, { type Express } from "express";
import { healthHandler } from "./routes/health.js";
import { scanNowHandler } from "./routes/scanNow.js";

export function createApp(): Express {
  const app = express();
  app.get("/health", healthHandler);
  app.post("/scan-now", scanNowHandler);
  return app;
}
