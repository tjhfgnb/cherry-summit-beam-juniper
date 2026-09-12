import path from "node:path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";

const src = path.resolve("src");
const empty = path.join(src, "lib/spa-empty.ts");

/** Client-only SPA bundle for Cloudflare Pages (no SSR / no Start hydrator). */
export default defineConfig({
  plugins: [tailwindcss(), viteReact()],
  resolve: {
    alias: [
      { find: "@/lib/wordbook-api", replacement: path.join(src, "lib/spa-wordbook-api.ts") },
      { find: "@/lib/wordbook-data.server", replacement: empty },
      { find: "@/lib/auth/server", replacement: empty },
      { find: "@/lib/auth/middleware", replacement: empty },
      { find: "@tanstack/start-server-core", replacement: empty },
      { find: "@tanstack/react-start", replacement: empty },
      { find: "@", replacement: src },
    ],
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve("src/spa-entry.tsx"),
      output: {
        entryFileNames: "assets/spa.js",
        chunkFileNames: "assets/spa-[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
});
