import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
import { readConfig } from "./config.ts";
import { createOllamaNarrator, getOllamaStatus } from "./providers/ollama.ts";
import { StoryService } from "./story/service.ts";

const config = readConfig();
const service = new StoryService(createOllamaNarrator(config));
const app = createApp(service, () => getOllamaStatus(config));
serve({ fetch: app.fetch, hostname: "127.0.0.1", port: config.PORT }, (info) => {
  console.log(`Cloze Call API: http://127.0.0.1:${info.port}`);
});
