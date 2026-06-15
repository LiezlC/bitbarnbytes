/* =====================================================================
   LOCAL PREVIEW SERVER for the Kitchen Alchemy Lab
   ---------------------------------------------------------------------
   Serves wildroots/dig-deeper/ as static files AND handles POST /api/brew
   so the model-powered Brewing Bench works end-to-end locally — the same
   /api/brew path the Netlify function will answer in production.

   Run:  node scripts/dev-server.mjs           (key from env or gem-voice .env.local)
         PORT=8888 node scripts/dev-server.mjs
   Then open http://localhost:8787/
   ===================================================================== */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, extname } from "node:path";
import { brew } from "../lib/brew-core.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const STATIC_DIR = join(ROOT, "wildroots", "dig-deeper");
const ASSET_DIR = join(ROOT, "wildroots"); // ../-relative assets the page references
const PORT = Number(process.env.PORT) || 8787;

/* ---- resolve the Gemini key: env first, then the gem-voice .env.local ---- */
function resolveKey() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const candidates = [
    "C:/Users/Liezl/Documents/Github/gemini-voice-agents/gem-voice/.env.local",
    join(ROOT, ".env.local"),
  ];
  for (const f of candidates) {
    if (!existsSync(f)) continue;
    const line = readFileSync(f, "utf8")
      .split(/\r?\n/)
      .find((l) => l.startsWith("GOOGLE_GENERATIVE_AI_API_KEY="));
    if (line) return line.slice("GOOGLE_GENERATIVE_AI_API_KEY=".length).trim();
  }
  return "";
}
const API_KEY = resolveKey();

/* ---- tiny in-memory per-IP rate limit (8 brews / 5 min) ---- */
const HITS = new Map();
const LIMIT = 8;
const WINDOW = 5 * 60 * 1000;
function rateLimited(ip) {
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < WINDOW);
  if (arr.length >= LIMIT) return true;
  arr.push(now);
  HITS.set(ip, arr);
  return false;
}

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".pdf": "application/pdf", ".md": "text/markdown; charset=utf-8",
  ".ico": "image/x-icon", ".json": "application/json",
};

function send(res, status, body, type = "application/json") {
  res.writeHead(status, { "Content-Type": type });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  /* ---------- the agent endpoint ---------- */
  if (url.pathname === "/api/brew" && req.method === "POST") {
    const ip = req.socket.remoteAddress || "local";
    if (rateLimited(ip)) return send(res, 429, { error: "The cauldron needs to cool. Try again in a few minutes." });
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 5000) req.destroy(); });
    req.on("end", async () => {
      try {
        const { ingredients } = JSON.parse(raw || "{}");
        const verdict = await brew(ingredients, API_KEY);
        send(res, 200, verdict);
      } catch (err) {
        if (err.detail) console.error("[brew] upstream:", err.detail);
        send(res, err.status || 500, { error: err.message || "The cauldron went quiet." });
      }
    });
    return;
  }

  /* ---------- static files ---------- */
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/index.html";
  // page lives in dig-deeper/ but references ../ assets; try dig-deeper first, then wildroots/
  const safe = normalize(rel).replace(/^(\.\.[/\\])+/, "");
  for (const base of [STATIC_DIR, ASSET_DIR]) {
    const file = join(base, safe);
    if (!file.startsWith(base)) continue;
    try {
      const buf = await readFile(file);
      return send(res, 200, buf, MIME[extname(file).toLowerCase()] || "application/octet-stream");
    } catch { /* try next base */ }
  }
  send(res, 404, "Not found in the library.", "text/plain");
});

server.listen(PORT, () => {
  console.log(`\n  🌱 Kitchen Alchemy Lab preview → http://localhost:${PORT}/`);
  console.log(`  ⚗️  /api/brew model: gemini-3.5-flash`);
  console.log(`  🔑 Gemini key: ${API_KEY ? "loaded" : "MISSING — set GOOGLE_GENERATIVE_AI_API_KEY"}\n`);
});
