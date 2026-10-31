import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, ArrowRight, Check, MessageSquareText, X } from "lucide-react";
import type { FeedbackEntry, StoryRun } from "@final-cut/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChallengeView } from "./ChallengeView";
import { EndingView } from "./EndingView";

interface Props {
  run: StoryRun;
  busy: boolean;
  committedId: string | null;
  onChoose: (id: string) => void;
  onAnswer: (id: string) => void;
  onReset: () => void;
}
export function StoryFeed({ run, busy, committedId, onChoose, onAnswer, onReset }: Props) {
  const reducedMotion = useReducedMotion();
  const bottom = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const previousLength = useRef(run.entries.length);
  useEffect(() => {
    const update = () => {
      nearBottom.current =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 500;
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (run.entries.length > previousLength.current && nearBottom.current)
      bottom.current?.scrollIntoView({
        behavior: reducedMotion ? "instant" : "smooth",
        block: "end",
      });
    previousLength.current = run.entries.length;
  }, [run.entries.length, reducedMotion]);
  const feedback = run.entries.filter((entry): entry is FeedbackEntry => entry.kind === "feedback");
  const currentChallenge = run.entries.findLast((entry) => entry.kind === "challenge");
  const currentScene = run.entries.findLast((entry) => entry.kind === "scene");
  let sceneNumber = 0;

  return (
    <div className="story-feed" id="story-top">
      <div className="story-heading">
        <p className="eyebrow">NOW SCREENING · YOUR CUT</p>
        <h1>{run.title}</h1>
        <p>The story is yours from here.</p>
      </div>
      <div className="setup-message">
        <div className="setup-label">
          <MessageSquareText size={13} />
          YOUR OPENING
        </div>
        <p>{run.prompt}</p>
      </div>
      {run.entries.map((entry) => {
        const sceneIndex = entry.kind === "scene" ? ++sceneNumber : sceneNumber;
        return (
          <motion.div
            key={entry.id}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
          >
            {entry.kind === "scene" && (
              <section className="narration-section" aria-labelledby={`scene-${entry.id}`}>
                <div className="scene-label">
                  <span>SCENE {String(sceneIndex).padStart(2, "0")}</span>
                  {entry.recovery ? (
                    <Badge variant="outline" className="recovery-badge">
                      ONE MORE CHANCE
                    </Badge>
                  ) : (
                    <span className="scene-line" />
                  )}
                </div>
                <h2 id={`scene-${entry.id}`}>{entry.title}</h2>
                <p className="narration-copy">{entry.text}</p>
                {entry.actions.length > 0 && (
                  <div className="story-actions">
                    <div className="section-label">
                      <span>WHAT DO YOU DO?</span>
                      <ArrowDownRight size={14} />
                    </div>
                    {entry.actions.map((action, index) => (
                      <Button
                        key={action.id}
                        variant="outline"
                        className="story-action"
                        disabled={busy || run.phase !== "choosing" || currentScene?.id !== entry.id}
                        onClick={() => onChoose(action.id)}
                      >
                        <span className="action-number">0{index + 1}</span>
                        <span>{action.label}</span>
                        <ArrowRight size={15} className="ml-auto shrink-0" />
                      </Button>
                    ))}
                  </div>
                )}
              </section>
            )}
            {entry.kind === "action" && (
              <div className="chosen-action">
                <ArrowRight size={14} />
                <span>{entry.text}</span>
              </div>
            )}
            {entry.kind === "challenge" && (
              <ChallengeView
                challenge={entry}
                feedback={feedback.find((item) => item.challengeId === entry.id)}
                active={run.phase === "answering" && currentChallenge?.id === entry.id}
                busy={busy}
                committedId={currentChallenge?.id === entry.id ? committedId : null}
                onAnswer={onAnswer}
              />
            )}
            {entry.kind === "feedback" && (
              <div
                className={`vocabulary-feedback ${entry.correct ? "feedback-correct" : "feedback-incorrect"}`}
              >
                {entry.correct ? <Check size={15} /> : <X size={15} />}
                <span>
                  <strong>{entry.expression}</strong>
                  <span> — {entry.meaning}</span>
                  {!entry.correct && (
                    <span className="corrected-sentence">{entry.completedSentence}</span>
                  )}
                </span>
              </div>
            )}
            {entry.kind === "ending" && (
              <EndingView ending={entry} feedback={feedback} onReset={onReset} />
            )}
          </motion.div>
        );
      })}
      <div ref={bottom} />
    </div>
  );
}
