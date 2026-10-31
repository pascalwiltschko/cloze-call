# Architecture

The pnpm workspace separates the React client (`apps/web`), Hono API (`apps/api`), and Zod wire contracts (`packages/shared`). Vite+ supplies Vite, Oxlint, Oxfmt, Vitest, and package builds. TypeScript runs in strict mode throughout.

The browser talks only to the API. The API owns sessions, answer keys, command validation, random resolution, and the LangChain/Ollama adapter. Shared schemas validate both requests and responses; internal session objects are never serialized directly.

The game service accepts a narrator and random source. The narrator writes fiction within a resolved event; it cannot grade answers or decide whether the player survives. The service commits an outcome before inference so retries cannot reroll it.

Sessions are in memory for this local prototype. Restarting the API loses them. Production persistence, authentication, multiplayer, streaming, image generation, and retrieval are outside the initial scope.

Tests cover observable transitions and API behavior with a fake narrator. A live Ollama smoke test is a separate integration check. The web build and server bundle must both compile before handoff.
