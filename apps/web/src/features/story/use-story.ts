import { useCallback, useEffect, useRef, useState } from "react";
import type { StoryRun } from "@cloze-call/shared";
import { api } from "@/lib/api";

export type BusyState = "starting" | "choosing" | "answering" | "resuming" | null;

export function useStory(id: string | null) {
  const [run, setRun] = useState<StoryRun | null>(null);
  const [busy, setBusy] = useState<BusyState>(id && id !== "new" ? "resuming" : null);
  const [error, setError] = useState<string | null>(null);
  const [committedAnswerId, setCommittedAnswerId] = useState<string | null>(null);
  const scope = useRef({ id, version: 0 });
  if (scope.current.id !== id) {
    const previous = scope.current.id;
    if (!(previous === null && id === "new") && !(previous === "new" && id === run?.id))
      scope.current.version++;
    scope.current.id = id;
  }
  const inFlight = useRef<number | null>(null);
  const save = useCallback((next: StoryRun) => {
    setRun(next);
    setCommittedAnswerId(next.pendingOptionId);
  }, []);

  useEffect(() => {
    if (!id) {
      setRun(null);
      setBusy(null);
      setError(null);
      setCommittedAnswerId(null);
      return;
    }
    if (id === "new" || run?.id === id) return;
    setRun(null);
    setBusy("resuming");
    let cancelled = false;
    api
      .get(id)
      .then((next) => {
        if (!cancelled) save(next);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setError(cause instanceof Error ? cause.message : "Couldn't resume the story.");
      })
      .finally(() => {
        if (!cancelled) setBusy(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id, save, run?.id]);

  async function execute(kind: BusyState, operation: () => Promise<StoryRun>, answerId?: string) {
    const version = scope.current.version;
    if (inFlight.current === version) return;
    inFlight.current = version;
    const isCurrent = () => scope.current.version === version;
    setBusy(kind);
    setError(null);
    if (answerId) setCommittedAnswerId(answerId);
    try {
      const next = await operation();
      if (!isCurrent()) return;
      save(next);
      return next;
    } catch (cause) {
      if (!isCurrent()) return;
      setError(cause instanceof Error ? cause.message : "The scene couldn't finish. Try again.");
      if (run) {
        try {
          const latest = await api.get(run.id);
          if (!isCurrent()) return;
          save(latest);
          if (latest.revision > run.revision) setError(null);
          else setCommittedAnswerId(latest.pendingOptionId ?? answerId ?? null);
        } catch {
          /* Keep the readable transcript during a connection failure. */
        }
      }
    } finally {
      if (inFlight.current === version) inFlight.current = null;
      if (isCurrent()) setBusy(null);
    }
  }

  return {
    run,
    busy,
    error,
    committedAnswerId,
    start: (prompt: string) => execute("starting", () => api.start(prompt)),
    choose: (actionId: string) =>
      run
        ? execute("choosing", () => api.choose(run.id, run.revision, actionId))
        : Promise.resolve(),
    answer: (optionId: string) =>
      run
        ? execute("answering", () => api.answer(run.id, run.revision, optionId), optionId)
        : Promise.resolve(),
    reset: () => {
      if (inFlight.current === null) {
        setRun(null);
        setError(null);
        setCommittedAnswerId(null);
      }
    },
  };
}
