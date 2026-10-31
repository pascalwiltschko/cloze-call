import { defineConfig } from "vite-plus";
export default defineConfig({
  pack: { entry: ["src/server.ts"], platform: "node", format: ["esm"], outDir: "dist", dts: false },
  test: { name: "api", environment: "node", include: ["src/**/*.test.ts"] },
});
