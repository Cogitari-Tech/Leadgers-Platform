import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@leadgers/core": path.resolve(__dirname, "../../packages/core/src"),
    },
  },
  css: {
    devSourcemap: false,
  },
  build: {
    target: "esnext",
    sourcemap: false, // SEC-02: Disable sourcemaps to prevent exposing code in production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: [
            "react",
            "react-dom",
            "react-router-dom",
            "zustand",
            "@supabase/supabase-js",
          ],
          ui: ["lucide-react", "recharts"],
        },
      },
    },
  },
});
