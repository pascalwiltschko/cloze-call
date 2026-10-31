# ADR 0001: TypeScript workspace with a local model boundary

Status: accepted

## Decision

Use a small pnpm monorepo, Vite+ tooling, React/Tailwind/shadcn/ui/Motion, a Node/Hono API, Zod wire contracts, and LangChain ChatOllama. Keep local inference behind an injected narrator interface.

## Rationale

The backend coordinates HTTP, game state, and validation; Ollama already runs inference. Sharing a language and validated contracts reduces integration work and supports learning modern React and TypeScript server development.

## Consequences

The browser receives a public projection without answer keys or hidden odds. Domain rules remain independent of model quality and can be tested cheaply. In-memory storage intentionally trades durability for a short local prototype; a repository adapter can replace it later.

Vite+ has its own hook support, but this repository uses the explicitly requested Husky hooks as the sole pre-commit dispatcher.
