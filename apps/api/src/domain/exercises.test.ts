import { describe, expect, it } from "vite-plus/test";
import { createChallenge, selectExercise } from "./exercises.ts";

describe("reviewed challenges", () => {
  it("keeps one blank when the model repeats the supplied cloze", () => {
    const exercise = selectExercise("low", []);
    const challenge = createChallenge(
      exercise,
      `You crouch beneath the pine. ${exercise.sentence}`,
      "Hide",
      false,
    );
    expect(challenge.view.attempt.match(/___/g)).toHaveLength(1);
    expect(challenge.view.attempt.match(/You stop moving/g)).toHaveLength(1);
    expect(
      challenge.view.options.find((option) => option.id === challenge.correctOptionId)?.text,
    ).toBe(exercise.answer);
  });
  it("removes a model-created gap while preserving the reviewed task", () => {
    const exercise = selectExercise("low", []);
    const challenge = createChallenge(
      exercise,
      "You crouch down. You ___ beneath a branch.",
      "Hide",
      false,
    );
    expect(challenge.view.attempt).toBe(`You crouch down.\n\n${exercise.sentence}`);
  });
});
