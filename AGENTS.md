# Working on Cloze Call

Read [docs/product.md](docs/product.md) before changing story rules or learning behavior. Read [docs/architecture.md](docs/architecture.md) before adding packages, API routes, or model integrations. Read [docs/design.md](docs/design.md) before changing the interface. Record significant trade-offs in `docs/decisions/`.

- Keep game rules, grading, randomness, and answer keys in the API. Send explicit public projections to the browser.
- Put shared wire schemas and inferred types in `packages/shared`; keep provider code and internal state in `apps/api`.
- Inject the narrator and random source at the service boundary. Test transitions without Ollama; verify provider changes with a separate live smoke test.
- Preserve resolved turns and sample each outcome once. Model or network retries must retain the committed action, answer, and outcome.
- Keep prose in the continuous story feed. Reveal challenges after action selection and consequences after submission.
- Run the root verification script before handing off changes. Hooks must stay enabled for commits.
- Use focused commits on `dev`; `main` retains the initial infrastructure baseline until an explicit merge.
