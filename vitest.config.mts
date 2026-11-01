import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts", "src/**/__tests__/**/*.test.ts"],
    clearMocks: true,
    restoreMocks: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
      "server-only": path.resolve(rootDir, "./test/mocks/server-only.ts"),
    },
  },
});
