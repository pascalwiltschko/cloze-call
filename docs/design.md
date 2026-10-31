# Interface direction

A restrained late-night cinema/analogue horror aesthetic: charcoal surfaces, warm ivory reading text, crimson primary accents, muted moss details. Pixel typography is reserved for expressive headings and compact labels; narrative paragraphs and controls use readable text typography.

The home screen pairs a movie/situation textarea with starter cards. Cards populate prompts and do not represent a template engine. The Crystal Lake woods chase is the primary showcase.

The story is one continuous, scrollable feed. Scenes have clear separators, actions appear below narration, and the selected action reveals its challenge below it. Completed controls lock while remaining readable. Endings append a verdict instead of navigating away.

Use shadcn/ui primitives and Motion for transitions within the feed. Respect reduced motion, keyboard focus, accessible labels, touch targets, and narrow screens. Loading and errors stay near the pending interaction; errors preserve the story and permit a safe retry.

Images, health bars, inventory, explicit odds, hint controls, and difficulty settings are outside this version.
