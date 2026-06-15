/* =====================================================================
   pdf-to-webp — one-pass PDF page → tiny webp (no intermediate PNG)
   ---------------------------------------------------------------------
   Renders PDF pages with pdfjs + @napi-rs/canvas and encodes webp directly
   (canvas.toBuffer('image/webp', quality)). No Ghostscript / ImageMagick /
   poppler — uses the same .tools/pdf-tools deps as render-pdf-preview.mjs.

   Usage:
     node pdf-to-webp.mjs <input.pdf | input-dir> <output-dir> [opts]
   Options:
     --pages 1-3 | 1,4,7 | all   (default: all)
     --quality 76                 (webp quality 1-100, default 76)
     --max-width 1000             (cap render width in px; default 1000)
     --scale 2                    (upper bound on render scale; default 2)
   Output files: <pdf-basename>-p01.webp, -p02.webp, …
   ===================================================================== */
import fs from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const require = createRequire(import.meta.url);
// .tools/ is gitignored (native deps) so it lives in the main checkout, not git worktrees.
const TOOLS = [
  path.join(repoRoot, ".tools/pdf-tools/node_modules"),
  "C:/Users/Liezl/Documents/Github/bitbarnbytes/.tools/pdf-tools/node_modules",
].find((p) => existsSync(p)) || path.join(repoRoot, ".tools/pdf-tools/node_modules");
const { createCanvas } = require(path.join(TOOLS, "@napi-rs/canvas"));
const pdfjs = await import(pathToFileURL(path.join(TOOLS, "pdfjs-dist/legacy/build/pdf.mjs")).href);

/* ---- args ---- */
const [, , inputArg, outArg, ...rest] = process.argv;
if (!inputArg || !outArg) {
  console.error("Usage: node pdf-to-webp.mjs <input.pdf|dir> <out-dir> [--pages all] [--quality 76] [--max-width 1000] [--scale 2]");
  process.exit(1);
}
const opt = (name, def) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 && rest[i + 1] ? rest[i + 1] : def;
};
const QUALITY = Number(opt("quality", 76));
const MAX_WIDTH = Number(opt("max-width", 1000));
const MAX_SCALE = Number(opt("scale", 2));
const PAGES = opt("pages", "all");

function wantedPages(total) {
  if (PAGES === "all") return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set();
  for (const part of PAGES.split(",")) {
    const m = part.match(/^(\d+)-(\d+)$/);
    if (m) for (let n = +m[1]; n <= +m[2]; n++) set.add(n);
    else if (/^\d+$/.test(part)) set.add(+part);
  }
  return [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
}

function listPdfs(input) {
  if (statSync(input).isFile()) return input.toLowerCase().endsWith(".pdf") ? [input] : [];
  const out = [];
  const walk = (dir) => {
    for (const e of require("node:fs").readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.toLowerCase().endsWith(".pdf")) out.push(p);
    }
  };
  walk(input);
  return out;
}

const slug = (s) => s.replace(/\.pdf$/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();

await fs.mkdir(outArg, { recursive: true });
const pdfs = listPdfs(inputArg);
if (!pdfs.length) { console.error("No PDFs found at", inputArg); process.exit(1); }

let made = 0, bytes = 0;
for (const pdfPath of pdfs) {
  const data = new Uint8Array(await fs.readFile(pdfPath));
  const doc = await pdfjs.getDocument({ data, disableWorker: true }).promise;
  const base = slug(path.basename(pdfPath));
  for (const n of wantedPages(doc.numPages)) {
    const page = await doc.getPage(n);
    const base1 = page.getViewport({ scale: 1 });
    const scale = Math.min(MAX_SCALE, MAX_WIDTH / base1.width);
    const viewport = page.getViewport({ scale });
    const canvas = createCanvas(Math.round(viewport.width), Math.round(viewport.height));
    const context = canvas.getContext("2d");
    await page.render({
      canvasContext: context,
      viewport,
      canvasFactory: { create: (w, h) => { const c = createCanvas(w, h); return { canvas: c, context: c.getContext("2d") }; }, reset() {}, destroy() {} },
    }).promise;
    const buf = canvas.toBuffer("image/webp", QUALITY);
    const out = path.join(outArg, `${base}-p${String(n).padStart(2, "0")}.webp`);
    await fs.writeFile(out, buf);
    made++; bytes += buf.length;
    console.log(`  ${path.basename(out)}  ${(buf.length / 1024).toFixed(0)} KB  (${Math.round(viewport.width)}px)`);
  }
}
console.log(`\n${made} webp images, ${(bytes / 1024 / 1024).toFixed(2)} MB total -> ${outArg}`);
