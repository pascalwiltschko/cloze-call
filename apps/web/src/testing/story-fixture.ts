import type { StoryRun, ChallengeEntry, SceneEntry, FeedbackEntry } from "@final-cut/shared";

export function storyFixture() {
  const id = () => crypto.randomUUID();
  const scene: SceneEntry = {
    kind: "scene",
    id: id(),
    title: "Footsteps in the pines",
    text: "You hear a branch snap behind you. The road is somewhere beyond the trees, but the figure is getting closer.",
    recovery: false,
    actions: [
      { id: id(), label: "Hide behind the fallen pine" },
      { id: id(), label: "Run towards the road" },
      { id: id(), label: "Jump over the ditch" },
    ],
  };
  const challenge: ChallengeEntry = {
    kind: "challenge",
    id: id(),
    attempt: "You crouch behind the fallen pine. You need to ___ quiet until the footsteps pass.",
    options: [
      { id: id(), text: "keep" },
      { id: id(), text: "put" },
      { id: id(), text: "give" },
    ],
  };
  const feedback: FeedbackEntry = {
    kind: "feedback",
    id: id(),
    challengeId: challenge.id,
    optionId: challenge.options[0]!.id,
    correctOptionId: challenge.options[0]!.id,
    correct: true,
    expression: "keep quiet",
    meaning: "avoid making noise",
    completedSentence: "You need to keep quiet until the footsteps pass.",
  };
  const opening: StoryRun = {
    id: id(),
    revision: 0,
    title: "Night at Crystal Lake",
    prompt: "A slasher chase through the woods around Crystal Lake.",
    phase: "choosing",
    entries: [scene],
    pendingOptionId: null,
  };
  const selected: StoryRun = {
    ...opening,
    revision: 1,
    phase: "answering",
    entries: [scene, { kind: "action", id: id(), text: scene.actions[0]!.label }, challenge],
  };
  const ended: StoryRun = {
    ...selected,
    revision: 2,
    phase: "ended",
    entries: [
      ...selected.entries,
      feedback,
      {
        kind: "ending",
        id: id(),
        title: "The road out",
        text: "The figure passes without seeing you. You reach the road and a driver stops. The camp disappears behind you.",
        verdict: "escaped",
      },
    ],
  };
  return { opening, selected, ended, scene, challenge, feedback };
}
