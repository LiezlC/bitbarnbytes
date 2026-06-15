/* =====================================================================
   img-to-webp — resize any jpg/png/webp down to a tiny webp
   ---------------------------------------------------------------------
   Companion to pdf-to-webp.mjs; uses the same .tools @napi-rs/canvas.
   Usage: node img-to-webp.mjs <file|dir> <out-dir> [--max-width 1000] [--quality 76]
   ===================================================================== */
import fs from "node:fs/promises";
import { existsSync, statSync, readdirSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const require = createRequire(import.meta.url);
const TOOLS = [
  path.join(repoRoot, ".tools/pdf-tools/node_modules"),
  "C:/Users/Liezl/Documents/Github/bitbarnbytes/.tools/pdf-tools/node_modules",
].find((p) => existsSync(p)) || path.join(repoRoot, ".tools/pdf-tools/node_modules");
const { createCanvas, loadImage } = require(path.join(TOOLS, "@napi-rs/canvas"));

const [, , input, outDir, ...rest] = process.argv;
if (!input || !outDir) { console.error("Usage: node img-to-webp.mjs <file|dir> <out-dir> [--max-width 1000] [--quality 76]"); process.exit(1); }
const opt = (n, d) => { const i = rest.indexOf(`--${n}`); return i >= 0 && rest[i + 1] ? rest[i + 1] : d; };
const MAX_WIDTH = Number(opt("max-width", 1000));
const QUALITY = Number(opt("quality", 76));
const slug = (s) => s.replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase();

const files = statSync(input).isFile()
  ? [input]
  : readdirSync(input).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).map((f) => path.join(input, f));

await fs.mkdir(outDir, { recursive: true });
let n = 0, bytes = 0;
for (const f of files) {
  const img = await loadImage(await fs.readFile(f));
  const scale = Math.min(1, MAX_WIDTH / img.width);
  const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
  const canvas = createCanvas(w, h);
  canvas.getContext("2d").drawImage(img, 0, 0, w, h);
  const buf = canvas.toBuffer("image/webp", QUALITY);
  const out = path.join(outDir, `${slug(path.basename(f))}.webp`);
  await fs.writeFile(out, buf);
  n++; bytes += buf.length;
  console.log(`  ${path.basename(out)}  ${(buf.length / 1024).toFixed(0)} KB  (${w}px)`);
}
console.log(`\n${n} images, ${(bytes / 1024 / 1024).toFixed(2)} MB -> ${outDir}`);
