export class StoryError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: 400 | 404 | 409 | 429 | 502 | 503 = 400,
  ) {
    super(message);
    this.name = "StoryError";
  }
}
