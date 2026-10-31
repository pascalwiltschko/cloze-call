import type { NarrationRequest, Narrator } from "../story/narrator.ts";

export function createTestNarrator(): Narrator {
  return {
    narrate: async (request: NarrationRequest) => ({
      title: "A light between the trees",
      narration:
        "The wind moves through the pines. A branch snaps behind you, much closer than before. You can see a distant light through the trees.",
      summary: "An adult counsellor is pursued in the Crystal Lake woods.",
      actions:
        request.event === "opening" || request.event === "continue"
          ? request.exercises.map((_, index) => ({
              label: [
                "Hide behind the fallen pine",
                "Run towards the light",
                "Leap over the ditch",
              ][index]!,
              leadIn: "You commit to the move, keeping your eyes on the dark trees.",
            }))
          : [],
      recoveryLeadIn:
        request.event === "recovery"
          ? "You reach for a root as the ground drops away beneath you."
          : "",
    }),
  };
}
