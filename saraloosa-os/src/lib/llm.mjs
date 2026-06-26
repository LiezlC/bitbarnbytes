/* =====================================================================
   callStructured() — one structured-output call with provider fallback
   ---------------------------------------------------------------------
   Primary: Google Gemini (responseSchema). Fallback: HuggingFace Inference
   Providers' OpenAI-compatible router (response_format json_schema), which
   routes to Cerebras/Groq/Together with one HF_TOKEN. If Gemini is missing,
   rate-limited, or errors, we transparently try HF so the agents survive a
   Gemini outage.

   Env:
     GOOGLE_GENERATIVE_AI_API_KEY  (primary; also passed in per-call)
     HF_TOKEN                      (fallback; optional — no token => no fallback)
     HF_MODEL                      (optional; default openai/gpt-oss-120b:cerebras)
   ===================================================================== */
import { readFileSync, existsSync } from "node:fs";

const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_URL = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
const HF_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL_DEFAULT = "openai/gpt-oss-120b:cerebras";

/**
 * Gemini key resolver — the single source of truth for every agent route.
 * Production (Netlify) and CI resolve the key from the GOOGLE_GENERATIVE_AI_API_KEY
 * env var only. As a *local dev* convenience, when that var is unset we may read the
 * key from a sibling gem-voice project's .env.local. That path is overridable via
 * GEMINI_KEY_FILE and is NEVER consulted in production (guarded on NODE_ENV), so the
 * fallback can't leak a host path into prod traces or break on other machines.
 */
export function resolveGeminiKey() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (process.env.NODE_ENV !== "production") {
    const f =
      process.env.GEMINI_KEY_FILE ||
      "C:/Users/Liezl/Documents/Github/gemini-voice-agents/gem-voice/.env.local";
    if (existsSync(f)) {
      const line = readFileSync(f, "utf8").split(/\r?\n/).find((l) => l.startsWith("GOOGLE_GENERATIVE_AI_API_KEY="));
      if (line) return line.slice("GOOGLE_GENERATIVE_AI_API_KEY=".length).trim();
    }
  }
  return "";
}

async function viaGemini({ system, user, schema, temperature, maxOutputTokens, images }, key) {
  const parts = [{ text: user }];
  for (const im of images || []) parts.push({ inline_data: { mime_type: im.mimeType, data: im.dataBase64 } });
  const body = {
    contents: [{ parts }],
    system_instruction: { parts: [{ text: system }] },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature,
      maxOutputTokens,
      thinkingConfig: { thinkingLevel: "low" },
    },
  };
  const res = await fetch(GEMINI_URL(key), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const e = new Error(`gemini ${res.status}`);
    e.upstream = "gemini"; e.detail = detail.slice(0, 300);
    throw e;
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  return JSON.parse(text);
}

async function viaHF({ system, user, schema, schemaName, temperature }, token) {
  const body = {
    model: process.env.HF_MODEL || HF_MODEL_DEFAULT,
    messages: [
      { role: "system", content: system + "\n\nRespond with ONLY a single JSON object matching the schema — no prose, no markdown." },
      { role: "user", content: user },
    ],
    response_format: { type: "json_schema", json_schema: { name: schemaName, schema, strict: false } },
    temperature,
  };
  const res = await fetch(HF_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const e = new Error(`hf ${res.status}`);
    e.upstream = "hf"; e.detail = detail.slice(0, 300);
    throw e;
  }
  const data = await res.json();
  let text = data?.choices?.[0]?.message?.content || "";
  // some providers wrap JSON in ```json fences
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(text);
}

/**
 * Get a schema-validated object back, trying Gemini then HuggingFace.
 * @returns {Promise<object>}
 * @throws {Error} with .status (502) and .detail if all providers fail.
 */
export async function callStructured({
  system,
  user,
  schema,
  schemaName = "response",
  temperature = 0.7,
  maxOutputTokens = 2048,
  geminiKey,
  images,
}) {
  const key = geminiKey || resolveGeminiKey();
  const hfToken = process.env.HF_TOKEN || "";
  const hasImages = Array.isArray(images) && images.length > 0;
  const attempts = [];

  if (key) {
    try {
      return await viaGemini({ system, user, schema, temperature, maxOutputTokens, images }, key);
    } catch (err) {
      attempts.push(`gemini: ${err.message}${err.detail ? " — " + err.detail : ""}`);
    }
  } else {
    attempts.push("gemini: no key");
  }

  // the default HF fallback model is text-only — skip it for image inputs
  if (hfToken && !hasImages) {
    try {
      return await viaHF({ system, user, schema, schemaName, temperature }, hfToken);
    } catch (err) {
      attempts.push(`hf: ${err.message}${err.detail ? " — " + err.detail : ""}`);
    }
  } else {
    attempts.push(hasImages ? "hf: skipped (image input, text-only model)" : "hf: no token");
  }

  const e = new Error("All model providers failed.");
  e.status = 502;
  e.detail = attempts.join(" | ");
  throw e;
}
