#!/usr/bin/env node
/* =====================================================================
   build-pinecone-index.mjs — Soil Oracle corpus ingest for Pinecone
   ---------------------------------------------------------------------
   Usage:  PINECONE_API_KEY=<key> node scripts/build-pinecone-index.mjs
   Or via npm:  npm run index:build

   What it does:
   1. Creates the integrated-inference index `saraloosa-soil` (model
      llama-text-embed-v2, aws/us-east-1) if it does not yet exist.
   2. Reads src/lib/corpus.json (the Soil Oracle's living library).
   3. Upserts every doc + every fact as a flat record into namespace
      `corpus` using `upsertRecords` (no manual embeddings needed —
      Pinecone embeds via the index's fieldMap on the `chunk_text` field).

   Schema (flat — no nested metadata):
     _id          string   unique key  e.g. "doc-adventureMap"
     chunk_text   string   the text Pinecone will embed
     type         string   "doc" | "fact"
     tier         string   "free" | (future "paid")
     title        string   doc title or empty string for facts
     track        string   doc track or fact table name
     bundle       string   depth-bundle name or ""
     src          string   relative source path or ""
     hook         string   lead sentence (docs only)
     quote        string   pull-quote (docs only)
   ===================================================================== */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Pinecone } from "@pinecone-database/pinecone";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const INDEX_NAME = "saraloosa-soil";
const NAMESPACE  = "corpus";
const EMBED_MODEL = "llama-text-embed-v2";
const CLOUD  = "aws";
const REGION = "us-east-1";
const BATCH_SIZE = 96; // upsertRecords batch ceiling (keep under 100)

/* ── 1. Validate env ─────────────────────────────────────────────── */
const apiKey = process.env.PINECONE_API_KEY;
if (!apiKey) {
  console.error("[build-pinecone-index] ERROR: PINECONE_API_KEY is not set.");
  console.error("  Set it in your environment before running:");
  console.error("    PINECONE_API_KEY=<your-key> npm run index:build");
  process.exit(1);
}

/* ── 2. Load corpus ──────────────────────────────────────────────── */
const corpusPath = resolve(ROOT, "src/lib/corpus.json");
if (!existsSync(corpusPath)) {
  console.error(`[build-pinecone-index] ERROR: corpus.json not found at ${corpusPath}`);
  process.exit(1);
}
const corpus = JSON.parse(readFileSync(corpusPath, "utf8"));

/* ── 3. Build flat records ───────────────────────────────────────── */
function buildRecords(corpus) {
  const records = [];

  for (const doc of corpus.docs ?? []) {
    // Compose a rich chunk_text so the embedding captures context
    const chunkText = [
      doc.title,
      doc.hook,
      (doc.bullets ?? []).join(" "),
      doc.quote ?? "",
    ]
      .filter(Boolean)
      .join(" | ");

    records.push({
      _id: `doc-${doc.key}`,
      chunk_text: chunkText,
      type: "doc",
      tier: doc.tier ?? "free",
      title: doc.title ?? "",
      track: doc.track ?? "",
      bundle: doc.bundle ?? "",
      src: doc.src ?? "",
      hook: doc.hook ?? "",
      quote: doc.quote ?? "",
    });
  }

  for (let i = 0; i < (corpus.facts ?? []).length; i++) {
    const fact = corpus.facts[i];
    records.push({
      _id: `fact-${i}`,
      chunk_text: fact.fact,
      type: "fact",
      tier: "free",
      title: "",
      track: fact.table ?? "",
      bundle: "",
      src: "",
      hook: "",
      quote: "",
    });
  }

  return records;
}

/* ── 4. Batch helper ─────────────────────────────────────────────── */
function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/* ── 5. Main ─────────────────────────────────────────────────────── */
async function main() {
  const pc = new Pinecone({ apiKey });

  /* 5a. Create index (idempotent) */
  const existingIndexes = await pc.listIndexes();
  const indexNames = (existingIndexes.indexes ?? []).map((ix) => ix.name);

  if (indexNames.includes(INDEX_NAME)) {
    console.log(`[build-pinecone-index] Index "${INDEX_NAME}" already exists — skipping creation.`);
  } else {
    console.log(`[build-pinecone-index] Creating integrated index "${INDEX_NAME}" …`);
    await pc.createIndexForModel({
      name: INDEX_NAME,
      cloud: CLOUD,
      region: REGION,
      embed: {
        model: EMBED_MODEL,
        fieldMap: { text: "chunk_text" },
      },
      waitUntilReady: true,
    });
    console.log(`[build-pinecone-index] Index "${INDEX_NAME}" created and ready.`);
  }

  /* 5b. Get index handle */
  const index = pc.index(INDEX_NAME);
  const ns = index.namespace(NAMESPACE);

  /* 5c. Build and upsert records */
  const records = buildRecords(corpus);
  console.log(`[build-pinecone-index] Upserting ${records.length} records into namespace "${NAMESPACE}" …`);

  const batches = chunk(records, BATCH_SIZE);
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    await ns.upsertRecords(batch);
    console.log(`  batch ${i + 1}/${batches.length} — ${batch.length} records done`);
  }

  console.log(`[build-pinecone-index] Done. ${records.length} records upserted to ${INDEX_NAME}/${NAMESPACE}.`);
}

main().catch((err) => {
  console.error("[build-pinecone-index] FATAL:", err.message ?? err);
  process.exit(1);
});
