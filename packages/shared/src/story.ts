import { z } from "zod";

const id = z.uuid();
export const optionSchema = z.object({ id, text: z.string() });
export const actionSchema = z.object({ id, label: z.string() });
export const sceneEntrySchema = z.object({
  kind: z.literal("scene"),
  id,
  title: z.string(),
  text: z.string(),
  recovery: z.boolean(),
  actions: z.array(actionSchema),
});
export const challengeEntrySchema = z.object({
  kind: z.literal("challenge"),
  id,
  attempt: z.string(),
  options: z.array(optionSchema).length(3),
});
export const feedbackEntrySchema = z.object({
  kind: z.literal("feedback"),
  id,
  challengeId: id,
  optionId: id,
  correctOptionId: id,
  correct: z.boolean(),
  expression: z.string(),
  meaning: z.string(),
  completedSentence: z.string(),
});
export const endingEntrySchema = z.object({
  kind: z.literal("ending"),
  id,
  title: z.string(),
  text: z.string(),
  verdict: z.enum(["escaped", "dead"]),
});
export const transcriptEntrySchema = z.discriminatedUnion("kind", [
  sceneEntrySchema,
  z.object({ kind: z.literal("action"), id, text: z.string() }),
  challengeEntrySchema,
  feedbackEntrySchema,
  endingEntrySchema,
]);
export const runSchema = z.object({
  id,
  revision: z.int().nonnegative(),
  title: z.string(),
  prompt: z.string(),
  phase: z.enum(["choosing", "answering", "ended"]),
  entries: z.array(transcriptEntrySchema),
  pendingOptionId: id.nullable(),
});
export const startStorySchema = z.object({ prompt: z.string().trim().min(12).max(2000) });
export const chooseActionSchema = z.object({ revision: z.int().nonnegative(), actionId: id });
export const answerChallengeSchema = z.object({ revision: z.int().nonnegative(), optionId: id });
export const apiErrorSchema = z.object({
  error: z.object({ code: z.string(), message: z.string() }),
});
export const modelStatusSchema = z.object({
  available: z.boolean(),
  model: z.string(),
  message: z.string(),
});

export type StoryRun = z.infer<typeof runSchema>;
export type TranscriptEntry = z.infer<typeof transcriptEntrySchema>;
export type SceneEntry = z.infer<typeof sceneEntrySchema>;
export type ChallengeEntry = z.infer<typeof challengeEntrySchema>;
export type FeedbackEntry = z.infer<typeof feedbackEntrySchema>;
export type EndingEntry = z.infer<typeof endingEntrySchema>;
export type ModelStatus = z.infer<typeof modelStatusSchema>;
