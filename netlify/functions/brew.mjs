/* =====================================================================
   /api/brew — Netlify Function (production)
   ---------------------------------------------------------------------
   Same agent core as the local dev server. Set GOOGLE_GENERATIVE_AI_API_KEY
   in the Netlify site env. Routed from /api/brew by netlify.toml redirects.
   ===================================================================== */
import { brew } from "../../lib/brew-core.mjs";

const HITS = new Map(); // best-effort per-IP limit (resets on cold start)
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

const json = (status, obj) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

export default async function handler(req) {
  if (req.method !== "POST") return json(405, { error: "POST only." });

  const ip = req.headers.get("x-nf-client-connection-ip") || "anon";
  if (rateLimited(ip)) return json(429, { error: "The cauldron needs to cool. Try again in a few minutes." });

  let ingredients = "";
  try {
    ({ ingredients } = await req.json());
  } catch {
    return json(400, { error: "Tell the cauldron what you have first." });
  }

  try {
    const verdict = await brew(ingredients, process.env.GOOGLE_GENERATIVE_AI_API_KEY);
    return json(200, verdict);
  } catch (err) {
    if (err.detail) console.error("[brew] upstream:", err.detail);
    return json(err.status || 500, { error: err.message || "The cauldron went quiet." });
  }
}

export const config = { path: "/api/brew" };
