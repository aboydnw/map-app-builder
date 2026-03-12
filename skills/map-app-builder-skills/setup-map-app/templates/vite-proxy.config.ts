// Example vite.config.ts with a CORS proxy for external APIs that don't
// include Access-Control-Allow-Origin headers (e.g. NASA FIRMS CSV endpoint).
// This only works in dev mode — for production, use a server-side proxy.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      "/api/firms": {
        target: "https://firms.modaps.eosdis.nasa.gov",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/firms/, ""),
      },
    },
  },
});
