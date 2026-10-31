import { useState } from "react";
import { ArrowRight, Check, LockKeyhole, X } from "lucide-react";
import type { ChallengeEntry, FeedbackEntry } from "@cloze-call/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  challenge: ChallengeEntry;
  feedback: FeedbackEntry | undefined;
  active: boolean;
  busy: boolean;
  committedId: string | null;
  onAnswer: (id: string) => void;
}
export function ChallengeView({ challenge, feedback, active, busy, committedId, onAnswer }: Props) {
  const [selection, setSelection] = useState<string | null>(null);
  const selectedId = feedback?.optionId ?? committedId ?? selection;
  const selectedText = challenge.options.find((option) => option.id === selectedId)?.text;
  const [before, after] = challenge.attempt.split("___");
  return (
    <Card className={cn("challenge-card", feedback && "challenge-completed")}>
      <div className="challenge-eyebrow">
        <span>{feedback ? "THE ATTEMPT · RESOLVED" : "THE ATTEMPT"}</span>
        {feedback && <LockKeyhole size={12} aria-label="Answer locked" />}
      </div>
      <p className="attempt-copy">
        {before}
        <span className={cn("cloze-gap", selectedText && "cloze-filled")}>
          {selectedText ?? "······"}
        </span>
        {after}
      </p>
      <div className="answer-options" role="group" aria-label="Choose the missing word">
        {challenge.options.map((option, index) => (
          <Button
            key={option.id}
            type="button"
            variant="outline"
            disabled={!active || busy || committedId !== null}
            aria-pressed={selectedId === option.id}
            onClick={() => setSelection(option.id)}
            className={cn(
              "answer-option",
              selectedId === option.id && "answer-selected",
              feedback?.correctOptionId === option.id && "answer-correct",
              feedback &&
                !feedback.correct &&
                feedback.optionId === option.id &&
                "answer-incorrect",
            )}
          >
            <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
            <span>{option.text}</span>
            {feedback?.correctOptionId === option.id && <Check size={14} className="ml-auto" />}
            {feedback && !feedback.correct && feedback.optionId === option.id && (
              <X size={14} className="ml-auto" />
            )}
          </Button>
        ))}
      </div>
      {active && (
        <div className="challenge-footer">
          <span>One choice. Then the story moves.</span>
          <Button
            disabled={!selectedId || busy}
            onClick={() => {
              if (selectedId) onAnswer(selectedId);
            }}
          >
            {busy ? "The scene unfolds…" : committedId ? "Retry this answer" : "Commit answer"}
            <ArrowRight size={15} />
          </Button>
        </div>
      )}
    </Card>
  );
}
