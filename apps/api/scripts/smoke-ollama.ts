import { starterPrompts } from "@cloze-call/shared";
import { readConfig } from "../src/config.ts";
import { createOllamaNarrator, getOllamaStatus } from "../src/providers/ollama.ts";
import { StoryService } from "../src/story/service.ts";

const config = readConfig();
const status = await getOllamaStatus(config);
if (!status.available) throw new Error(status.message);
const service = new StoryService(createOllamaNarrator(config), () => 0);
const started = performance.now();
const opening = await service.start(starterPrompts[0].prompt);
const scene = opening.entries.find((entry) => entry.kind === "scene")!;
const selected = service.choose(opening.id, opening.revision, scene.actions[0]!.id);
console.log(
  `Opening generated in ${((performance.now() - started) / 1000).toFixed(1)}s: ${opening.title}`,
);
const challenge = selected.entries.find((entry) => entry.kind === "challenge")!;
const answer = challenge.options.find((option) => option.text === "keep")!;
const ended = await service.answer(opening.id, selected.revision, answer.id);
if (ended.phase !== "ended" || ended.entries.at(-1)?.kind !== "ending")
  throw new Error("The live model did not complete the story.");
console.log(
  `Live ${config.OLLAMA_MODEL} opening → action → cloze → ending passed in ${((performance.now() - started) / 1000).toFixed(1)}s.`,
);
