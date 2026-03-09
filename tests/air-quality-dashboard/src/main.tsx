import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CanvasContext } from "@luma.gl/core";
import { MapToolProvider } from "@maptool/core";
import App from "./App";
import "./styles.css";

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
