# Tier Fixes — Scaffolding Notes

Future integrations that need API keys / credentials before implementation.
Each section names: what it is, which file to touch, which env var is required.

---

## A. Pinecone — Upgrade Soil Oracle to Vector Store  ✅ DONE (2026-06-19)

**What:** Pinecone integrated-inference RAG wired into the Soil Oracle with graceful
fallback to the static `corpus.json` if the key is absent or the call fails.
No manual embeddings — Pinecone embeds via `llama-text-embed-v2` on the `chunk_text`
field (integrated index = zero embedding code on our side).

**Files changed / created:**
- `scripts/build-pinecone-index.mjs` — one-off ingest: creates index `saraloosa-soil`
  (aws/us-east-1, llama-text-embed-v2) if absent, then upserts all corpus.json docs +
  facts as flat records into namespace `corpus`.
- `src/lib/oracle-core.mjs` — `ask()` now calls `pineconeGrounding(question)` first;
  on success it builds the prompt from the top-8 retrieved chunks only (more accurate,
  smaller context). Falls back silently to `staticGroundingText()` (original behaviour)
  if key absent or Pinecone throws.
- `package.json` — added `@pinecone-database/pinecone: ^5.1.1` dep + `index:build` script.
- `.env.example` — added `PINECONE_API_KEY` with description.

**Env var required (set in Netlify site environment, Functions scope):**
```
PINECONE_API_KEY=your-pinecone-api-key
```
Index name is hard-coded as `saraloosa-soil`, namespace `corpus`. No other vars needed.

**How to run the ingest (one-off, re-run whenever corpus.json changes):**
```bash
cd saraloosa-os
npm install                          # picks up @pinecone-database/pinecone
PINECONE_API_KEY=<key> npm run index:build
```
The script is idempotent — safe to re-run; it skips index creation if it already exists
and upsert overwrites by `_id`.

**Record schema (flat — no nested metadata):**
```
_id          "doc-<key>" | "fact-<n>"
chunk_text   embedded text (docs: title|hook|bullets|quote; facts: the fact sentence)
type         "doc" | "fact"
tier         "free"
title        doc title or ""
track        doc track or fact table name
bundle       depth-bundle name or ""
src          relative source path or ""
hook         lead sentence (docs)
quote        pull-quote (docs)
```

**Fallback behaviour:** if `PINECONE_API_KEY` is not set, or if `searchRecords` throws
for any reason, `oracle-core.mjs` falls back silently to the full static `corpus.json`
grounding — the Oracle remains functional at all times.

---

## B. Langfuse — Instrument the 4 Gemini Agents

**What:** Add observability (traces, latency, token counts, prompt versions) to the four
Gemini-backed agents. Langfuse is an open-source LLM observability platform with a
Node/TS SDK.

**Which files to change — one wrapping call per agent:**

| Agent | File | Core call to instrument |
|---|---|---|
| Boot Sequence | `src/lib/boot-core.mjs` | `callStructured(...)` call inside `diagnose()` |
| Kitchen Alchemy | `src/lib/brew-core.mjs` | `callStructured(...)` call inside `brew()` |
| Soil Oracle | `src/lib/oracle-core.mjs` | `callStructured(...)` call inside `ask()` |
| Plant Pal | `src/lib/plantpal-core.mjs` | `callStructured(...)` call inside `identifyPlant()` |

The cleanest insertion point is `src/lib/llm.mjs` — wrap `callStructured()` to create a
Langfuse `generation` span around the Gemini fetch, so all four agents are instrumented
in one place.

**Env vars required:**
```
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com   # or self-hosted URL
```

**Setup steps (not implemented here):**
1. `npm install langfuse` inside `saraloosa-os/`.
2. Initialise `Langfuse` client in `src/lib/llm.mjs`.
3. Wrap the `generativeAI.getGenerativeModel(...).generateContent(...)` call with
   `langfuse.generation({ name, input, model, ... })` + `.update({ output, usage })`.
4. Flush on function exit: `await langfuse.shutdownAsync()` inside each API route.

---

## C. Real Plant Dataset for Plant Pal Safety

**What:** `src/lib/plantpal-core.mjs` currently uses a hand-coded `KNOWN_PALS` object
(8 plants: Nettle, Purslane, Spekboom, Plantain, Apple, Spinach, Oats, Wheat). A real
dataset would let Plant Pal give grounded safety / edibility info for a much wider range
of plants while retaining the non-negotiable safety caution about lookalikes.

**Which file to change:**
- `src/lib/plantpal-core.mjs` — replace or augment `KNOWN_PALS` with a lookup against a
  real dataset API or a local JSON built from a verified source.

**Options (pick one):**

| Option | What | Env var(s) |
|---|---|---|
| GBIF API | Free species occurrence + taxonomy data (Global Biodiversity Information Facility). No key required for public endpoints, but rate-limited. | — |
| iNaturalist API | Community-sourced plant observations + edibility notes where tagged. Free, generous rate limits. | `INATURALIST_API_KEY` (optional, for higher limits) |
| Trefle API | Curated plant DB with edibility, toxicity, habitat fields. | `TREFLE_TOKEN=your-trefle-token` |
| Local JSON | Build a dataset offline from GBIF/Trefle/Plants For A Future, commit to `src/lib/plant-dataset.json`. Zero runtime cost. | — (build-time only) |

**Recommendation:** Start with a local JSON (no runtime API dependency, no env var,
safe for a static build) sourced from Plants For A Future (PFAF) or GBIF, covering
Southern African edible and toxic species that match the BitSoil world canon
(Spekboom, Cape fynbos, etc.).

**Safety non-negotiable:** Whatever dataset is used, the system prompt in `plantpal-core.mjs`
(lines: "NEVER confirm edibility as safe…", "always caution about lookalikes") must stay
in place. The dataset grounds the *identification* — it does not override the safety guard.
