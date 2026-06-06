// vitest.config.js

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],

  test: {
    environment: "jsdom",
    globals: true,

    // ✅ changed .ts → .js
    setupFiles: ["./src/test/setup.js"],

    // ✅ changed ts/tsx → js/jsx
    include: ["src/**/*.{test,spec}.{js,jsx}"],
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});