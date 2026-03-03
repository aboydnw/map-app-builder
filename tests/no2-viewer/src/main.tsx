import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CanvasContext } from "@luma.gl/core";
import { MapToolProvider } from "@maptool/core";
import App from "./App";
import "./styles.css";

// Workaround for luma.gl v9.2.6 bug: WebGLCanvasContext registers a
// ResizeObserver before WebGLDevice sets `device.limits`. The observer fires
// immediately, calling getMaxDrawingBufferSize() which reads
// `this.device.limits.maxTextureDimension2D` — but limits is still undefined.
//
// Fix: patch the prototype to return a safe fallback (4096×4096) when limits
// isn't ready yet. The correct value is used on subsequent resizes.
const orig = CanvasContext.prototype.getMaxDrawingBufferSize;
CanvasContext.prototype.getMaxDrawingBufferSize = function () {
  if (!this.device?.limits) return [4096, 4096];
  return orig.call(this);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MapToolProvider>
      <App />
    </MapToolProvider>
  </StrictMode>
);
