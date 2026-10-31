import { useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { ArrowLeft, Clapperboard, LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";
import type { ModelStatus } from "@cloze-call/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { OpeningScreen } from "@/features/story/OpeningScreen";
import { StoryFeed } from "@/features/story/StoryFeed";
import { useStory } from "@/features/story/use-story";
import { api } from "@/lib/api";

export function App() {
  const story = useStory();
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelStatus | null>(null);
  async function checkModel() {
    setModel(null);
    try {
      setModel(await api.model());
    } catch {
      setModel({
        available: false,
        model: "Gemma",
        message: "The local API isn't responding. Start the development server, then check again.",
      });
    }
  }
  useEffect(() => {
    void checkModel();
  }, []);
  function reset() {
    story.reset();
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  const busy = story.busy !== null;
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell">
        <a href="#main-content" className="skip-link">
          Skip to story
        </a>
        <header className="site-header">
          <a
            href="#"
            className="wordmark"
            onClick={(event) => {
              event.preventDefault();
              if (!busy) reset();
            }}
            aria-label="Cloze Call home"
          >
            <Clapperboard size={21} />
            <span>
              CLOZE<span className="wordmark-call">CALL</span>
            </span>
            <span className="wordmark-period">.</span>
          </a>
          <div className="header-right">
            {story.run && (
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={reset}
                className="new-story-button"
              >
                <ArrowLeft size={13} />
                New screening
              </Button>
            )}
            <span className={`connection-chip ${model?.available ? "connected" : ""}`}>
              <span className="connection-dot" />
              {model === null
                ? "CONNECTING"
                : model.available
                  ? "GEMMA · LOCAL"
                  : "NARRATOR OFFLINE"}
            </span>
          </div>
        </header>
        <main id="main-content" className="main-content">
          {!story.run && (
            <OpeningScreen
              prompt={prompt}
              onPrompt={setPrompt}
              onStart={() => {
                void story.start(prompt);
              }}
              busy={busy}
              unavailable={model?.available === false}
            />
          )}
          {story.run && (
            <StoryFeed
              run={story.run}
              busy={busy}
              committedId={story.committedAnswerId}
              onChoose={(id) => {
                void story.choose(id);
              }}
              onAnswer={(id) => {
                void story.answer(id);
              }}
              onReset={reset}
            />
          )}
          {busy && (
            <div className="loading-scene" role="status">
              <LoaderCircle size={17} className="motion-safe:animate-spin" />
              <div>
                <span>
                  {story.busy === "resuming"
                    ? "Finding your place…"
                    : story.busy === "choosing"
                      ? "You make your move…"
                      : story.busy === "starting"
                        ? "Something stirs in the dark…"
                        : "The scene unfolds…"}
                </span>
                <p>
                  {story.busy === "choosing" ? "" : "Local narration can take a moment. Stay here."}
                </p>
              </div>
            </div>
          )}
          {story.error && (
            <Alert variant="destructive" className="story-error" role="alert">
              <TriangleAlert />
              <AlertTitle>The scene is on hold</AlertTitle>
              <AlertDescription>{story.error}</AlertDescription>
            </Alert>
          )}
          {model?.available === false && (
            <Alert className="model-notice">
              <TriangleAlert />
              <AlertTitle>The narrator needs a moment</AlertTitle>
              <AlertDescription>
                <p>{model.message}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void checkModel();
                  }}
                >
                  <RefreshCw size={12} />
                  Check connection
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </main>
        <footer className="site-footer">
          <span>A LITTLE ENGLISH. A LONG WAY FROM SAFE.</span>
          <span>
            LOCAL BY DESIGN <span className="footer-cross">+</span> MADE FOR HORROR FANS
          </span>
        </footer>
      </div>
    </MotionConfig>
  );
}
