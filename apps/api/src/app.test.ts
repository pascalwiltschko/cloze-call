import { describe, expect, it } from "vite-plus/test";
import { createApp } from "./app.ts";
describe("API foundation", () => {
  it("answers health checks without contacting the model", async () => {
    const response = await createApp().request("/api/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", name: "Final Cut" });
  });
});
