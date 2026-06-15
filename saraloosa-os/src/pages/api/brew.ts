/* POST /api/brew — the Kitchen Alchemy Lab (on-demand; a Netlify function in prod). */
export const prerender = false;

import type { APIRoute } from "astro";
// @ts-expect-error — plain .mjs core, no types
import { brew } from "../../lib/brew-core.mjs";
// @ts-expect-error — plain .mjs core, no types
import { resolveKey } from "../../lib/boot-core.mjs";

const json = (status: number, obj: unknown) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

export const POST: APIRoute = async ({ request }) => {
  let ingredients = "";
  try {
    ({ ingredients } = await request.json());
  } catch {
    return json(400, { error: "Tell the cauldron what you have first." });
  }
  try {
    const key = import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY || resolveKey();
    return json(200, await brew(ingredients, key));
  } catch (err: any) {
    if (err?.detail) console.error("[brew] upstream:", err.detail);
    return json(err?.status || 500, { error: err?.message || "The cauldron went quiet." });
  }
};
