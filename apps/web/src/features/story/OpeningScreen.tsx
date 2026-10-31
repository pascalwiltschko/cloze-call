import { ArrowDownRight, ArrowRight, CornerDownLeft } from "lucide-react";
import { starterPrompts } from "@final-cut/shared";
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
      <section className="opening-hero" aria-labelledby="opening-title">
        <p className="eyebrow">
          <span className="tiny-cross">+</span> INTERACTIVE HORROR / ENGLISH B1–B2
        </p>
        <h1 id="opening-title">
          You know the movie.
          <br />
          <span>Survive your version.</span>
        </h1>
        <p className="hero-copy">
          You've watched them make the wrong choice.
          <br className="hidden sm:block" /> Now it's your turn. Find the words. Make it out.
        </p>
      </section>

      <form
        className="opening-form"
        onSubmit={(event) => {
          event.preventDefault();
          onStart();
        }}
      >
        <div className="section-label">
          <label htmlFor="movie-prompt">SET THE SCENE</label>
          <span>
            YOUR CUT STARTS HERE <ArrowDownRight size={13} />
          </span>
        </div>
        <div className="prompt-frame">
          <Textarea
            id="movie-prompt"
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
            <span>A familiar world. An original escape.</span>
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
          <h2 id="starters-title">OR START AT CRYSTAL LAKE</h2>
          <span>FRIDAY THE 13TH, PART 2</span>
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
        <p className="starter-caption">
          Original openings inspired by the film. Your choices take it from here.
        </p>
      </section>

      <div className="how-it-works">
        <span>
          <i>01</i> Choose an action
        </span>
        <span>
          <i>02</i> Find the missing word
        </span>
        <span>
          <i>03</i> Live with what happens
        </span>
      </div>
    </div>
  );
}
