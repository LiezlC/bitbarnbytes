/* POST /api/herb — the Wild Pharmacy Soil Oracle (RAG over the 13 plants). */
export const prerender = false;

import type { APIRoute } from "astro";
// @ts-expect-error — plain .mjs core, no types
import { askHerb } from "../../lib/herb-oracle.mjs";
// @ts-expect-error — plain .mjs core, no types
import { resolveGeminiKey } from "../../lib/llm.mjs";
// @ts-ignore — plain .mjs helper, no types declaration
import { traceGeneration } from "../../lib/langfuse.mjs";

const json = (status: number, obj: unknown) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const POST: APIRoute = async ({ request }) => {
  let question = "";
  try {
    ({ question } = await request.json());
  } catch {
    return json(400, { error: "Ask the Oracle something first." });
  }
  try {
    const key = import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY || resolveGeminiKey();
    const lf = await traceGeneration({ agent: "herb-oracle", input: { question } });
    const result = await askHerb(question, key);
    await lf.end(result);
    return json(200, result);
  } catch (err: any) {
    if (err?.detail) console.error("[herb] upstream:", err.detail);
    return json(err?.status || 500, { error: err?.message || "The Oracle went quiet." });
  }
};
