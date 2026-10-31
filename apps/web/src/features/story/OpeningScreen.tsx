import { ArrowRight, CornerDownLeft } from "lucide-react";
import { starterPrompts } from "@cloze-call/shared";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  prompt: string;
  onPrompt: (value: string) => void;
  onStart: () => void;
  busy: boolean;
  unavailable: boolean;
}
export function OpeningScreen({ prompt, onPrompt, onStart, busy, unavailable }: Props) {
  return (
    <div className="opening-screen">
      <form
        className="opening-form"
        onSubmit={(event) => {
          event.preventDefault();
          onStart();
        }}
      >
        <h1 className="opening-title">
          <label htmlFor="movie-prompt">What's your close call?</label>
        </h1>
        <p className="opening-help" id="prompt-help">
          Describe a movie and situation, then choose actions and complete the missing words to
          escape.
        </p>
        <div className="prompt-frame">
          <Textarea
            id="movie-prompt"
            aria-describedby="prompt-help"
            value={prompt}
            onChange={(event) => onPrompt(event.target.value)}
            disabled={busy}
            maxLength={2000}
            placeholder="Name the movie. Tell us where you are. What's following you?"
            className="movie-prompt"
            onKeyDown={(event) => {
              if (
                (event.metaKey || event.ctrlKey) &&
                event.key === "Enter" &&
                prompt.trim().length >= 12 &&
                !busy &&
                !unavailable
              ) {
                event.preventDefault();
                onStart();
              }
            }}
          />
          <div className="prompt-toolbar">
            <Button
              type="submit"
              disabled={busy || unavailable || prompt.trim().length < 12}
              className="enter-button"
            >
              {busy ? "Setting the scene…" : "Enter the scene"}
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
        <p className="keyboard-note">
          <CornerDownLeft size={11} /> Ctrl / ⌘ + Enter to begin
        </p>
      </form>

      <section className="starters-section" aria-labelledby="starters-title">
        <div className="section-label">
          <h2 id="starters-title">TRY A STARTING POINT</h2>
        </div>
        <div className="starter-grid">
          {starterPrompts.map((starter, index) => (
            <Card
              key={starter.id}
              className={cn("starter-card", prompt === starter.prompt && "starter-selected")}
            >
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  onPrompt(starter.prompt);
                  document.getElementById("movie-prompt")?.focus();
                }}
                aria-pressed={prompt === starter.prompt}
                className="starter-button"
              >
                <span className="starter-meta">
                  <span>{starter.label}</span>
                  <span>0{index + 1}</span>
                </span>
                <span className="starter-title">{starter.title}</span>
                <span className="starter-description">{starter.description}</span>
                <span className="starter-tail">
                  Use this opening <ArrowRight size={13} />
                </span>
              </button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
