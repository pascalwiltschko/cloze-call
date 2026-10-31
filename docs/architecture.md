# Architecture

The pnpm workspace separates the React client (`apps/web`), Hono API (`apps/api`), and Zod wire contracts (`packages/shared`). Vite+ supplies Vite, Oxlint, Oxfmt, Vitest, and package builds. TypeScript runs in strict mode throughout.

The browser talks only to the API. The API owns sessions, answer keys, command validation, random resolution, and the LangChain/Ollama adapter. Shared schemas validate both requests and responses; internal session objects are never serialized directly.

The game service accepts a narrator and random source. The narrator writes fiction within a resolved event; it cannot grade answers or decide whether the player survives. The service commits an outcome before inference so retries cannot reroll it.

Sessions are in memory for this local prototype. Restarting the API loses them. Production persistence, authentication, multiplayer, streaming, image generation, and retrieval are outside the initial scope.

Tests cover observable transitions and API behavior with a fake narrator. A live Ollama smoke test is a separate integration check. The web build and server bundle must both compile before handoff.

## Module boundaries

```text
apps/web/src/
  components/ui/       shadcn primitives
  features/story/      scene, action, cloze, ending views and session controller
  lib/api.ts           validated HTTP client
apps/api/src/
  domain/              reviewed exercises, random outcome rules, domain errors
  story/               command service, narrator port, in-memory session storage
  providers/ollama.ts  LangChain prompt and local model adapter
  app.ts               Hono factory and HTTP boundary
  server.ts            environment configuration and dependency composition
packages/shared/src/   public Zod contracts and starter prompt content
```

The frontend session controller handles side effects and safe retries; presentation components receive public run entries and callbacks. A transcript is append-only during play. The browser stores only the current run ID and reloads the authoritative run on refresh.

Actions and their exercise introductions are generated with a scene, but only action IDs and labels are initially projected. Selecting one reveals its prepared challenge without another inference request. Answer options receive shuffled opaque IDs. Keys stay inside the API until resolved feedback is appended.

The command service checks run revision and phase, rejects concurrent mutation, grades the selected option, and stores a pending event before awaiting the narrator. A provider failure retains that event; GET exposes only the pending option ID. A successful retry appends one feedback entry and the resolved scene/ending within the command's critical section.

The local shared package exports TypeScript source for development. The frontend build transpiles it, and the API bundle explicitly includes it so production startup does not need to interpret workspace TypeScript. Third-party server dependencies remain external.
