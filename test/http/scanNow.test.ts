import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { scanNowHandler } from "../../src/http/routes/scanNow.js";

function mockResponse(): Response {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("scanNowHandler", () => {
  it("invokes the scan and responds with its result as JSON", async () => {
    const req = {} as Request;
    const res = mockResponse();

    await scanNowHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: "ok", ranAt: expect.any(String) }),
    );
  });
});
