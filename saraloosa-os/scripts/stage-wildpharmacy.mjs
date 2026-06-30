/* =====================================================================
   STAGE WILD PHARMACY into the Astro public/ folder  (runs as `prebuild`)
   ---------------------------------------------------------------------
   Copies the self-contained Hexi's Wild Pharmacy labyrinth
   (wildroots/wild-pharmacy/: index.html + stations.json + slides/) into
   saraloosa-os/public/wild-pharmacy/ so it ships with the Astro site at
   /wild-pharmacy/. Sibling of stage-digdeeper.mjs.

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

for (const item of ["index.html", "stations.json", "slides", "scenes", "audio", "assets"]) {
  const s = join(SRC, item);
  if (existsSync(s)) cpSync(s, join(OUT, item), { recursive: true });
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
