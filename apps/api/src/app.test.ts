import { describe, expect, it } from "vite-plus/test";
import { createApp } from "./app.ts";
import { StoryService } from "./story/service.ts";
import { createTestNarrator } from "./testing/narrator.ts";

function testApp() {
  return createApp(new StoryService(createTestNarrator(), () => 0), async () => ({
    available: true,
    model: "test",
    message: "Ready",
  }));
}
describe("API foundation", () => {
  it("answers health checks without contacting the model", async () => {
    const response = await testApp().request("/api/health");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok", name: "Cloze Call" });
  });
  it("rejects malformed JSON and incomplete story descriptions", async () => {
    const app = testApp();
    for (const body of ["{broken", JSON.stringify({ prompt: "short" })]) {
      const response = await app.request("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      expect(response.status).toBe(400);
    }
  });
  it("returns a structured error for expired stories", async () => {
    const response = await testApp().request("/api/stories/missing");
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ error: { code: "NOT_FOUND" } });
  });
  it("plays a complete story through the public API without exposing the answer key early", async () => {
    const app = testApp();
    const json = (value: unknown) => ({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    const response = await app.request(
      "/api/stories",
      json({ prompt: "An original woods chase at Crystal Lake." }),
    );
    expect(response.status).toBe(201);
    const { runSchema } = await import("@cloze-call/shared");
    const opening = runSchema.parse(await response.json());
    const scene = opening.entries[0]!;
    if (scene.kind !== "scene") throw new Error("Missing opening scene");
    const chosen = runSchema.parse(
      await (
        await app.request(
          `/api/stories/${opening.id}/actions`,
          json({ revision: 0, actionId: scene.actions[0]!.id }),
        )
      ).json(),
    );
    expect(JSON.stringify(chosen)).not.toContain("correctOptionId");
    const challenge = chosen.entries.findLast((entry) => entry.kind === "challenge")!;
    const optionId = challenge.options.find((option) => option.text === "keep")!.id;
    const ended = runSchema.parse(
      await (
        await app.request(
          `/api/stories/${opening.id}/answers`,
          json({ revision: chosen.revision, optionId }),
        )
      ).json(),
    );
    expect(ended.phase).toBe("ended");
    expect(ended.entries.at(-1)).toMatchObject({ verdict: "escaped" });
    const duplicate = await app.request(
      `/api/stories/${opening.id}/answers`,
      json({ revision: chosen.revision, optionId }),
    );
    expect(duplicate.status).toBe(409);
  });
});
