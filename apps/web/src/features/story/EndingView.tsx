import { ArrowUp, RotateCcw } from "lucide-react";
import type { EndingEntry, FeedbackEntry } from "@cloze-call/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function EndingView({
  ending,
  feedback,
  onReset,
}: {
  ending: EndingEntry;
  feedback: FeedbackEntry[];
  onReset: () => void;
}) {
  const escaped = ending.verdict === "escaped";
  const expressions = [...new Map(feedback.map((item) => [item.expression, item])).values()];
  return (
    <section
      className={`ending-section ${escaped ? "ending-escaped" : "ending-dead"}`}
      aria-labelledby="verdict-title"
    >
      <Badge variant="outline" className="verdict-badge">
        FINAL VERDICT · {escaped ? "SURVIVED" : "DID NOT SURVIVE"}
      </Badge>
      <h2 id="verdict-title">{escaped ? "You made it out." : "Cut to black."}</h2>
      <h3 className="ending-scene-title">{ending.title}</h3>
      <p className="narration-copy">{ending.text}</p>
      <div className="review-section">
        <div className="section-label">
          <h3>THE WORDS YOU TOOK WITH YOU</h3>
          <span>
            {feedback.filter((item) => item.correct).length} / {feedback.length} CORRECT
          </span>
        </div>
        {expressions.map((item) => (
          <div key={item.expression} className="review-row">
            <span className={item.correct ? "review-status correct" : "review-status"}>
              {item.correct ? "+" : "↗"}
            </span>
            <span>
              <strong>{item.expression}</strong>
              <span className="review-meaning">{item.meaning}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="ending-actions">
        <Button onClick={onReset}>
          <RotateCcw size={15} />
          New Story
        </Button>
        <a href="#story-top" className="read-back">
          Read your story again
          <ArrowUp size={14} />
        </a>
      </div>
    </section>
  );
}
