# Story URLs and opening transition

Use React Router with `/` for independent home screens, `/stories/new` for the pending opening, and `/stories/:storyId` for authoritative API sessions. Remove the shared localStorage current-story pointer: tabs no longer select each other's story. Refreshing a story URL reloads that run; refreshing an uncompleted opening offers a return home because the API has not issued a run ID yet.

Keep the prompt and starter cards on home only. Submission fades home out into the story loading view using Motion, respecting reduced motion. Initial loading copy is “Hold your breath…”. Failed openings retain their prompt in memory and provide a retry. Server memory remains the session lifetime limit.
