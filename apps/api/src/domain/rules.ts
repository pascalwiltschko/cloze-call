import type { ChallengeTier } from "./exercises.ts";

export type StoryEvent = "continue" | "recovery" | "escaped" | "dead";
export type RandomSource = () => number;

export function resolveOutcome(
  input: {
    correct: boolean;
    recovery: boolean;
    tier: ChallengeTier;
    successes: number;
  },
  random: RandomSource,
): StoryEvent {
  if (!input.correct && input.recovery) return "dead";
  const roll = random();
  if (!(roll >= 0 && roll < 1))
    throw new RangeError("Random source must return a number in [0, 1).");
  if (input.correct) {
    const escapeChance = Math.min(
      0.12 + input.successes * 0.13 + (input.tier === "high" ? 0.12 : 0),
      0.86,
    );
    return roll < escapeChance ? "escaped" : "continue";
  }
  const deathChance = { low: 0.2, medium: 0.4, high: 0.65, recovery: 1 }[input.tier];
  return roll < deathChance ? "dead" : "recovery";
}
