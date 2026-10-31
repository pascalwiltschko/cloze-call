import { Hono } from "hono";
import { healthSchema } from "@final-cut/shared";
export function createApp() {
  const app = new Hono();
  app.get("/api/health", (c) => c.json(healthSchema.parse({ status: "ok", name: "Final Cut" })));
  return app;
}
