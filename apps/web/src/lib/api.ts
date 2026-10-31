import { apiErrorSchema, modelStatusSchema, runSchema } from "@final-cut/shared";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  schema: { parse: (value: unknown) => T },
  body?: unknown,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...(body === undefined
        ? {}
        : {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }),
      signal: AbortSignal.timeout(120000),
    });
  } catch {
    throw new ApiError(
      "The projection room isn't responding. Check the local server, then retry.",
      "NETWORK",
      0,
    );
  }
  const payload: unknown = await response.json();
  if (!response.ok) {
    const error = apiErrorSchema.safeParse(payload);
    throw new ApiError(
      error.success ? error.data.error.message : "The scene couldn't load. Try again.",
      error.success ? error.data.error.code : "UNKNOWN",
      response.status,
    );
  }
  return schema.parse(payload);
}

export const api = {
  model: () => request("/model", modelStatusSchema),
  start: (prompt: string) => request("/stories", runSchema, { prompt }),
  get: (id: string) => request(`/stories/${id}`, runSchema),
  choose: (id: string, revision: number, actionId: string) =>
    request(`/stories/${id}/actions`, runSchema, { revision, actionId }),
  answer: (id: string, revision: number, optionId: string) =>
    request(`/stories/${id}/answers`, runSchema, { revision, optionId }),
};
