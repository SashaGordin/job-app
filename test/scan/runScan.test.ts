import { describe, expect, it } from "vitest";
import { runScan } from "../../src/scan/runScan.js";

describe("runScan", () => {
  it("returns an ok status with a timestamp", async () => {
    const result = await runScan();

    expect(result.status).toBe("ok");
    expect(new Date(result.ranAt).toString()).not.toBe("Invalid Date");
    expect(typeof result.note).toBe("string");
  });
});
