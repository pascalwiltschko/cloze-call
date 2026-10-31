# Prepare loading copy with narration

Request a short atmospheric loading line in each existing structured narration response and project it explicitly as `loadingMessage`. Display that line during the following turn's wait. It describes only established atmosphere and must fit every possible choice, without new events, answers, or spoilers. This is a prompt constraint, not a semantic guarantee.

Initial generation and missing, blank, or overlong lines use “Hold your breath…”. Keep the field optional for existing sessions and fake narrators; normalize it at the service boundary. Never make another inference request for loading copy. Selection and failed-answer retries retain the previous scene's line until a new narration is committed.
