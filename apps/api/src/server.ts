import { serve } from "@hono/node-server";
import { createApp } from "./app.ts";
serve(
  { fetch: createApp().fetch, hostname: "127.0.0.1", port: Number(process.env.PORT ?? 3001) },
  (info) => {
    console.log(`Final Cut API: http://127.0.0.1:${info.port}`);
  },
);
