# Product contract

Cloze Call is interactive horror fiction for horror fans practising conversational B1/B2 English. The showcase is an original woods chase around Crystal Lake inspired by Friday the 13th Part 2, rather than a reconstruction of a particular scene.

## Loop

1. Enter movie and situation information or select a starter prompt.
2. Read a scene and select an in-world action. Difficulty and consequences remain hidden.
3. Read the attempted action as a one-blank cloze with three options. Submit once, without hints.
4. The server grades the answer and samples an outcome. Correct answers continue or escape; incorrect answers lead to recovery or death.
5. A recovery has one focused language task. Its failure always ends the story; success continues or escapes.
6. Read the consequence and next scene in the same transcript. An ending shows the final verdict and expressions encountered.

Correct answers always achieve the selected action. Randomness determines whether that success creates a plausible escape. Escape becomes more likely as progress accumulates; the story has no fixed scene-count ending. The narrative must make the sampled ending physically plausible.

Each failed ordinary action permits at most one recovery attempt; recovery scenes never chain. A later ordinary action can fail independently.

## Scope

Initial: text-only local inference, one conversational level, multiple-choice cloze, optional starter prompts, continuous transcript, random outcomes, final review. Later: images, Tavily film context, adaptive difficulty, freeform actions, persistence, and spaced repetition.
