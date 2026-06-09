import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    environmentMatchGlobs: [
      // Route Handlers and server-side code run in Node
      ["src/app/api/**", "node"],
      ["src/lib/dynamo/**", "node"],
      ["src/lib/seed/**", "node"],
      ["src/lib/bedrock/**", "node"],
      // Smoke tests run in Node
      ["src/test/smoke/**", "node"],
      // Components run in jsdom
      ["src/components/**", "jsdom"],
      ["src/app/(shop)/**", "jsdom"],
      ["src/app/(admin)/**", "jsdom"],
    ],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
