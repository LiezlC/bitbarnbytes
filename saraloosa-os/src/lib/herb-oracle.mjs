/* =====================================================================
   THE SOIL ORACLE — Wild Pharmacy herb edition
   ---------------------------------------------------------------------
   A purpose-built RAG oracle for Hexi's Wild Pharmacy labyrinth, isolated
   from the main Soil Oracle: it searches the `wild-pharmacy` namespace of
   the shared `saraloosa-soil` Pinecone index (the 13 hero plants) and
   composes a warm, grounded, NEVER-medical answer.

   Grounding strategy (graceful — never throws on retrieval):
   1. Pinecone integrated-inference search of namespace `wild-pharmacy`
      (top 3 plants nearest the question) — if PINECONE_API_KEY is set.
   2. The answer is composed by Gemini/HF (llm.mjs) from ONLY those
      passages; if no model key is available or the call fails, a
      deterministic answer is composed from the retrieved plant fields.

   Populate with `node scripts/build-wildpharmacy-pinecone.mjs` (reads
   wildroots/wild-pharmacy/stations.json).
   ===================================================================== */
import { callStructured } from "./llm.mjs";

const INDEX = "saraloosa-soil";
const NAMESPACE = "wild-pharmacy";
const TOP_K = 3;
export const MAX_QUESTION = 300;

async function retrieve(question) {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) return [];
  try {
    const { Pinecone } = await import("@pinecone-database/pinecone");
    const pc = new Pinecone({ apiKey });
    const ns = pc.index(INDEX).namespace(NAMESPACE);
    const res = await ns.searchRecords({
      query: { topK: TOP_K, inputs: { text: question } },
      fields: ["key", "title", "latin", "part", "caution", "alsoKnown", "growable", "origin", "chunk_text"],
    });
    return (res?.result?.hits ?? []).map((h) => h.fields ?? {});
  } catch (err) {
    console.warn("[herb-oracle] Pinecone retrieval failed:", err?.message ?? err);
    return [];
  }
}

const SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string", description: "2-4 warm sentences grounded only in the retrieved passages" },
    plant: { type: "string", description: "common name of the single best-fit plant" },
    latin: { type: "string", description: "latin name of that plant" },
    grounded: { type: "boolean", description: "true if a retrieved plant actually fits the question" },
  },
  required: ["answer", "plant", "latin", "grounded"],
};

function deterministic(hits) {
  if (!hits.length) return null;
  const p = hits[0];
  const also = hits.slice(1).map((h) => h.title).filter(Boolean);
  const answer =
    `The labyrinth points you to ${p.title} (${p.latin}). Part used: ${p.part}.` +
    (p.caution ? ` Mind the minotaur: ${p.caution}` : "") +
    (also.length ? ` You might also meet ${also.join(" and ")}.` : "") +
    " This is folklore, not medical advice — identify carefully and ask a professional before use.";
  return { answer, plant: p.title, latin: p.latin, grounded: true };
}

export async function askHerb(rawQuestion, geminiKey) {
  const question = String(rawQuestion ?? "").trim().slice(0, MAX_QUESTION);
  if (!question) {
    const e = new Error("Ask the Oracle something first."); e.status = 400; throw e;
  }
  const hits = await retrieve(question);
  if (!hits.length) {
    const e = new Error("The Oracle could not reach the soil — the plant corpus is unavailable.");
    e.status = 503; throw e;
  }
  const sources = hits.map((h) => ({ title: h.title, latin: h.latin, key: h.key }));
  const grounding = hits
    .map((h, i) => `[${i + 1}] ${h.title} (${h.latin}) — part used: ${h.part}. ${h.chunk_text} CAUTION: ${h.caution}`)
    .join("\n\n");

  const system = `You are THE SOIL ORACLE inside Hexi's Wild Pharmacy — a compost-punk labyrinth of real healing plants. You answer the visitor USING ONLY the retrieved plant passages below.

RULES:
- Name the single best-fit plant by common and latin name.
- 2-4 warm, grounded sentences. Never invent facts not in the passages.
- This is folklore and education, NEVER medical advice. For anything ingested or foraged, add a gentle reminder to identify carefully and consult a professional.
- Honour conservation: if the plant is endangered, say to grow it and never wild-harvest.
- If the passages do not fit the question, set grounded=false, say so kindly, and still name the closest plant.

RETRIEVED PLANT PASSAGES:
${grounding}`;

  try {
    const out = await callStructured({
      system, user: `Visitor's question: ${question}`,
      schema: SCHEMA, schemaName: "herb", temperature: 0.4, geminiKey,
    });
    return { ...out, sources };
  } catch (err) {
    const d = deterministic(hits);
    if (d) return { ...d, sources };
    throw err;
  }
}
