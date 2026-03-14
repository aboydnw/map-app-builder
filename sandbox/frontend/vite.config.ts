import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5185,
    proxy: {
      "/api": process.env.API_PROXY_TARGET || "http://localhost:8000",
      "/raster": {
        target: process.env.RASTER_TILER_PROXY_TARGET || "http://localhost:8082",
        rewrite: (path: string) => path.replace(/^\/raster/, ""),
      },
      "/vector": {
        target: process.env.VECTOR_TILER_PROXY_TARGET || "http://localhost:8083",
        rewrite: (path: string) => path.replace(/^\/vector/, ""),
      },
    },
  },
  resolve: {
    preserveSymlinks: true,
    dedupe: [
      "react",
      "react-dom",
      "@deck.gl/core",
      "@deck.gl/layers",
      "@deck.gl/geo-layers",
      "@deck.gl/react",
      "@deck.gl/extensions",
      "@deck.gl/mesh-layers",
      "@deck.gl/widgets",
      "@luma.gl/core",
      "@luma.gl/engine",
      "@luma.gl/webgl",
      "@luma.gl/shadertools",
      "@luma.gl/constants",
      "@luma.gl/gltf",
      "@probe.gl/env",
      "@probe.gl/log",
      "@probe.gl/stats",
    ],
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
});
