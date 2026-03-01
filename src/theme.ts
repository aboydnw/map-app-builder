import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#eff6ff" },
          100: { value: "#dbeafe" },
          500: { value: "#3b82f6" },
          600: { value: "#2563eb" }
        }
      }
    }
  }
});

export const maptoolSystem = createSystem(defaultConfig, config);
