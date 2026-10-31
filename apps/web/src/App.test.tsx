import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { App } from "./App";
import { api, ApiError } from "@/lib/api";
import { storyFixture } from "@/testing/story-fixture";
import { starterPrompts } from "@final-cut/shared";

vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  api: { model: vi.fn(), start: vi.fn(), get: vi.fn(), choose: vi.fn(), answer: vi.fn() },
}));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  vi.mocked(api.model).mockResolvedValue({
    available: true,
    model: "gemma4:test",
    message: "Ready",
  });
});

describe("continuous story experience", () => {
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

  it("resumes a committed challenge after a browser refresh", async () => {
    const fixture = storyFixture();
    localStorage.setItem("final-cut:current-story", fixture.selected.id);
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
