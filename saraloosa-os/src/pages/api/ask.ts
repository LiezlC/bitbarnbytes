/* POST /api/ask — the Soil Oracle (on-demand; a Netlify function in prod). */
export const prerender = false;

import type { APIRoute } from "astro";
// @ts-expect-error — plain .mjs core, no types
import { ask } from "../../lib/oracle-core.mjs";
// @ts-expect-error — plain .mjs core, no types
import { resolveKey } from "../../lib/boot-core.mjs";
// @ts-ignore — plain .mjs helper, no types declaration
import { traceGeneration } from "../../lib/langfuse.mjs";

const json = (status: number, obj: unknown) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

export const POST: APIRoute = async ({ request }) => {
  let question = "";
  try {
    ({ question } = await request.json());
  } catch {
    return json(400, { error: "Ask the Oracle something first." });
  }
  try {
    const key = import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY || resolveKey();
    const lf = await traceGeneration({ agent: "oracle", input: { question } });
    const result = await ask(question, key);
    await lf.end(result);
    return json(200, result);
  } catch (err: any) {
    if (err?.detail) console.error("[ask] upstream:", err.detail);
    return json(err?.status || 500, { error: err?.message || "The Oracle went quiet." });
  }
};
