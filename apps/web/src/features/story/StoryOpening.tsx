import { MessageSquareText } from "lucide-react";

export function StoryOpening({ prompt }: { prompt: string }) {
  return (
    <div className="setup-message">
      <div className="setup-label">
        <MessageSquareText size={13} />
        YOUR OPENING
      </div>
      <p>{prompt}</p>
    </div>
  );
}
