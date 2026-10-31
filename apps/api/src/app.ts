import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { secureHeaders } from "hono/secure-headers";
import { ZodError } from "zod";
import {
  answerChallengeSchema,
  chooseActionSchema,
  healthSchema,
  startStorySchema,
  type ModelStatus,
} from "@final-cut/shared";
import { StoryError } from "./domain/errors.ts";
import type { StoryService } from "./story/service.ts";

export function createApp(service: StoryService, modelStatus: () => Promise<ModelStatus>) {
  const app = new Hono();
  app.use("/api/*", secureHeaders());
  app.use(
    "/api/*",
    bodyLimit({
      maxSize: 8192,
      onError: (c) =>
        c.json(
          {
            error: {
              code: "BODY_TOO_LARGE",
              message: "Keep the scene description under 2,000 characters.",
            },
          },
          413,
        ),
    }),
  );
  app.get("/api/health", (c) => c.json(healthSchema.parse({ status: "ok", name: "Final Cut" })));
  app.get("/api/model", async (c) => c.json(await modelStatus()));
  app.post("/api/stories", async (c) => {
    const { prompt } = startStorySchema.parse(await c.req.json());
    return c.json(await service.start(prompt), 201);
  });
  app.get("/api/stories/:id", (c) => c.json(service.get(c.req.param("id"))));
  app.post("/api/stories/:id/actions", async (c) => {
    const command = chooseActionSchema.parse(await c.req.json());
    return c.json(service.choose(c.req.param("id"), command.revision, command.actionId));
  });
  app.post("/api/stories/:id/answers", async (c) => {
    const command = answerChallengeSchema.parse(await c.req.json());
    return c.json(await service.answer(c.req.param("id"), command.revision, command.optionId));
  });
  app.notFound((c) =>
    c.json({ error: { code: "NOT_FOUND", message: "This route does not exist." } }, 404),
  );
  app.onError((error, c) => {
    if (error instanceof StoryError)
      return c.json({ error: { code: error.code, message: error.message } }, error.status);
    if (error instanceof ZodError || error instanceof SyntaxError)
      return c.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: "The request is incomplete or invalid. Check your input and try again.",
          },
        },
        400,
      );
    console.error("API request failed:", error.message);
    return c.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Something went wrong. Your story is still here; try again.",
        },
      },
      500,
    );
  });
  return app;
}
