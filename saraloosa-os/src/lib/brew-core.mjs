/* =====================================================================
   THE KITCHEN ALCHEMY LAB — agent core
   ---------------------------------------------------------------------
   The Brewing Bench in wildroots/dig-deeper/index.html, but the verdict
   now comes from a model instead of a 4-row recipe table. Shared by the
   local dev server (scripts/dev-server.mjs) and the Netlify function
   (netlify/functions/brew.mjs). Runs ON the Wildroots canon below — the
   content IS the agent.
   ===================================================================== */

export const MODEL = "gemini-3.5-flash";
const ENDPOINT = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

export const MAX_INPUT = 400; // chars — one kitchen's worth of scraps, not an essay

/* ---- the canon the cauldron runs on (mined from the real library) ---- */
const SYSTEM = `You are THE CAULDRON of the Dirt Alchemists' Underground Laboratory — a warm,
slightly mischievous oracle from the BitSoil SageByte / Wildroots world. A visitor tells you what is
actually in their kitchen or garden right now (scraps, weeds, leftovers, half-used things). You brew it
into a NAMED ELIXIR and reveal who in the living soil made it possible.

WORLD CANON — stay inside it, never break character, never give medical advice:
- The Three-Day Rule: fresh-milled flour is "awake" for ~72 hours, then its enzymes fade. "When the flour is awake, the bread is best."
- The cast (use as the 'cast' reads, voiced in-character):
  • Amylase, Protease, Lipase — enzymes, the invisible micro-helpers that pre-digest grain and seed.
  • Microbe Guilds — Fungi (the garden's internet), Bacteria (the breakdown chefs), Tardigrades (indestructible firewalls).
  • SOILdiers — the underground crew that transmute scraps into "Black Gold" compost.
  • The Hen — turns bugs and sprouts into sunset-orange yolks.
- Named elixirs already in the Grimoire (echo or riff on these; invent new ones freely too):
  Superhero Sprinkle (dried wild greens + seed), Bug Ward (eggshell + compost, calcium armor for plants),
  Loaf of the Third Day (awake flour + sprouted seed), Alchemist's Dust (wild medicine ground fine).
- Wild treasures often mistaken for weeds: Nettle, Purslane, Spekboom, Plantain.
- Nothing is waste: every output is another link's input.

THE ONE RULE — bounded taste, then route to depth: give ONE vivid elixir, ONE caution, ONE next move.
You are a fifteen-second taste, not the whole protocol. The full system lives in the paid Wildroots library.

Pick the single most fitting bundle to route to:
- "The Wildroots Storybook Trilogy" — for kids/family, story-first, wonder.
- "The Wildroots Field Guide Set" — for foraging, identifying plants, getting outdoors.
- "The Alchemist's Shelf" — for serious soil science, milling, microbe guilds, the deep system.
- "The Homestead Originals" — for general homesteading, kitchen craft, soil-to-soul basics.

SAFETY: if the input names anything risky to eat (unidentified wild plant, mold, raw eggs, foraged
mushrooms), make the freshnessNote a clear, kind caution. Never tell anyone to eat something unidentified.
If the input is empty, nonsense, or not food/garden material, still brew something playful and gently
redirect to real ingredients in the verdict.`;

const SCHEMA = {
  type: "object",
  properties: {
    elixirName: { type: "string", description: "An evocative named elixir, e.g. 'The Midnight Nettle Tonic'" },
    elixirEmoji: { type: "string", description: "A single emoji for the elixir" },
    tagline: { type: "string", description: "One poetic line under the name" },
    cast: {
      type: "array",
      description: "2-4 members of the soil cast, each giving one in-character read of an ingredient",
      items: {
        type: "object",
        properties: {
          agent: { type: "string", description: "e.g. 'Amylase', 'The Fungi Guild', 'A Tardigrade'" },
          emoji: { type: "string" },
          read: { type: "string", description: "One sentence, in voice, on what this ingredient contributes" },
        },
        required: ["agent", "emoji", "read"],
      },
    },
    freshnessNote: { type: "string", description: "ONE Three-Day-Rule riff or safety caution" },
    verdict: { type: "string", description: "One-line overall verdict on the brew" },
    hardening: { type: "string", description: "ONE concrete next move ('sprout the lentils first', 'add an eggshell')" },
    routeTo: {
      type: "object",
      properties: {
        bundle: {
          type: "string",
          enum: [
            "The Wildroots Storybook Trilogy",
            "The Wildroots Field Guide Set",
            "The Alchemist's Shelf",
            "The Homestead Originals",
          ],
        },
        why: { type: "string", description: "One short line on why this bundle fits them" },
      },
      required: ["bundle", "why"],
    },
  },
  required: ["elixirName", "elixirEmoji", "tagline", "cast", "freshnessNote", "verdict", "hardening", "routeTo"],
};

/* maps the bundle name the model returns -> the deep link already in dig-deeper */
export const BUNDLE_LINKS = {
  "The Wildroots Storybook Trilogy": "watermark-covered/storybooks/1. The Secret of the Wildroots Sprouts - branded.pdf",
  "The Wildroots Field Guide Set": "watermark-covered/original_batch/field-guides/Wildroots_Sprouts_Field_Journal_Batch Compress - branded.pdf",
  "The Alchemist's Shelf": "watermark-covered/new-branding/The_Dirt_Alchemists_Batch Compress - branded.pdf",
  "The Homestead Originals": "watermark-covered/original_batch/Wildroots_Sprouts_Batch Compress - branded.pdf",
};

/**
 * Brew a verdict from free-text ingredients.
 * @returns {Promise<object>} the validated verdict (schema above)
 * @throws {Error} with .status for HTTP mapping
 */
export async function brew(rawInput, apiKey, model = MODEL) {
  const ingredients = String(rawInput ?? "").trim().slice(0, MAX_INPUT);
  if (!ingredients) {
    const e = new Error("Tell the cauldron what you have first.");
    e.status = 400;
    throw e;
  }
  if (!apiKey) {
    const e = new Error("The cauldron is unlit (no API key configured).");
    e.status = 500;
    throw e;
  }

  const body = {
    contents: [{ parts: [{ text: `What I have right now: ${ingredients}\n\nBrew it.` }] }],
    system_instruction: { parts: [{ text: SYSTEM }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: SCHEMA,
      temperature: 1.0,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingLevel: "low" },
    },
  };

  let res;
  try {
    res = await fetch(ENDPOINT(model, apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    const e = new Error("The cauldron could not reach the underground (network error).");
    e.status = 502;
    throw e;
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const e = new Error(`The cauldron sputtered (upstream ${res.status}).`);
    e.status = 502;
    e.detail = detail.slice(0, 500);
    throw e;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  let verdict;
  try {
    verdict = JSON.parse(text);
  } catch {
    const e = new Error("The cauldron's vision was cloudy. Try again.");
    e.status = 502;
    throw e;
  }
  return verdict;
}
