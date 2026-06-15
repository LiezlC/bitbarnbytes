/* =====================================================================
   /api/ask — Soil Oracle, Netlify Function (production)
   ---------------------------------------------------------------------
   Answers only from lib/corpus.json. Set GOOGLE_GENERATIVE_AI_API_KEY in
   the Netlify site env. Routed from /api/ask by this function's config.path.
   ===================================================================== */
import { ask } from "../../lib/oracle-core.mjs";

const HITS = new Map(); // best-effort per-IP limit (resets on cold start)
const LIMIT = 12;
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
  if (rateLimited(ip)) return json(429, { error: "The Oracle needs to rest. Try again in a few minutes." });

  let question = "";
  try {
    ({ question } = await req.json());
  } catch {
    return json(400, { error: "Ask the Oracle something first." });
  }
  try {
    return json(200, await ask(question, process.env.GOOGLE_GENERATIVE_AI_API_KEY));
  } catch (err) {
    if (err.detail) console.error("[ask] upstream:", err.detail);
    return json(err.status || 500, { error: err.message || "The Oracle went quiet." });
  }
}

export const config = { path: "/api/ask" };
