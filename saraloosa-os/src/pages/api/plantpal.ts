/* POST /api/plantpal — the Plant Pal Identifier (on-demand; a Netlify function in prod). */
export const prerender = false;

import type { APIRoute } from "astro";
import { identifyPlant } from "../../lib/plantpal-core.mjs";
import { traceGeneration } from "../../lib/langfuse.mjs";

const json = (status: number, obj: unknown) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

export const POST: APIRoute = async ({ request }) => {
  let plant = "";
  let image = "";
  try {
    ({ plant = "", image = "" } = await request.json());
  } catch {
    return json(400, { error: "Describe the plant or add a photo first." });
  }
  const images: { mimeType: string; dataBase64: string }[] = [];
  if (typeof image === "string" && image.startsWith("data:")) {
    const m = image.match(/^data:([^;]+);base64,(.+)$/s);
    if (m) images.push({ mimeType: m[1], dataBase64: m[2] });
  }
  try {
    const key = import.meta.env.GOOGLE_GENERATIVE_AI_API_KEY; // llm.mjs also falls back to env/HF
    const lf = await traceGeneration({
      agent: "plantpal",
      input: { plant, hasImage: images.length > 0 },
    });
    const result = await identifyPlant(plant, key, images);
    await lf.end(result);
    return json(200, result);
  } catch (err: any) {
    if (err?.detail) console.error("[plantpal] providers:", err.detail);
    return json(err?.status || 500, { error: err?.message || "The garden went quiet." });
  }
};
