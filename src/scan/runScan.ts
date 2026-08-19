export interface ScanResult {
  ranAt: string;
  status: "ok";
  note: string;
}

export async function runScan(): Promise<ScanResult> {
  const ranAt = new Date().toISOString();
  console.log(`[scan] no-op scan ran at ${ranAt}`);
  return {
    ranAt,
    status: "ok",
    note: "no-op stub — discovery adapters land in a later phase",
  };
}
