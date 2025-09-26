import { defineConfig } from "vite";
import { coverageConfigDefaults } from "vitest/config";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    coverage: {
      exclude: [...coverageConfigDefaults.exclude, "src/main.jsx"],
    },
    environment: "jsdom",
    globals: true,
    setupFiles: "./test-setup.js",
  },
});
