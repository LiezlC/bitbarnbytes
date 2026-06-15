/* =====================================================================
   THE PLANT PAL IDENTIFIER — content-as-agent
   ---------------------------------------------------------------------
   A visitor describes a plant they found (or names it); SageByte matches it
   to a Wildroots "Plant Pal" persona, gives ONE nutrition/use fact, and a
   firm foraging-safety caution, then routes to the Field Guide Set. Runs the
   garden cast (the Plant Pals + wild treasures) from the corpus.
   SAFETY-CRITICAL: never confirm a plant is safe to eat.
   ===================================================================== */
import { callStructured } from "./llm.mjs";

export const MAX_INPUT = 400;

/* the known cast — wild treasures + everyday heroes from the library */
const PALS = [
  { name: "Nettle", persona: "the prickly healer — stings if grabbed carelessly, but one of the garden's strongest medicines once cooked or dried", fact: "Nettle is iron- and mineral-rich; cooking or drying neutralizes the sting." },
  { name: "Purslane", persona: "the humble succulent sprawler most people pull as a weed", fact: "Purslane carries omega-3 fatty acids — rare in a leafy plant." },
  { name: "Spekboom", persona: "the hardy elephant's-foot bush that drinks sunlight", fact: "Spekboom's succulent leaves give vitamins and hydration — and it sequesters carbon." },
  { name: "Plantain", persona: "the flat-leafed path-walker hiding in plain sight on lawns and verges", fact: "Broadleaf plantain leaves have long been used as a soothing poultice plant." },
  { name: "Apple", persona: "the everyday hero of the fruit bowl", fact: "Apples bring fibre and steady energy — a familiar 'Plant Pal' to start with." },
  { name: "Spinach", persona: "the iron friend of the leafy greens", fact: "Spinach is rich in iron and folate." },
  { name: "Oats", persona: "the soft, soothing grain", fact: "Oats bring gentle fibre and calm for the nervous system." },
  { name: "Wheat", persona: "the grain that comes alive when freshly milled", fact: "Wheat carries B-vitamins, iron and magnesium — most alive within ~72h of milling." },
];

const SYSTEM = `You are BitSoil SageByte running the PLANT PAL IDENTIFIER for the Wildroots world. A visitor
describes a plant they found, names one, OR uploads a PHOTO. You warmly match it to the closest "Plant Pal"
— giving plants faces and personalities so food/foraging becomes a friendly expedition for kids and families.

WHEN GIVEN A PHOTO: identify from what's actually visible, but stay honest — a photo hides scale, smell,
stem/root detail, habitat and the very features that separate an edible from its toxic lookalike. Treat photo
IDs as tentative: cap confidence at "medium" at best, set identified=false if the image is blurry, partial,
or could be several plants, and make the safety caution firmer. If the photo clearly isn't a plant, say so
kindly in the persona and ask for a clearer plant photo.

THE KNOWN PLANT PALS (match to one when the description fits; otherwise return a gentle "Unknown Sprout"):
${PALS.map((p) => `- ${p.name}: ${p.persona}. Fact: ${p.fact}`).join("\n")}

SAFETY IS NON-NEGOTIABLE — this is educational play, NOT a foraging or medical go-ahead:
- NEVER tell anyone a plant is safe to eat, and NEVER confirm an identification as certain enough to eat.
- ALWAYS fill 'safety' with a clear caution: wild plants need positive identification by a knowledgeable
  adult/local expert; many edibles have toxic lookalikes; never eat anything unless an expert has confirmed it.
- If the description is vague, generic, or could match something dangerous, set identified=false,
  confidence "low", pick the nearest Pal as a *maybe*, and make the safety caution stronger.
- Do not invent nutrition claims beyond the spirit of the facts above. No medical advice.

BOUNDED TASTE -> DEPTH: you name one Pal and one fact. The full forager's key — how to positively identify,
harvest and use plants safely — is the paid Field Guide Set. Always route there.`;

const SCHEMA = {
  type: "object",
  properties: {
    identified: { type: "boolean", description: "true only if the description clearly matches a known Pal" },
    pal: {
      type: "object",
      properties: {
        name: { type: "string", description: "a known Pal name, or 'Unknown Sprout'" },
        glyph: { type: "string", description: "a single emoji for this Pal" },
        persona: { type: "string", description: "one warm line giving the plant a personality" },
      },
      required: ["name", "glyph", "persona"],
    },
    oneFact: { type: "string", description: "ONE nutrition/use fact, in spirit of the canon" },
    safety: { type: "string", description: "REQUIRED firm foraging caution — never confirm edibility" },
    confidence: { type: "string", enum: ["high", "medium", "low"] },
    routeWhy: { type: "string", description: "one line on why the Field Guide Set goes deeper" },
  },
  required: ["identified", "pal", "oneFact", "safety", "confidence", "routeWhy"],
};

export async function identifyPlant(rawInput, apiKey, images) {
  const text = String(rawInput ?? "").trim().slice(0, MAX_INPUT);
  const hasImages = Array.isArray(images) && images.length > 0;
  if (!text && !hasImages) {
    const e = new Error("Describe the plant or add a photo first."); e.status = 400; throw e;
  }
  const user = hasImages
    ? `Identify the plant in this photo.${text ? " The visitor adds: " + text : ""}`
    : `The plant I found: ${text}`;
  return callStructured({
    system: SYSTEM,
    user,
    schema: SCHEMA,
    schemaName: "plant_pal",
    temperature: 0.6,
    geminiKey: apiKey,
    images,
  });
}
