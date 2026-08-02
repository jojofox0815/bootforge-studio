import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const desktopRoot = fileURLToPath(new URL("./desktop", import.meta.url));

export default defineConfig({
  root: desktopRoot,
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  css: {
    postcss: fileURLToPath(new URL("./postcss.config.mjs", import.meta.url)),
  },
  server: {
    host: "127.0.0.1",
    port: 1420,
    strictPort: true,
    fs: {
      allow: [projectRoot],
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    target: "chrome105",
  },
});
