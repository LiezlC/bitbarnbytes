/* POST /api/boot — the Boot Sequence diagnostic (on-demand; a Netlify function in prod). */
export const prerender = false;

import type { APIRoute } from "astro";
// @ts-expect-error — plain .mjs core, no types
import { diagnose, resolveKey } from "../../lib/boot-core.mjs";
// @ts-ignore — plain .mjs helper, no types declaration
import { traceGeneration } from "../../lib/langfuse.mjs";

const json = (status: number, obj: unknown) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

export const POST: APIRoute = async ({ request }) => {
  let input = "";
  try {
    ({ input } = await request.json());
  } catch {
    return json(400, { error: "Describe how you're running first." });
  }
  try {
    const key = import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY || resolveKey();
    const lf = await traceGeneration({ agent: "boot", input: { input } });
    const result = await diagnose(input, key);
    await lf.end(result);
    return json(200, result);
  } catch (err: any) {
    if (err?.detail) console.error("[boot] upstream:", err.detail);
    return json(err?.status || 500, { error: err?.message || "SYS_NODE went quiet." });
  }
};
