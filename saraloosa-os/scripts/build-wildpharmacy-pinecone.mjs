#!/usr/bin/env node
/* =====================================================================
   build-wildpharmacy-pinecone.mjs — Wild Pharmacy plant ingest
   ---------------------------------------------------------------------
   Usage:  PINECONE_API_KEY=<key> node scripts/build-wildpharmacy-pinecone.mjs

   Upserts the 13 hero plants from wildroots/wild-pharmacy/stations.json into
   namespace `wild-pharmacy` of the shared integrated-inference index
   `saraloosa-soil` (model llama-text-embed-v2). Pinecone embeds the
   `chunk_text` field via the index fieldMap — no manual vectors needed.

   The in-game Soil Oracle (/api/herb -> src/lib/herb-oracle.mjs) searches
   this namespace. Re-run whenever stations.json changes.
   ===================================================================== */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Pinecone } from "@pinecone-database/pinecone";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const STATIONS = resolve(ROOT, "..", "wildroots", "wild-pharmacy", "stations.json");

const INDEX_NAME = "saraloosa-soil";
const NAMESPACE = "wild-pharmacy";

const apiKey = process.env.PINECONE_API_KEY;
if (!apiKey) {
  console.error("[build-wildpharmacy-pinecone] ERROR: PINECONE_API_KEY is not set.");
  process.exit(1);
}
if (!existsSync(STATIONS)) {
  console.error(`[build-wildpharmacy-pinecone] ERROR: stations.json not found at ${STATIONS}`);
  process.exit(1);
}

const plants = JSON.parse(readFileSync(STATIONS, "utf8"));

function originOf(p) {
  const n = (p.note || "") + " " + (p.growable || "");
  if (/critically endangered/i.test(p.growable)) return "Southern African native (critically endangered)";
  if (/endangered/i.test(p.growable)) return "South African native (endangered)";
  if (/Mediterranean/i.test(n)) return "Mediterranean (not SA native)";
  if (p.key === "gotu-kola") return "Asian (not SA native)";
  if (p.key === "wormwood") return "European A. absinthium / native SA A. afra";
  if (/SA native|fynbos native|SA fynbos|Southern African/i.test(n)) return "Southern African native";
  return "";
}

function recordFor(p) {
  const chunk = [
    `${p.common}${p.alsoKnown ? ", " + p.alsoKnown : ""}.`,
    `${p.latin}, family ${p.family}.`,
    `Part used: ${p.part}.`,
    `Uses: ${p.uses}`,
    p.actives ? `Active compounds: ${p.actives}.` : "",
    p.growable ? `Growing: ${p.growable}.` : "",
    p.cautions ? `Caution: ${p.cautions}` : "",
  ].filter(Boolean).join(" ");

  return {
    _id: `plant-${p.key}`,
    chunk_text: chunk,
    key: p.key,
    title: p.common,
    latin: p.latin,
    family: p.family || "",
    part: p.part || "",
    growable: p.growable || "",
    caution: p.cautions || "",
    alsoKnown: p.alsoKnown || "",
    origin: originOf(p),
  };
}

async function main() {
  const pc = new Pinecone({ apiKey });
  const ns = pc.index(INDEX_NAME).namespace(NAMESPACE);
  const records = plants.map(recordFor);
  console.log(`[build-wildpharmacy-pinecone] Upserting ${records.length} plants into ${INDEX_NAME}/${NAMESPACE} …`);
  await ns.upsertRecords(records);
  console.log(`[build-wildpharmacy-pinecone] Done. ${records.length} plants upserted.`);
}

main().catch((err) => {
  console.error("[build-wildpharmacy-pinecone] FATAL:", err.message ?? err);
  process.exit(1);
});
