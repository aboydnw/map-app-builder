import { execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const APPS = {
  "air-quality-dashboard": 5174,
  "building-footprints": 5175,
  "fire-tracker": 5176,
  "forest-change-viewer": 5177,
  "land-cover-explorer": 5178,
  "no2-viewer": 5179,
  "precipitation-viewer": 5180,
  "sea-surface-temp": 5181,
};

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("\nAvailable test apps:\n");
  for (const [name, port] of Object.entries(APPS)) {
    console.log(`  ${name.padEnd(26)} http://localhost:${port}/`);
  }
  console.log("\nUsage:");
  console.log("  node serve-apps.mjs <app-name> [app-name...]");
  console.log("  node serve-apps.mjs --all\n");
  process.exit(0);
}

const requested = args.includes("--all")
  ? Object.keys(APPS)
  : args;

const invalid = requested.filter((name) => !(name in APPS));
if (invalid.length) {
  console.error(`Unknown app(s): ${invalid.join(", ")}`);
  console.error(`Available: ${Object.keys(APPS).join(", ")}`);
  process.exit(1);
}

for (const name of requested) {
  const dir = resolve("tests", name);
  if (!existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    process.exit(1);
  }
}

console.log("Building @maptool/core...\n");
execSync("npm run build", { stdio: "inherit" });
console.log("");

const children = [];

for (const name of requested) {
  const port = APPS[name];
  const child = spawn("npx", ["vite", "--port", String(port)], {
    cwd: resolve("tests", name),
    stdio: ["ignore", "pipe", "pipe"],
  });

  const prefix = `[${name}]`;
  child.stdout.on("data", (data) => {
    for (const line of data.toString().split("\n").filter(Boolean)) {
      console.log(`${prefix} ${line}`);
    }
  });
  child.stderr.on("data", (data) => {
    for (const line of data.toString().split("\n").filter(Boolean)) {
      console.error(`${prefix} ${line}`);
    }
  });
  child.on("exit", (code) => {
    console.log(`${prefix} exited (code ${code})`);
  });

  children.push(child);
}

process.on("SIGINT", () => {
  for (const child of children) child.kill();
  process.exit(0);
});

process.on("SIGTERM", () => {
  for (const child of children) child.kill();
  process.exit(0);
});
