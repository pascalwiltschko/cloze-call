import { z } from "zod";
import type { Exercise } from "../domain/exercises.ts";
import type { StoryEvent } from "../domain/rules.ts";

export const narrationSchema = z.object({
  loadingMessage: z.string().optional(),
  title: z.string().min(1).max(100),
  narration: z.string().min(30).max(1800),
  summary: z.string().min(1).max(700),
  actions: z
    .array(z.object({ label: z.string().min(3).max(120), leadIn: z.string().min(5).max(350) }))
    .max(3),
  recoveryLeadIn: z.string().max(350),
});

export type Narration = z.infer<typeof narrationSchema>;
export interface NarrationRequest {
  prompt: string;
  summary: string;
  event: "opening" | StoryEvent;
  action: string | null;
  correct: boolean | null;
  exercises: readonly Exercise[];
}
export interface Narrator {
  narrate: (request: NarrationRequest) => Promise<Narration>;
}
