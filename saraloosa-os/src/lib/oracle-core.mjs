/* =====================================================================
   THE SOIL ORACLE — RAG "ask" agent core (Astro build)
   ---------------------------------------------------------------------
   Same agent as wildroots' lib/oracle-core.mjs, but the corpus is a
   static `import` (Vite bundles it into the function) instead of an fs
   read — so it ships cleanly in the Netlify SSR function with no
   included_files config. Regenerate corpus.json with
   `node scripts/extract-corpus.mjs` from the repo root.
   ===================================================================== */
import CORPUS from "./corpus.json";

export const MODEL = "gemini-3.5-flash";
const ENDPOINT = (model, key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
export const MAX_QUESTION = 500;

function groundingText() {
  const docs = CORPUS.docs
    .map(
      (d) =>
        `### ${d.title}  [track: ${d.track}; depth-bundle: ${d.bundle}; source: ${d.src}]\n${d.hook}\n- ${d.bullets.join("\n- ")}\n"${d.quote}"`
    )
    .join("\n\n");
  const facts = CORPUS.facts.map((f) => `- ${f.fact} (table: ${f.table})`).join("\n");
  return `WILDROOTS FREE-TIER CORPUS — answer ONLY from this.\n\n=== DOCUMENTS ===\n${docs}\n\n=== QUICK FACTS ===\n${facts}`;
}

const SYSTEM = () => `You are THE SOIL ORACLE of the Wildroots / BitSoil SageByte living library — a warm,
grounded guide. You answer the visitor's question USING ONLY the corpus provided below. The corpus is
the FREE tier: document summaries and quick facts. The full illustrated volumes are PAID bundles.

RULES:
- Answer ONLY from the corpus. Never invent facts, numbers, or claims not present in it.
- If the corpus does not cover the question, set inCorpus=false, say so honestly and briefly, and still
  point them to the most relevant bundle — do not fabricate an answer.
- Cite the documents you actually drew from (their exact titles) in 'citations'.
- Keep the answer to a real but BOUNDED taste: 2-4 sentences. You are a free preview, not the whole book.
- Route to exactly ONE paid bundle for depth, chosen from the documents you used (their depth-bundle).
- Stay in-world and warm, but be accurate. NEVER give medical advice; for anything ingested/foraged,
  add a gentle caution to identify properly and consult a professional.

${groundingText()}`;

const SCHEMA = {
  type: "object",
  properties: {
    answer: { type: "string", description: "2-4 sentence grounded answer, warm but accurate" },
    inCorpus: { type: "boolean", description: "true if the corpus actually covers the question" },
    citations: {
      type: "array",
      description: "exact titles + sources of the documents used",
      items: {
        type: "object",
        properties: { title: { type: "string" }, src: { type: "string" } },
        required: ["title", "src"],
      },
    },
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
        why: { type: "string", description: "one short line on why this bundle goes deeper for them" },
      },
      required: ["bundle", "why"],
    },
  },
  required: ["answer", "inCorpus", "citations", "routeTo"],
};

export async function ask(rawQuestion, apiKey, model = MODEL) {
  const question = String(rawQuestion ?? "").trim().slice(0, MAX_QUESTION);
  if (!question) {
    const e = new Error("Ask the Oracle something first."); e.status = 400; throw e;
  }
  if (!apiKey) {
    const e = new Error("The Oracle is sleeping (no API key configured)."); e.status = 500; throw e;
  }
  const body = {
    contents: [{ parts: [{ text: `Visitor's question: ${question}` }] }],
    system_instruction: { parts: [{ text: SYSTEM() }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: SCHEMA,
      temperature: 0.4,
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingLevel: "low" },
    },
  };
  let res;
  try {
    res = await fetch(ENDPOINT(model, apiKey), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
  } catch {
    const e = new Error("The Oracle could not reach the underground (network error)."); e.status = 502; throw e;
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const e = new Error(`The Oracle faltered (upstream ${res.status}).`); e.status = 502; e.detail = detail.slice(0, 500); throw e;
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  try {
    return JSON.parse(text);
  } catch {
    const e = new Error("The Oracle's vision was cloudy. Try asking again."); e.status = 502; throw e;
  }
}
