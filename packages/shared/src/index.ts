import { z } from "zod";
export const healthSchema = z.object({ status: z.literal("ok"), name: z.string() });
export * from "./story.ts";
export * from "./starters.ts";
