import { BrowserRouter, Routes, Route, useParams, useNavigate, Link } from "react-router";
import packageInfo from "../../../package.json";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from "motion/react";
import { ArrowLeft, LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";
import type { ModelStatus } from "@cloze-call/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { OpeningScreen } from "@/features/story/OpeningScreen";
import { StoryOpening } from "@/features/story/StoryOpening";
import { StoryFeed } from "@/features/story/StoryFeed";
import { useStory } from "@/features/story/use-story";
import { api } from "@/lib/api";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StoryPage />}>
          <Route index element={<></>} />
          <Route path="stories/:storyId" element={<></>} />
        </Route>
        <Route path="*" element={<Link to="/">Return home</Link>} />
      </Routes>
    </BrowserRouter>
  );
}

function StoryPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const story = useStory(storyId ?? null);
  const starting = story.busy === "starting";
  const [startError, setStartError] = useState(false);
  async function start() {
    setStartError(false);
    const next = await story.start(prompt);
    if (window.location.pathname !== "/stories/new") return;
    if (next) void navigate(`/stories/${next.id}`, { replace: true });
    else setStartError(true);
  }
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<ModelStatus | null>(null);
  async function checkModel() {
    setModel(null);
    try {
      setModel(await api.model());
    } catch {
      setModel({
        available: false,
        model: "Model unavailable",
        message: "The local API isn't responding. Start the development server, then check again.",
      });
    }
  }
  useEffect(() => {
    void checkModel();
  }, []);
  function reset() {
    void navigate("/");
    setStartError(false);
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
          <Link
            to="/"
            className="wordmark"
            onClick={(event) => {
              event.preventDefault();
              if (!busy) reset();
            }}
            aria-label="Cloze Call home"
          >
            <img src="/cloze-call-icon.png" alt="" className="app-logo" width={64} height={64} />
            <span>Cloze_Call</span>
          </Link>
          <div className="header-right">
            {storyId && (
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={reset}
                className="new-story-button"
              >
                <ArrowLeft size={13} />
                Go Back
              </Button>
            )}
          </div>
        </header>
        <main id="main-content" className="main-content">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={storyId ? "story" : "home"}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.2 }}
            >
              {!storyId && (
                <OpeningScreen
                  prompt={prompt}
                  onPrompt={setPrompt}
                  onStart={() => {
                    void navigate("/stories/new");
                    void start();
                  }}
                  busy={busy}
                  unavailable={model?.available === false}
                />
              )}
              {storyId === "new" && !story.run && prompt.trim() && (
                <div className="story-feed">
                  <StoryOpening prompt={prompt.trim()} />
                </div>
              )}
              {storyId && story.run && (
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
                        : story.run?.loadingMessage || "Hold your breath…"}
                    </span>
                  </div>
                </div>
              )}
              {storyId === "new" && !starting && !story.run && !startError && (
                <Link to="/">Start a new story</Link>
              )}
              {startError && (
                <Button
                  onClick={() => {
                    void start();
                  }}
                >
                  Try again
                </Button>
              )}
              {story.error && (
                <Alert variant="destructive" className="story-error" role="alert">
                  <TriangleAlert />
                  <AlertTitle>The scene is on hold</AlertTitle>
                  <AlertDescription>{story.error}</AlertDescription>
                </Alert>
              )}
            </motion.div>
          </AnimatePresence>
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
          <span className={`connection-chip ${model?.available ? "connected" : ""}`}>
            <span className="connection-dot" />
            {model === null ? "Connecting…" : (model.model ?? "Model unavailable")}
            {model && !model.available && " · Offline"}
          </span>
          <span>v{packageInfo.version}</span>
        </footer>
      </div>
    </MotionConfig>
  );
}
