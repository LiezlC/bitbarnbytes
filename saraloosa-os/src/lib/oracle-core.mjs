/* =====================================================================
   THE SOIL ORACLE — RAG "ask" agent core (Astro build)
   ---------------------------------------------------------------------
   Grounding strategy (in priority order):
   1. Pinecone integrated-inference search (if PINECONE_API_KEY is set)
      — queries saraloosa-soil / corpus for the top 8 nearest chunks
        and formats only those as grounding context.
   2. Full static corpus.json fallback (if key is absent or the call
      throws) — original behaviour, nothing changes for the visitor.

   Regenerate corpus.json with `node scripts/extract-corpus.mjs` from
   the repo root.  Populate Pinecone with `npm run index:build`.
   ===================================================================== */
import CORPUS from "./corpus.json";
import { callStructured } from "./llm.mjs";

export const MAX_QUESTION = 500;

const PINECONE_INDEX = "saraloosa-soil";
const PINECONE_NAMESPACE = "corpus";
const PINECONE_TOP_K = 8;

/* ── Static fallback grounding (original behaviour) ──────────────── */
function staticGroundingText() {
  const docs = CORPUS.docs
    .map(
      (d) =>
        `### ${d.title}  [track: ${d.track}; depth-bundle: ${d.bundle}; source: ${d.src}]\n${d.hook}\n- ${d.bullets.join("\n- ")}\n"${d.quote}"`
    )
    .join("\n\n");
  const facts = CORPUS.facts.map((f) => `- ${f.fact} (table: ${f.table})`).join("\n");
  return `WILDROOTS FREE-TIER CORPUS — answer ONLY from this.\n\n=== DOCUMENTS ===\n${docs}\n\n=== QUICK FACTS ===\n${facts}`;
}

/* ── Pinecone retrieval (graceful — never throws to the caller) ───── */
async function pineconeGrounding(question) {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) return null;

  try {
    // Dynamic import so the SDK is tree-shaken out when key is absent
    // and so a missing package doesn't break the static build.
    const { Pinecone } = await import("@pinecone-database/pinecone");
    const pc = new Pinecone({ apiKey });
    const ns = pc.index(PINECONE_INDEX).namespace(PINECONE_NAMESPACE);

    const response = await ns.searchRecords({
      query: {
        topK: PINECONE_TOP_K,
        inputs: { text: question },
      },
      fields: ["type", "tier", "title", "track", "bundle", "src", "hook", "quote", "chunk_text"],
    });

    const hits = response?.result?.hits ?? [];
    if (!hits.length) return null;

    // Re-compose a grounding string from the retrieved chunks only
    const lines = hits.map((hit) => {
      const f = hit.fields ?? {};
      if (f.type === "fact") {
        return `- ${f.chunk_text} (table: ${f.track || "—"})`;
      }
      return (
        `### ${f.title}  [track: ${f.track}; depth-bundle: ${f.bundle}; source: ${f.src}]\n` +
        `${f.hook}\n"${f.quote}"`
      );
    });

    return (
      `WILDROOTS FREE-TIER CORPUS (top ${hits.length} passages retrieved for this question) ` +
      `— answer ONLY from this.\n\n` +
      lines.join("\n\n")
    );
  } catch (err) {
    // Non-fatal: log and fall back to static corpus
    console.warn("[oracle-core] Pinecone retrieval failed; falling back to static corpus:", err?.message ?? err);
    return null;
  }
}

/* ── System prompt builder ────────────────────────────────────────── */
function buildSystem(groundingStr) {
  return `You are THE SOIL ORACLE of the Wildroots / BitSoil SageByte living library — a warm,
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

${groundingStr}`;
}

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

export async function ask(rawQuestion, apiKey) {
  const question = String(rawQuestion ?? "").trim().slice(0, MAX_QUESTION);
  if (!question) {
    const e = new Error("Ask the Oracle something first."); e.status = 400; throw e;
  }

  // Try Pinecone; fall back to full static corpus if unavailable
  const groundingStr = (await pineconeGrounding(question)) ?? staticGroundingText();

  return callStructured({
    system: buildSystem(groundingStr),
    user: `Visitor's question: ${question}`,
    schema: SCHEMA,
    schemaName: "oracle",
    temperature: 0.4,
    geminiKey: apiKey,
  });
}
