import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { App } from "./App";
import { api, ApiError } from "@/lib/api";
import { storyFixture } from "@/testing/story-fixture";
import { starterPrompts } from "@cloze-call/shared";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  api: { model: vi.fn(), start: vi.fn(), get: vi.fn(), choose: vi.fn(), answer: vi.fn() },
}));

beforeEach(() => {
  localStorage.clear();
  window.history.replaceState(null, "", "/");
  vi.clearAllMocks();
  vi.mocked(api.model).mockResolvedValue({
    available: true,
    model: "gemma4:test",
    message: "Ready",
  });
});

describe("continuous story experience", () => {
  it("enables submission when a custom opening is typed", async () => {
    const fixture = storyFixture();
    vi.mocked(api.start).mockResolvedValue(fixture.opening);
    const user = userEvent.setup();
    render(<App />);
    const submit = screen.getByRole("button", { name: /enter the scene/i });
    expect(submit).toBeDisabled();
    await user.type(screen.getByRole("textbox"), "   ");
    expect(submit).toBeDisabled();
    await user.clear(screen.getByRole("textbox"));
    await user.type(screen.getByRole("textbox"), "Alien");
    expect(submit).toBeEnabled();
    await user.click(submit);
    await waitFor(() => expect(api.start).toHaveBeenCalledWith("Alien"));
  });

  it("uses starter cards as prompts and keeps the whole story visible through an ending", async () => {
    const fixture = storyFixture();
    vi.mocked(api.start).mockResolvedValue(fixture.opening);
    vi.mocked(api.choose).mockResolvedValue(fixture.selected);
    vi.mocked(api.answer).mockResolvedValue(fixture.ended);
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /don't leave the path/i }));
    expect(screen.getByRole("textbox")).toHaveValue(starterPrompts[0].prompt);
    expect(api.start).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: /enter the scene/i }));
    await user.click(await screen.findByRole("button", { name: /hide behind the fallen pine/i }));
    const choices = await screen.findByRole("group", { name: "Choose the missing word" });
    await user.click(within(choices).getByRole("button", { name: /keep/ }));
    await user.click(screen.getByRole("button", { name: /commit answer/i }));
    expect(await screen.findByRole("heading", { name: "You made it out." })).toBeInTheDocument();
    expect(screen.getByText(fixture.scene.text)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "THE WORDS YOU TOOK WITH YOU" }),
    ).toBeInTheDocument();
    expect(within(choices).getByRole("button", { name: /keep/ })).toBeDisabled();
  });

  it("locks a committed answer and retries it after a narrator failure", async () => {
    const fixture = storyFixture();
    vi.mocked(api.start).mockResolvedValue(fixture.opening);
    vi.mocked(api.choose).mockResolvedValue(fixture.selected);
    vi.mocked(api.answer)
      .mockRejectedValueOnce(new ApiError("The narrator timed out.", "NARRATOR_UNAVAILABLE", 503))
      .mockResolvedValueOnce(fixture.ended);
    vi.mocked(api.get).mockResolvedValue({
      ...fixture.selected,
      pendingOptionId: fixture.challenge.options[0]!.id,
    });
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("textbox"), fixture.opening.prompt);
    await user.click(screen.getByRole("button", { name: /enter the scene/i }));
    await user.click(await screen.findByRole("button", { name: /hide behind the fallen pine/i }));
    const choices = await screen.findByRole("group", { name: "Choose the missing word" });
    await user.click(within(choices).getByRole("button", { name: /keep/ }));
    await user.click(screen.getByRole("button", { name: /commit answer/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent("The narrator timed out.");
    expect(within(choices).getByRole("button", { name: /put/ })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: /retry this answer/i }));
    await screen.findByRole("heading", { name: "You made it out." });
    expect(api.answer).toHaveBeenNthCalledWith(
      1,
      fixture.selected.id,
      1,
      fixture.challenge.options[0]!.id,
    );
    expect(api.answer).toHaveBeenNthCalledWith(
      2,
      fixture.selected.id,
      1,
      fixture.challenge.options[0]!.id,
    );
  });

  it("replaces the home with loading immediately and gives the story its own URL", async () => {
    const fixture = storyFixture();
    let finish!: (run: typeof fixture.opening) => void;
    vi.mocked(api.start).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("textbox"), "Alien");
    await user.click(screen.getByRole("button", { name: /enter the scene/i }));
    await waitFor(() => expect(screen.queryByRole("textbox")).not.toBeInTheDocument());
    expect(screen.getByText("Hold your breath…")).toBeInTheDocument();
    expect(screen.getByText("Alien")).toBeInTheDocument();
    expect(screen.getAllByText("YOUR OPENING")).toHaveLength(1);
    expect(screen.queryByText("TRY A STARTING POINT")).not.toBeInTheDocument();
    finish(fixture.opening);
    await screen.findByText(fixture.scene.text);
    expect(window.location.pathname).toBe(`/stories/${fixture.opening.id}`);
    expect(localStorage.getItem("cloze-call:current-story")).toBeNull();
    expect(screen.getAllByText("YOUR OPENING")).toHaveLength(1);
    expect(screen.getByText(fixture.opening.prompt)).toBeInTheDocument();
  });

  it("stays home when an abandoned opening finishes after browser back", async () => {
    const fixture = storyFixture();
    let finish!: (run: typeof fixture.opening) => void;
    vi.mocked(api.start).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("textbox"), "Alien");
    await user.click(screen.getByRole("button", { name: /enter the scene/i }));
    await screen.findByText("Hold your breath…");
    act(() => {
      window.history.back();
    });
    await waitFor(() => expect(window.location.pathname).toBe("/"));
    await screen.findByRole("textbox");
    await act(async () => {
      finish(fixture.opening);
    });
    expect(window.location.pathname).toBe("/");
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.queryByText(fixture.scene.text)).not.toBeInTheDocument();
  });

  it("uses the prepared atmosphere while an answer is pending", async () => {
    const fixture = storyFixture();
    vi.mocked(api.start).mockResolvedValue(fixture.opening);
    vi.mocked(api.choose).mockResolvedValue({
      ...fixture.selected,
      loadingMessage: "The pines whisper…",
    });
    let finish!: (run: typeof fixture.ended) => void;
    vi.mocked(api.answer).mockReturnValue(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<App />);
    await user.type(screen.getByRole("textbox"), "Crystal Lake");
    await user.click(screen.getByRole("button", { name: /enter the scene/i }));
    await user.click(await screen.findByRole("button", { name: /hide behind the fallen pine/i }));
    const choices = await screen.findByRole("group", { name: "Choose the missing word" });
    await user.click(within(choices).getByRole("button", { name: /keep/ }));
    await user.click(screen.getByRole("button", { name: /commit answer/i }));
    expect(screen.getByText("The pines whisper…")).toBeInTheDocument();
    finish(fixture.ended);
    await screen.findByRole("heading", { name: "You made it out." });
  });

  it("keeps home independent of another tab's saved story", () => {
    localStorage.setItem("cloze-call:current-story", storyFixture().opening.id);
    render(<App />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(api.get).not.toHaveBeenCalled();
  });

  it("resumes a committed challenge after a browser refresh", async () => {
    const fixture = storyFixture();
    window.history.replaceState(null, "", `/stories/${fixture.selected.id}`);
    vi.mocked(api.get).mockResolvedValue({
      ...fixture.selected,
      pendingOptionId: fixture.challenge.options[0]!.id,
    });
    render(<App />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /retry this answer/i })).toBeEnabled(),
    );
    expect(screen.getByText(fixture.scene.text)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
