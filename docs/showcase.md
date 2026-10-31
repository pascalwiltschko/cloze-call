# Local showcase

## Before presenting

1. Run `pnpm install` with Node 24 active. Husky is installed by the prepare script.
2. Start Ollama and confirm `ollama list` includes `gemma4:e4b-it-q4_K_M`.
3. Copy `.env.example` to `.env` if configuration is needed. Defaults already target this model on loopback.
4. Run `pnpm dev`, then open http://127.0.0.1:5173.
5. Confirm the desktop header says `GEMMA · LOCAL`. On small screens, offline details appear below the form if needed.
6. Choose the woods starter, then enter the scene. Select an action, choose a word, and commit the answer.

The first request may load the model into memory. Narration can take tens of seconds on the showcase machine. An action reveals its cloze immediately; the next inference happens after the answer. Keep the model warm before presenting with `pnpm --filter @final-cut/api smoke`.

## Outcomes

A correct answer succeeds and can continue or escape. A failed ordinary action may create a recovery or end the story. A failed recovery always ends it. Ending length is driven by sampled outcomes rather than a fixed turn count.

The footer review separates language accuracy from survival. It shows expressions encountered; it does not assign a CEFR level. Another take returns to the opening screen.

## Troubleshooting

- **Narrator offline:** start Ollama, check the exact configured tag, then use Check connection.
- **Scene on hold:** retry the committed answer. The server retains its outcome, so retries do not reroll survival.
- **API restarted:** in-memory stories are lost. Start a new screening; a stored browser run ID cannot recreate a deleted session.
- **Ports:** the frontend uses 5173. `PORT` in the root environment file changes the API port and its Vite proxy together.
- **Long or invalid model output:** prompts request compact JSON and the adapter allows 1,800 output tokens. Response validation rejects incomplete scenes. Challenge normalization removes model-copied blanks so each reviewed task has one gap.

## Validation

`pnpm verify` runs static checks, per-package TypeScript checks, Vitest, and production builds. Unit/API/browser-component tests use injected narration and controlled test rolls without requiring Ollama. `pnpm --filter @final-cut/api smoke` verifies the real model separately.

Manual browser verification covers a starter, action selection, correct continuation, failed-action recovery, failed-recovery death, final vocabulary review, refresh/resume, and replay. Desktop and narrow preview layouts have been inspected.

For a production-build smoke check, run `pnpm build`, `pnpm --filter @final-cut/api start`, and `pnpm --filter @final-cut/web preview` in separate terminals. This remains a local prototype, with no hosted deployment configured.

## Next extensions

1. Improve task variety and ensure narration consistently avoids revealing the target expression before the cloze.
2. Expand film context using reviewed scenario facts, then restricted retrieval before a run.
3. Add durable sessions behind the store boundary.
4. Add optional illustration generation behind a separate provider after the text experience is tuned.
