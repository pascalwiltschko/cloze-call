# Local API

All paths are relative to `/api`. JSON requests are validated with shared Zod schemas. Responses never include internal answer keys until a challenge is resolved.

| Method | Path                   | Purpose                                                   |
| ------ | ---------------------- | --------------------------------------------------------- |
| GET    | `/health`              | Process health, independent of Ollama                     |
| GET    | `/model`               | Installed-model availability and actionable setup message |
| POST   | `/stories`             | Start with `{ prompt }`; returns a run                    |
| GET    | `/stories/:id`         | Read/resume a run                                         |
| POST   | `/stories/:id/actions` | Commit `{ revision, actionId }`; reveal the cloze         |
| POST   | `/stories/:id/answers` | Commit `{ revision, optionId }`; resolve and narrate      |

Every mutation checks the current revision. Stale or concurrent commands return 409. Errors use `{ error: { code, message } }`. Model errors return 503; retry the same committed answer. The GET projection includes `pendingOptionId` so a refreshed client can preserve that answer too.

Sessions expire after two hours without access, are capped at 100, and disappear when the API restarts. Run IDs are opaque local capabilities. The API binds to loopback; remote hosting requires authentication and durable storage.

## Live integration check

With Ollama running and the model installed, run `pnpm --filter @final-cut/api smoke`. This uses real LangChain/Ollama inference for an opening and an ending. Unit and API tests use injected narration and require no model.
