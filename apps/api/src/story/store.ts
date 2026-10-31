import { StoryError } from "../domain/errors.ts";

export class MemoryStore<T> {
  private readonly records = new Map<string, { value: T; touched: number }>();
  constructor(
    private readonly ttlMs = 2 * 60 * 60 * 1000,
    private readonly capacity = 100,
    private readonly now = Date.now,
  ) {}

  add(id: string, value: T): void {
    for (const [key, record] of this.records)
      if (this.now() - record.touched > this.ttlMs) this.records.delete(key);
    if (this.records.size >= this.capacity)
      throw new StoryError("CAPACITY", "The projection room is full. Try again later.", 429);
    this.records.set(id, { value, touched: this.now() });
  }
  get(id: string): T {
    const record = this.records.get(id);
    if (!record || this.now() - record.touched > this.ttlMs) {
      this.records.delete(id);
      throw new StoryError("NOT_FOUND", "This story has expired. Start a new screening.", 404);
    }
    record.touched = this.now();
    return record.value;
  }
}
