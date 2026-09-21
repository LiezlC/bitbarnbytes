/* Re-inject the shared site nav into every committed arcade cabinet
   (public/arcade/<game>/index.html). Run: node scripts/inject-arcade-nav.mjs */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { injectNav } from "./site-nav.mjs";

const ARCADE = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "arcade");
for (const game of readdirSync(ARCADE)) {
  const f = join(ARCADE, game, "index.html");
  if (!existsSync(f)) continue;
  writeFileSync(f, injectNav(readFileSync(f, "utf8"), "/arcade"), "utf8");
  console.log(`[inject-arcade-nav] ${game}`);
}
