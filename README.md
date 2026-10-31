# Cloze Call

An interactive horror story for practising conversational English. Choose an action, fill in the missing word, and see whether you survive.

Cloze Call pairs locally generated narration with reviewed language exercises. Start with a Crystal Lake scenario or enter your own movie and situation. Each run unfolds in a continuous story feed and ends with a review of the expressions you encountered.

## How it works

1. Read the scene and choose what to do next.
2. Complete a sentence with one missing word and three possible answers.
3. Discover the consequence: continue, escape, attempt a recovery, or meet your end.

Correct answers make your chosen action succeed; chance determines whether you escape. A wrong answer can lead to a recovery challenge or death. The API controls grading and outcomes; the language model narrates the result.

## Run locally

Requires **Node.js 24**, **pnpm 11.8.0**, and [Ollama](https://ollama.com). Start Ollama using its app or `ollama serve`, then run:

```sh
pnpm install
cp .env.example .env
ollama pull gemma4:e4b-it-q4_K_M
pnpm dev
```

Open **http://127.0.0.1:5173**. The API uses port 3001 and Ollama uses port 11434 by default; see [`.env.example`](.env.example) for configuration. The first scene can take tens of seconds while the model loads.

## Development and contributions

The TypeScript workspace contains a React frontend (`apps/web`), a Hono API (`apps/api`), and shared Zod schemas (`packages/shared`).

Issues and pull requests are welcome. Read [AGENTS.md](AGENTS.md) and the relevant docs before making changes, keep contributions focused, and run verification before submitting:

```sh
pnpm verify      # format/lint/types, tests, production builds
pnpm test:watch
pnpm format
pnpm --filter @cloze-call/api smoke  # real local Gemma opening and ending
```

Tests use a fake narrator and do not require Ollama. The smoke test checks the real local model. Keep commit hooks enabled.

## Prototype limits

This is a text-only local prototype. Sessions expire after two idle hours and are lost when the API restarts. The exercise bank is small, so longer runs can repeat tasks. Narration quality and film accuracy depend on the model.

## Documentation

- [Product and game loop](docs/product.md)
- [Architecture](docs/architecture.md)
- [Visual and interaction design](docs/design.md)
- [API and retry behavior](docs/api.md)
- [Local showcase and troubleshooting](docs/showcase.md)
- [Architecture decisions](docs/decisions/)

## License

Licensed under the [MIT License](LICENSE).
