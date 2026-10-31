import { describe, expect, it } from "vite-plus/test";
import { resolveOutcome } from "./rules.ts";

describe("story outcome rules", () => {
  it("allows a successful action to escape or continue", () => {
    const input = { correct: true, recovery: false, tier: "low" as const, successes: 0 };
    expect(resolveOutcome(input, () => 0.01)).toBe("escaped");
    expect(resolveOutcome(input, () => 0.9)).toBe("continue");
  });
  it("increases the chance of escape after successful progress", () => {
    const input = { correct: true, recovery: false, tier: "low" as const, successes: 0 };
    expect(resolveOutcome(input, () => 0.5)).toBe("continue");
    expect(resolveOutcome({ ...input, successes: 4 }, () => 0.5)).toBe("escaped");
  });
  it("gives riskier failed actions a greater chance of death", () => {
    const input = { correct: false, recovery: false, tier: "low" as const, successes: 0 };
    expect(resolveOutcome(input, () => 0.3)).toBe("recovery");
    expect(resolveOutcome({ ...input, tier: "high" }, () => 0.3)).toBe("dead");
  });
  it("ends a failed recovery without rolling another recovery", () => {
    expect(
      resolveOutcome({ correct: false, recovery: true, tier: "recovery", successes: 0 }, () => {
        throw new Error("No roll needed");
      }),
    ).toBe("dead");
  });
  it("keeps correct answers alive across every tier and representative roll", () => {
    for (const tier of ["low", "medium", "high", "recovery"] as const)
      for (const roll of [0, 0.3, 0.99]) {
        expect(["continue", "escaped"]).toContain(
          resolveOutcome(
            { correct: true, recovery: tier === "recovery", tier, successes: 0 },
            () => roll,
          ),
        );
      }
  });
});
