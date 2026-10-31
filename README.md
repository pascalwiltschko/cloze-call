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
```

Husky runs static checks, type checks, and Vitest before each commit. CI runs the same checks plus production builds; model inference is not needed for tests.

## Documentation

- [Product and game loop](docs/product.md)
- [Architecture](docs/architecture.md)
- [Visual and interaction design](docs/design.md)
- [Architecture decisions](docs/decisions/0001-typescript-workspace.md)

The infrastructure baseline lives on `main`; incremental prototype work lives on `dev`.
