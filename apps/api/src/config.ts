import { z } from "zod";

const environmentSchema = z.object({
  PORT: z.coerce.number().int().min(1024).max(65535).default(3001),
  OLLAMA_BASE_URL: z.url().default("http://127.0.0.1:11434"),
  OLLAMA_MODEL: z.string().min(1).default("gemma4:e4b-it-q4_K_M"),
  MODEL_TIMEOUT_MS: z.coerce.number().int().min(1000).max(300000).default(90000),
});
export type AppConfig = z.infer<typeof environmentSchema>;
export function readConfig(
  environment: Record<string, string | undefined> = process.env,
): AppConfig {
  return environmentSchema.parse(environment);
}
