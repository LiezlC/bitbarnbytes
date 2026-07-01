/* =====================================================================
   STAGE WILD PHARMACY into the Astro public/ folder  (runs as `prebuild`)
   ---------------------------------------------------------------------
   Copies the self-contained Hexi's Wild Pharmacy labyrinth
   (wildroots/wild-pharmacy/: index.html + stations.json + slides/) AND the
   125-plant Pharmacopoeia 3D explorer (pharmacopoeia/ -> /wild-pharmacy/
   pharmacopoeia/) into saraloosa-os/public/wild-pharmacy/ so they ship with
   the Astro site at /wild-pharmacy/. Sibling of stage-digdeeper.mjs.

   public/wild-pharmacy/ is gitignored and regenerated on every build.
   NOTE: the heavy clips (slides/*.mp4) and narration audio (audio/*.mp3)
   now stream from Cloudinary (folder wild-pharmacy/*) and are gitignored,
   so on CI only the .webp plates + transcripts copy here. The existsSync
   guards below tolerate the missing media. index.html points at the CDN.
   ===================================================================== */
import { existsSync, rmSync, mkdirSync, cpSync, statSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));      // saraloosa-os/scripts
const REPO = join(HERE, "..", "..");                       // repo root
const SRC = join(REPO, "wildroots", "wild-pharmacy");
const OUT = join(HERE, "..", "public", "wild-pharmacy");

if (!existsSync(join(SRC, "index.html"))) {
  console.warn(`[stage-wildpharmacy] ${SRC}/index.html not found — skipping.`);
  process.exit(0);
}

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const item of ["index.html", "stations.json", "slides", "scenes", "audio", "assets", "manifest.webmanifest", "sw.js"]) {
  const s = join(SRC, item);
  if (existsSync(s)) cpSync(s, join(OUT, item), { recursive: true });
}

// --- Pharmacopoeia: the 125-plant 3D knowledge-graph explorer ---
// Self-contained graph.html (graph data inlined; three + 3d-force-graph via CDN)
// with the garden backdrop and per-plant botanical plates. Light enough to ship
// directly (~2.6 MB), served at /wild-pharmacy/pharmacopoeia/. The heavy source
// JSON (graph.json/plants.json) is not needed at runtime, so it is not copied.
const PSRC = join(SRC, "pharmacopoeia");
if (existsSync(join(PSRC, "graph.html"))) {
  const POUT = join(OUT, "pharmacopoeia");
  mkdirSync(POUT, { recursive: true });
  cpSync(join(PSRC, "graph.html"), join(POUT, "index.html"));
  for (const item of ["garden-bg.jpg", "pics"]) {
    const s = join(PSRC, item);
    if (existsSync(s)) cpSync(s, join(POUT, item), { recursive: true });
  }
}

let bytes = 0, files = 0;
(function walk(d) {
  for (const e of readdirSync(d)) {
    const p = join(d, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p); else { bytes += st.size; files++; }
  }
})(OUT);

console.log(`[stage-wildpharmacy] ${files} files, ${(bytes / 1024 / 1024).toFixed(1)} MB -> public/wild-pharmacy/`);
