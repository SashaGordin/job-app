import type { Request, Response } from "express";
import { runScan } from "../../scan/runScan.js";

export async function scanNowHandler(_req: Request, res: Response): Promise<void> {
  const result = await runScan();
  res.status(200).json(result);
}
