import { useCallback, useEffect, useRef, useState } from "react";
import type { StoryRun } from "@final-cut/shared";
import { api, ApiError } from "@/lib/api";

const storageKey = "final-cut:current-story";
function readSavedId(): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}
function remember(id: string | null) {
  try {
    if (id) localStorage.setItem(storageKey, id);
    else localStorage.removeItem(storageKey);
  } catch {
    /* The story also works without browser storage. */
  }
}
export type BusyState = "starting" | "choosing" | "answering" | "resuming" | null;

export function useStory() {
  const [run, setRun] = useState<StoryRun | null>(null);
  const [busy, setBusy] = useState<BusyState>(() => (readSavedId() ? "resuming" : null));
  const [error, setError] = useState<string | null>(null);
  const [committedAnswerId, setCommittedAnswerId] = useState<string | null>(null);
  const inFlight = useRef(false);
  const save = useCallback((next: StoryRun) => {
    setRun(next);
    remember(next.id);
    setCommittedAnswerId(next.pendingOptionId);
  }, []);

  useEffect(() => {
    const id = readSavedId();
    if (!id) return;
    let cancelled = false;
    api
      .get(id)
      .then((next) => {
        if (!cancelled) save(next);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        if (cause instanceof ApiError && cause.status === 404) remember(null);
        setError(cause instanceof Error ? cause.message : "Couldn't resume the story.");
      })
      .finally(() => {
        if (!cancelled) setBusy(null);
      });
    return () => {
      cancelled = true;
    };
  }, [save]);

  async function execute(kind: BusyState, operation: () => Promise<StoryRun>, answerId?: string) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(kind);
    setError(null);
    if (answerId) setCommittedAnswerId(answerId);
    try {
      save(await operation());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The scene couldn't finish. Try again.");
      if (run) {
        try {
          const latest = await api.get(run.id);
          save(latest);
          if (latest.revision > run.revision) setError(null);
          else setCommittedAnswerId(latest.pendingOptionId ?? answerId ?? null);
        } catch {
          /* Keep the readable transcript during a connection failure. */
        }
      }
    } finally {
      inFlight.current = false;
      setBusy(null);
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
      if (!inFlight.current) {
        setRun(null);
        setError(null);
        setCommittedAnswerId(null);
        remember(null);
      }
    },
  };
}
