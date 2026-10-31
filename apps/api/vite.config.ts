import { defineConfig } from "vite-plus";
export default defineConfig({
  pack: {
    entry: ["src/server.ts"],
    platform: "node",
    format: ["esm"],
    outDir: "dist",
    dts: false,
    deps: { alwaysBundle: ["@cloze-call/shared"] },
  },
  test: { name: "api", environment: "node", include: ["src/**/*.test.ts"] },
});
