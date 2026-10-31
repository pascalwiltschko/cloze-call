# Final Cut

A local horror-fiction prototype for conversational English practice. Choose your action, complete a narrated cloze, and discover whether you make it out.

## Development

Use Node 24 and pnpm (versions pinned in this repository).

```sh
pnpm install
cp .env.example .env
ollama pull gemma4:e4b-it-q4_K_M
pnpm dev
```

Open http://127.0.0.1:5173. The API listens on port 3001; Vite proxies `/api` requests. Ollama runs separately on port 11434. Start it with the Ollama app or `ollama serve`.

```sh
pnpm verify      # format/lint/types, tests, production builds
pnpm test:watch
pnpm format
pnpm --filter @final-cut/api smoke  # real local Gemma opening and ending
```

Husky runs static checks, type checks, and Vitest before each commit. CI runs the same checks plus production builds; model inference is not needed for tests.

## Documentation

- [Product and game loop](docs/product.md)
- [Architecture](docs/architecture.md)
- [Visual and interaction design](docs/design.md)
- [API and retry behavior](docs/api.md)
- [Local showcase and troubleshooting](docs/showcase.md)
- [Architecture decisions](docs/decisions/0001-typescript-workspace.md)
- [Random resolution and exercise decisions](docs/decisions/0002-story-resolution.md)

The infrastructure baseline lives on `main`; incremental prototype work lives on `dev`.

The initial build includes three Crystal Lake starter prompts, procedural narration and action introductions, reviewed B1/B2 exercises, random escape/recovery/death outcomes, a continuous transcript, browser-refresh recovery, and a final vocabulary review. Images and film retrieval are intentionally deferred.

Sessions live in API memory and expire after two idle hours. Restarting the API loses them; the browser stores only a run ID. The small exercise bank repeats on long runs. Gemma's prose and film fidelity remain model-dependent.
