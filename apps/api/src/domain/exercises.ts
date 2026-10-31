import { randomInt, randomUUID } from "node:crypto";
import type { ChallengeEntry } from "@final-cut/shared";

export type ChallengeTier = "low" | "medium" | "high" | "recovery";
export interface Exercise {
  id: string;
  tier: ChallengeTier;
  sentence: string;
  choices: readonly [string, string, string];
  answer: string;
  expression: string;
  meaning: string;
}

const exercises: readonly Exercise[] = [
  {
    id: "keep-quiet",
    tier: "low",
    sentence: "You stop moving. You need to ___ quiet until the footsteps pass.",
    choices: ["keep", "put", "give"],
    answer: "keep",
    expression: "keep quiet",
    meaning: "avoid making noise",
  },
  {
    id: "out-of-sight",
    tier: "low",
    sentence: "You stay hidden. You must remain out of ___ so the figure cannot see you.",
    choices: ["sight", "breath", "luck"],
    answer: "sight",
    expression: "out of sight",
    meaning: "somewhere that cannot be seen",
  },
  {
    id: "hold-breath",
    tier: "low",
    sentence: "You hear movement nearby. You ___ your breath to stay silent.",
    choices: ["hold", "wear", "break"],
    answer: "hold",
    expression: "hold your breath",
    meaning: "stop breathing for a short time",
  },
  {
    id: "make-out",
    tier: "medium",
    sentence: "You stare into the darkness, trying to ___ out the path ahead.",
    choices: ["make", "give", "run"],
    answer: "make",
    expression: "make out",
    meaning: "see or understand something with difficulty",
  },
  {
    id: "pick-up-speed",
    tier: "medium",
    sentence:
      "You force your legs to move faster. You need to ___ up speed before the figure reaches you.",
    choices: ["pick", "call", "put"],
    answer: "pick",
    expression: "pick up speed",
    meaning: "start moving faster",
  },
  {
    id: "get-away",
    tier: "medium",
    sentence: "The figure is gaining on you. You have to ___ away before it reaches you.",
    choices: ["get", "give", "put"],
    answer: "get",
    expression: "get away",
    meaning: "escape from a place or person",
  },
  {
    id: "pull-off",
    tier: "high",
    sentence: "You face a difficult move. If you can ___ it off, you will be closer to safety.",
    choices: ["pull", "put", "take"],
    answer: "pull",
    expression: "pull it off",
    meaning: "succeed in doing something difficult",
  },
  {
    id: "go-through-with",
    tier: "high",
    sentence: "You hesitate, then force yourself to go ___ with the dangerous plan.",
    choices: ["through", "over", "around"],
    answer: "through",
    expression: "go through with",
    meaning: "complete something you decided to do, despite difficulty",
  },
  {
    id: "take-chance",
    tier: "high",
    sentence: "You know this move is risky, but you decide to ___ a chance.",
    choices: ["take", "do", "put"],
    answer: "take",
    expression: "take a chance",
    meaning: "try something even though it might fail",
  },
  {
    id: "hold-on",
    tier: "recovery",
    sentence: "Your hands grip the edge. You have to hold ___ until you can pull yourself up.",
    choices: ["on", "off", "away"],
    answer: "on",
    expression: "hold on",
    meaning: "keep gripping something tightly",
  },
  {
    id: "get-back-up",
    tier: "recovery",
    sentence: "You have fallen hard. You need to get back ___ before the figure reaches you.",
    choices: ["up", "off", "along"],
    answer: "up",
    expression: "get back up",
    meaning: "stand again after falling",
  },
  {
    id: "pull-together",
    tier: "recovery",
    sentence: "Panic makes your hands shake. You force yourself to pull yourself ___ and move.",
    choices: ["together", "apart", "over"],
    answer: "together",
    expression: "pull yourself together",
    meaning: "become calm enough to act",
  },
];

export function selectExercise(tier: ChallengeTier, used: readonly string[]): Exercise {
  const candidates = exercises.filter((exercise) => exercise.tier === tier);
  return (
    candidates.find((exercise) => !used.includes(exercise.id)) ??
    candidates[used.length % candidates.length]!
  );
}

export interface InternalChallenge {
  view: ChallengeEntry;
  exercise: Exercise;
  correctOptionId: string;
  recovery: boolean;
  actionLabel: string;
}

export function createChallenge(
  exercise: Exercise,
  leadIn: string,
  actionLabel: string,
  recovery: boolean,
): InternalChallenge {
  const options = exercise.choices.map((text) => ({ id: randomUUID(), text }));
  for (let i = options.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [options[i], options[j]] = [options[j]!, options[i]!];
  }
  return {
    view: {
      kind: "challenge",
      id: randomUUID(),
      attempt: `${leadIn}\n\n${exercise.sentence}`,
      options,
    },
    correctOptionId: options.find((option) => option.text === exercise.answer)!.id,
    exercise,
    recovery,
    actionLabel,
  };
}
