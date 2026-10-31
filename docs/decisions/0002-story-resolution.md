# ADR 0002: Server-owned random resolution and reviewed cloze tasks

Status: accepted

## Decision

An action reveals one reviewed three-option cloze. The server grades it and samples the story event before requesting narration. Successful actions continue or escape. Failed ordinary actions recover or die; a failed recovery always dies. Recovery presents one task directly.

Escape probability starts at 12%, rises by 13 percentage points per prior successful answer, gains 12 points for a difficult action, and is capped at 86%. Failed low/medium/high actions have 20%/40%/65% death probability. These initial tuning values are centralized in the domain rules and hidden from the UI.

## Rationale

Randomness creates uncertain endings without making Gemma judge language proficiency or invent survival rules. Rising escape probability encourages narrative closure without a fixed turn limit. A reviewed exercise bank supplies dependable answers while the model adapts action labels and attempt introductions to each scene.

## Retry semantics

An answer and event remain committed if narration fails. Retrying the same answer requests prose for the same event. A different answer or concurrent mutation is rejected. Public views are validated projections; answer keys appear only in feedback after resolution.

## Limitations

The small task bank eventually repeats and does not adapt to the learner. Random escape can happen early; the narrator must write a plausible exit. These are deliberate prototype trade-offs, to revisit after playtesting.
