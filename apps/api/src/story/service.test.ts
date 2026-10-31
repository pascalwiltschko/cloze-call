import { describe, expect, it, vi } from "vite-plus/test";
import type { ChallengeEntry, SceneEntry, StoryRun } from "@cloze-call/shared";
import type { NarrationRequest, Narrator } from "./narrator.ts";
import { StoryService } from "./service.ts";

export function fakeNarrator(): Narrator {
  return {
    narrate: vi.fn(async (request: NarrationRequest) => ({
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
    })),
  };
}
function challenge(run: StoryRun): ChallengeEntry {
  return run.entries.findLast((entry) => entry.kind === "challenge")!;
}
function choose(service: StoryService, run: StoryRun): StoryRun {
  const scene = run.entries.findLast((entry): entry is SceneEntry => entry.kind === "scene")!;
  return service.choose(run.id, run.revision, scene.actions[0]!.id);
}
function option(run: StoryRun, text: string): string {
  return challenge(run).options.find((choice) => choice.text === text)!.id;
}

describe("story service", () => {
  it("reveals the cloze only after an action and keeps answer keys private", async () => {
    const service = new StoryService(fakeNarrator());
    const opening = await service.start("An original chase at Crystal Lake.");
    expect(opening.entries).toHaveLength(1);
    expect(JSON.stringify(opening)).not.toContain("correctOptionId");
    const selected = choose(service, opening);
    expect(selected.phase).toBe("answering");
    expect(challenge(selected).options).toHaveLength(3);
    expect(JSON.stringify(selected)).not.toContain("correctOptionId");
    expect(JSON.stringify(selected)).not.toContain("deathChance");
  });
  it("preserves the whole transcript through a successful ending", async () => {
    const service = new StoryService(fakeNarrator(), () => 0);
    const run = choose(service, await service.start("An original chase at Crystal Lake."));
    const ended = await service.answer(run.id, run.revision, option(run, "keep"));
    expect(ended.phase).toBe("ended");
    expect(ended.entries.map((entry) => entry.kind)).toEqual([
      "scene",
      "action",
      "challenge",
      "feedback",
      "ending",
    ]);
    expect(ended.entries.at(-1)).toMatchObject({ verdict: "escaped" });
  });
  it("provides one focused recovery and ends a failed recovery", async () => {
    const service = new StoryService(fakeNarrator(), () => 0.9);
    const run = choose(service, await service.start("An original chase at Crystal Lake."));
    const recovery = await service.answer(run.id, run.revision, option(run, "put"));
    expect(recovery.phase).toBe("answering");
    expect(recovery.entries.at(-2)).toMatchObject({ recovery: true, actions: [] });
    const ended = await service.answer(run.id, recovery.revision, option(recovery, "off"));
    expect(ended.entries.at(-1)).toMatchObject({ verdict: "dead" });
  });
  it("rejects stale actions and invalid answer options without rolling", async () => {
    const random = vi.fn(() => 0.5);
    const service = new StoryService(fakeNarrator(), random);
    const opening = await service.start("An original chase at Crystal Lake.");
    const run = choose(service, opening);
    expect(() => choose(service, opening)).toThrow("already moved on");
    await expect(service.answer(run.id, run.revision, "not-an-option")).rejects.toThrow(
      "Choose one of the words",
    );
    expect(random).not.toHaveBeenCalled();
  });
  it("keeps the answer and random outcome committed when narration fails", async () => {
    const narrator = fakeNarrator();
    const random = vi.fn(() => 0.01);
    const service = new StoryService(narrator, random);
    const run = choose(service, await service.start("An original chase at Crystal Lake."));
    vi.mocked(narrator.narrate).mockRejectedValueOnce(new Error("Model timeout"));
    const answer = option(run, "keep");
    await expect(service.answer(run.id, run.revision, answer)).rejects.toMatchObject({
      code: "NARRATOR_UNAVAILABLE",
    });
    expect(service.get(run.id).pendingOptionId).toBe(answer);
    await expect(service.answer(run.id, run.revision, option(run, "put"))).rejects.toMatchObject({
      code: "ANSWER_COMMITTED",
    });
    const retried = await service.answer(run.id, run.revision, answer);
    expect(retried.entries.at(-1)).toMatchObject({ verdict: "escaped" });
    expect(random).toHaveBeenCalledTimes(1);
    expect(retried.entries.filter((entry) => entry.kind === "feedback")).toHaveLength(1);
  });
  it("rejects a second submission while narration is running", async () => {
    const narrator = fakeNarrator();
    const service = new StoryService(narrator, () => 0.9);
    const run = choose(service, await service.start("An original chase at Crystal Lake."));
    let finish!: () => void;
    const original = narrator.narrate;
    narrator.narrate = async (request) => {
      await new Promise<void>((resolve) => {
        finish = resolve;
      });
      return original(request);
    };
    const first = service.answer(run.id, run.revision, option(run, "keep"));
    await expect(service.answer(run.id, run.revision, option(run, "keep"))).rejects.toMatchObject({
      code: "BUSY",
    });
    finish();
    await first;
  });
});
