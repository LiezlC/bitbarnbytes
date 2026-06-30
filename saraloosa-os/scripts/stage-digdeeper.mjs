/* =====================================================================
   STAGE DIG-DEEPER into the Astro public/ folder  (runs as `prebuild`)
   ---------------------------------------------------------------------
   Node port of wildroots/scripts/build-deploy.py. Assembles the
   self-contained Dig Deeper bundle (the page + only the assets it
   references) into saraloosa-os/public/dig-deeper/ so it ships with the
   Astro site at /dig-deeper/. The page's fetch('/api/brew' | '/api/ask')
   calls then hit the Astro endpoints on the same domain.

   public/dig-deeper/ is gitignored and regenerated on every build, so the
   18MB of PDFs/images live in the repo only once (under wildroots/).
   ===================================================================== */
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename, relative } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));         // saraloosa-os/scripts
const REPO = join(HERE, "..", "..");                          // repo root
const WILDROOTS = join(REPO, "wildroots");
const SRC_HTML = join(WILDROOTS, "dig-deeper", "index.html");
const PUBLIC = join(HERE, "..", "public");
const OUT = join(PUBLIC, "dig-deeper");

if (!existsSync(SRC_HTML)) {
  console.warn(`[stage-digdeeper] ${SRC_HTML} not found — skipping (dig-deeper not staged).`);
  process.exit(0);
}

const html = readFileSync(SRC_HTML, "utf8");

// every quoted relative path to a content asset mentioned anywhere in the page
const refs = new Set();
for (const m of html.matchAll(/"([^"]+?\.(?:md|pdf|webp|png))"/g)) {
  const r = m[1];
  if (r.startsWith("http")) continue;
  refs.add(r.replace(/^(\.\.?\/|\/)+/, ""));
}

// recursive file finder for bare filenames whose folder is added at runtime
function findByName(name) {
  const stack = [WILDROOTS];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir)) {
      if (entry === "_deploy" || entry === "node_modules") continue;
      const p = join(dir, entry);
      const st = statSync(p);
      if (st.isDirectory()) stack.push(p);
      else if (entry === name) return p;
    }
  }
  return null;
}

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let copied = 0, total = 0;
const missing = [];
for (const rel of [...refs].sort()) {
  let src = join(WILDROOTS, rel);
  let outRel = rel;
  if (!existsSync(src)) {
    const hit = findByName(basename(rel));
    if (hit) { src = hit; outRel = relative(WILDROOTS, hit).split("\\").join("/"); }
    // absolute refs like /img/cover/*.webp are committed static assets under
    // public/ — served directly, not staged from wildroots/. Not missing.
    else if (existsSync(join(PUBLIC, rel))) { continue; }
    else { missing.push(rel); continue; }
  }
  const dst = join(OUT, outRel);
  mkdirSync(dirname(dst), { recursive: true });
  copyFileSync(src, dst);
  copied++; total += statSync(src).size;
}

// the page itself, served from /dig-deeper/ with ../ rewritten to ./
writeFileSync(join(OUT, "index.html"), html.replaceAll('"../', '"./').replaceAll("'../", "'./"), "utf8");

// moat artifacts: at /dig-deeper/ and (llms.txt) at the site root
for (const a of ["corpus.json", "llms.txt"]) {
  const p = join(WILDROOTS, "dig-deeper", a);
  if (existsSync(p)) copyFileSync(p, join(OUT, a));
}
const llms = join(WILDROOTS, "dig-deeper", "llms.txt");
if (existsSync(llms)) copyFileSync(llms, join(HERE, "..", "public", "llms.txt"));

console.log(`[stage-digdeeper] ${copied} assets, ${(total / 1024 / 1024).toFixed(1)} MB -> public/dig-deeper/ + index.html`);
for (const m of missing) console.warn(`[stage-digdeeper] MISSING (link will 404): ${m}`);
