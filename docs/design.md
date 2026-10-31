# Interface direction

A restrained late-night cinema/analogue horror aesthetic: charcoal surfaces, warm ivory reading text, crimson primary accents, muted moss details. Pixel typography is reserved for expressive headings and compact labels; narrative paragraphs and controls use readable text typography.

The home screen pairs a movie/situation textarea with starter cards. Cards populate prompts and do not represent a template engine. The Crystal Lake woods chase is the primary showcase.

The story is one continuous, scrollable feed. Scenes have clear separators, actions appear below narration, and the selected action reveals its challenge below it. Completed controls lock while remaining readable. Endings append a verdict instead of navigating away.

Use shadcn/ui primitives and Motion for transitions within the feed. Respect reduced motion, keyboard focus, accessible labels, touch targets, and narrow screens. Loading and errors stay near the pending interaction; errors preserve the story and permit a safe retry.

Images, health bars, inventory, explicit odds, hint controls, and difficulty settings are outside this version.

## Implemented choices

VT323 supplies the pixel display face; self-hosted Geist supplies reading and control text. CSS tokens define the palette, while shadcn Button, Card, Badge, Textarea, and Alert primitives provide the controls. Motion animates newly appended entries; reduced-motion preferences disable unnecessary movement.

Starter cards fill the textarea without starting inference. The submit button supports Ctrl/Cmd+Enter. Challenge options allow inspection before a separate commit action; after submission the selected answer stays locked through retries. Completed questions retain the selected answer and mark the correct option, with a corrected sentence below an incorrect attempt.

The feed follows new entries when the reader is near the bottom and preserves their position while they read earlier sections. A skip link, labelled input, semantic headings, status announcements, visible focus, and mobile layouts support keyboard and narrow-screen use.

## Prototype cleanup

Keep the opening screen focused on one labelled prompt, a brief instruction, and optional starter cards with general section labels. Avoid promotional headings, captions, and slogans. The footer shows the exact configured model tag from the API and the app version from the root package manifest.

Begin the transcript with the player's prompt, without a separate story title or introductory banner. Recovery scenes use ordinary scene labels so the interface does not reveal the underlying recovery rule. Selected actions use neutral moss surfaces; feedback retains distinct success and error treatments. Story restart controls say “New Story”, and the reread link points upward.

Home fades out on submission into a separate story route; the prompt and starter cards never remain above the transcript. Initial loading uses “Hold your breath…”. Route transitions respect reduced motion.
