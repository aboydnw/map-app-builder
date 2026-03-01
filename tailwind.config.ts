import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  prefix: "mt-",
  theme: {
    extend: {}
  },
  plugins: []
} satisfies Config;
