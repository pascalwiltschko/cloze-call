import { randomUUID } from "node:crypto";
import { runSchema, type FeedbackEntry, type StoryRun } from "@final-cut/shared";
import { StoryError } from "../domain/errors.ts";
import {
  createChallenge,
  selectExercise,
  type ChallengeTier,
  type Exercise,
  type InternalChallenge,
} from "../domain/exercises.ts";
import { resolveOutcome, type RandomSource, type StoryEvent } from "../domain/rules.ts";
import {
  narrationSchema,
  type Narration,
  type NarrationRequest,
  type Narrator,
} from "./narrator.ts";
import { MemoryStore } from "./store.ts";

interface InternalAction {
  id: string;
  label: string;
  leadIn: string;
  exercise: Exercise;
}
interface PendingAnswer {
  revision: number;
  optionId: string;
  correct: boolean;
  event: StoryEvent;
  nextExercises: Exercise[];
}
interface Session {
  view: StoryRun;
  summary: string;
  actions: InternalAction[];
  challenge: InternalChallenge | null;
  successes: number;
  usedExercises: string[];
  pending: PendingAnswer | null;
  busy: boolean;
}

export class StoryService {
  private readonly store = new MemoryStore<Session>();
  constructor(
    private readonly narrator: Narrator,
    private readonly random: RandomSource = Math.random,
  ) {}

  get(id: string): StoryRun {
    const session = this.store.get(id);
    return runSchema.parse({ ...session.view, pendingOptionId: session.pending?.optionId ?? null });
  }

  async start(prompt: string): Promise<StoryRun> {
    const exercises = this.nextExercises([]);
    const narration = await this.generate({
      prompt,
      summary: "",
      event: "opening",
      action: null,
      correct: null,
      exercises,
    });
    const session: Session = {
      view: {
        id: randomUUID(),
        revision: 0,
        title: narration.title,
        prompt,
        phase: "choosing",
        entries: [],
        pendingOptionId: null,
      },
      summary: "",
      actions: [],
      challenge: null,
      successes: 0,
      usedExercises: [],
      pending: null,
      busy: false,
    };
    this.appendNarration(session, narration, "continue", exercises);
    this.store.add(session.view.id, session);
    return this.get(session.view.id);
  }

  choose(id: string, revision: number, actionId: string): StoryRun {
    const session = this.store.get(id);
    this.checkCommand(session, revision, "choosing");
    const action = session.actions.find((candidate) => candidate.id === actionId);
    if (!action) throw new StoryError("INVALID_ACTION", "Choose an action from the current scene.");
    session.challenge = createChallenge(action.exercise, action.leadIn, action.label, false);
    session.usedExercises.push(action.exercise.id);
    session.view.entries.push(
      { kind: "action", id: randomUUID(), text: action.label },
      session.challenge.view,
    );
    session.view.phase = "answering";
    session.view.revision++;
    return this.get(id);
  }

  async answer(id: string, revision: number, optionId: string): Promise<StoryRun> {
    const session = this.store.get(id);
    this.checkCommand(session, revision, "answering");
    const challenge = session.challenge!;
    if (!challenge.view.options.some((option) => option.id === optionId))
      throw new StoryError("INVALID_ANSWER", "Choose one of the words in this challenge.");
    if (session.pending && session.pending.optionId !== optionId)
      throw new StoryError(
        "ANSWER_COMMITTED",
        "Your answer is already committed. Retry the same answer.",
        409,
      );
    if (!session.pending) {
      const correct = optionId === challenge.correctOptionId;
      const event = resolveOutcome(
        {
          correct,
          recovery: challenge.recovery,
          tier: challenge.exercise.tier,
          successes: session.successes,
        },
        this.random,
      );
      session.pending = {
        revision,
        optionId,
        correct,
        event,
        nextExercises:
          event === "recovery"
            ? [selectExercise("recovery", session.usedExercises)]
            : event === "continue"
              ? this.nextExercises(session.usedExercises)
              : [],
      };
    }
    const pending = session.pending;
    session.busy = true;
    try {
      const narration = await this.generate({
        prompt: session.view.prompt,
        summary: session.summary,
        event: pending.event,
        action: challenge.actionLabel,
        correct: pending.correct,
        exercises: pending.nextExercises,
      });
      const feedback: FeedbackEntry = {
        kind: "feedback",
        id: randomUUID(),
        challengeId: challenge.view.id,
        optionId,
        correctOptionId: challenge.correctOptionId,
        correct: pending.correct,
        expression: challenge.exercise.expression,
        meaning: challenge.exercise.meaning,
        completedSentence: challenge.exercise.sentence.replace("___", challenge.exercise.answer),
      };
      session.view.entries.push(feedback);
      if (pending.correct) session.successes++;
      this.appendNarration(session, narration, pending.event, pending.nextExercises);
      session.pending = null;
      session.view.revision++;
      return this.get(id);
    } finally {
      session.busy = false;
    }
  }

  private nextExercises(used: string[]): Exercise[] {
    return (["low", "medium", "high"] as const).map((tier: ChallengeTier) =>
      selectExercise(tier, used),
    );
  }

  private checkCommand(session: Session, revision: number, phase: StoryRun["phase"]): void {
    if (session.busy)
      throw new StoryError("BUSY", "The next scene is still developing. Wait a moment.", 409);
    if (session.view.revision !== revision || session.view.phase !== phase)
      throw new StoryError(
        "STALE_TURN",
        "This scene has already moved on. Refresh the story.",
        409,
      );
  }

  private async generate(request: NarrationRequest): Promise<Narration> {
    try {
      const draft = narrationSchema.parse(await this.narrator.narrate(request));
      if (
        (request.event === "opening" || request.event === "continue") &&
        draft.actions.length !== 3
      )
        throw new Error("A decision scene needs three actions.");
      if (request.event === "recovery" && draft.recoveryLeadIn.length < 5)
        throw new Error("A recovery needs an attempted action.");
      return draft;
    } catch (error) {
      if (error instanceof StoryError) throw error;
      console.error(
        "Narrator request failed:",
        error instanceof Error ? error.message : "Unknown provider error",
      );
      throw new StoryError(
        "NARRATOR_UNAVAILABLE",
        "The narrator couldn't finish this scene. Check Ollama, then retry. Your committed answer will be preserved.",
        503,
      );
    }
  }

  private appendNarration(
    session: Session,
    narration: Narration,
    event: StoryEvent,
    exercises: Exercise[],
  ): void {
    session.summary = narration.summary;
    session.actions = [];
    session.challenge = null;
    if (event === "escaped" || event === "dead") {
      session.view.entries.push({
        kind: "ending",
        id: randomUUID(),
        title: narration.title,
        text: narration.narration,
        verdict: event,
      });
      session.view.phase = "ended";
      return;
    }
    if (event === "continue") {
      session.actions = narration.actions.map((action, index) => ({
        ...action,
        id: randomUUID(),
        exercise: exercises[index]!,
      }));
    }
    session.view.entries.push({
      kind: "scene",
      id: randomUUID(),
      title: narration.title,
      text: narration.narration,
      recovery: event === "recovery",
      actions: session.actions.map(({ id, label }) => ({ id, label })),
    });
    if (event === "recovery") {
      const exercise = exercises[0]!;
      session.challenge = createChallenge(
        exercise,
        narration.recoveryLeadIn,
        "Survive the immediate danger",
        true,
      );
      session.usedExercises.push(exercise.id);
      session.view.entries.push(session.challenge.view);
      session.view.phase = "answering";
    } else session.view.phase = "choosing";
  }
}
