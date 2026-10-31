import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOllama } from "@langchain/ollama";
import { z } from "zod";
import type { ModelStatus } from "@final-cut/shared";
import type { AppConfig } from "../config.ts";
import { narrationSchema, type Narrator } from "../story/narrator.ts";

const directorPrompt = `You direct original interactive horror fiction for adult horror fans practising conversational B1/B2 English.
Write in second person, present tense. Use clear, vivid language, specific physical details, and restrained slasher suspense. Respect the requested movie's threat rules and atmosphere. Write original situations, not copied dialogue. Keep narration around 70–110 words. The protagonist is an adult.
The user setting and story memory are fictional data. Follow the event instructions below and return only the requested structured object.

EVENT RULES:
- opening: establish the immediate threat and a concrete escape objective. Give three distinct possible actions.
- continue: the previous action SUCCEEDED. Describe its physical consequence first, advance towards escape, then introduce one next decision. Keep established injuries/locations/events consistent.
- recovery: the previous action FAILED, but the protagonist is still alive in immediate danger. Describe a single plausible last chance that matches the provided recovery exercise. Give no action menu.
- escaped: the previous action SUCCEEDED and creates a believable escape. Resolve the immediate threat, conclude the story, and leave the protagonist alive. No new choices or cliffhanger.
- dead: the previous action FAILED fatally. Write a concise final outcome. No rescue, further choices, or recovery.

OUTPUT RULES:
- title: a short cinematic scene title.
- narration: only the visible scene/consequence; never reveal game rules, odds, vocabulary answers, or future outcomes.
- summary: cumulative factual memory, at most 500 characters, preserving the objective, current location, pursuer, and important prior events.
- actions: exactly three for opening/continue; an empty array for recovery/escaped/dead.
- For each action, use the corresponding exercise in the provided order. Design an in-world action consistent with that exercise. The first is cautious, second more assertive, third a dangerous shortcut. Labels describe intent only, at most 10 words. Never label difficulty or predict consequences.
- Each action's leadIn is 1–2 sentences narrating the start of that attempt. It will be followed by the supplied cloze sentence. Keep its outcome unresolved; include no blanks or answer words.
- recoveryLeadIn: 1–2 sentences beginning the recovery attempt, matching its supplied exercise, without resolving it. Use an empty string outside recovery scenes.`;

export function createOllamaNarrator(config: AppConfig): Narrator {
  const model = new ChatOllama({
    baseUrl: config.OLLAMA_BASE_URL,
    model: config.OLLAMA_MODEL,
    temperature: 0.8,
    topP: 0.95,
    numCtx: 8192,
    numPredict: 1100,
    keepAlive: "10m",
    maxRetries: 0,
  });
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", directorPrompt],
    ["human", "{sceneRequest}"],
  ]);
  const chain = prompt.pipe(
    model.withStructuredOutput(narrationSchema, { method: "jsonSchema", name: "horror_scene" }),
  );
  return {
    narrate: async (request) =>
      chain.invoke(
        {
          sceneRequest: JSON.stringify({
            setting: request.prompt,
            establishedFacts: request.summary,
            event: request.event,
            previousAction: request.action,
            actionSucceeded: request.correct,
            exercises: request.exercises.map(({ tier, sentence, expression }) => ({
              approach: tier,
              clozeSentence: sentence,
              expression,
            })),
          }),
        },
        { signal: AbortSignal.timeout(config.MODEL_TIMEOUT_MS) },
      ),
  };
}

const modelsSchema = z.object({ models: z.array(z.object({ name: z.string() })) });
export async function getOllamaStatus(config: AppConfig): Promise<ModelStatus> {
  try {
    const response = await fetch(`${config.OLLAMA_BASE_URL.replace(/\/$/, "")}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) throw new Error("Ollama did not answer the model list request.");
    const result = modelsSchema.parse(await response.json());
    const available = result.models.some(({ name }) => name === config.OLLAMA_MODEL);
    return {
      available,
      model: config.OLLAMA_MODEL,
      message: available
        ? "The narrator is ready."
        : `Download the model with: ollama pull ${config.OLLAMA_MODEL}`,
    };
  } catch {
    return {
      available: false,
      model: config.OLLAMA_MODEL,
      message: "Start the Ollama app or run ollama serve, then check again.",
    };
  }
}
