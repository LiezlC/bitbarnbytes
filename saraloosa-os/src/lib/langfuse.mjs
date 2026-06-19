/* =====================================================================
   Langfuse observability helper — Tier-2 integration
   ---------------------------------------------------------------------
   ENV-GATED: all Langfuse behaviour is disabled if any of
   LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY / LANGFUSE_HOST are absent.
   When disabled every exported function is a no-op so agent calls are
   completely unaffected.

   Usage (in an agent core or API route):
     import { traceGeneration } from "./langfuse.mjs";

     const t = traceGeneration({ agent: "boot", input: {...} });
     const result = await callStructured(...);
     await t.end(result);       // non-throwing; Langfuse error swallowed

   SAFE FALLBACK: every public function wraps its body in try/catch and
   resolves silently on error. A Langfuse outage never touches the agent.
   ===================================================================== */

/** Lazily-resolved singleton — undefined when env vars are absent. */
let _sdk = null;
let _processor = null;
let _initialised = false;

function isEnabled() {
  return !!(
    process.env.LANGFUSE_PUBLIC_KEY &&
    process.env.LANGFUSE_SECRET_KEY &&
    (process.env.LANGFUSE_HOST || process.env.LANGFUSE_BASE_URL)
  );
}

/**
 * Lazily initialise the OTel SDK + LangfuseSpanProcessor.
 * Called at most once per process lifetime.
 * Returns false when env vars are missing (no-op mode).
 */
async function ensureInit() {
  if (_initialised) return !!_sdk;
  _initialised = true;

  if (!isEnabled()) return false;

  try {
    const [{ NodeSDK }, { LangfuseSpanProcessor }] = await Promise.all([
      import("@opentelemetry/sdk-node"),
      import("@langfuse/otel"),
    ]);

    const host =
      process.env.LANGFUSE_HOST ||
      process.env.LANGFUSE_BASE_URL ||
      "https://cloud.langfuse.com";

    _processor = new LangfuseSpanProcessor({
      publicKey: process.env.LANGFUSE_PUBLIC_KEY,
      secretKey: process.env.LANGFUSE_SECRET_KEY,
      baseUrl: host,
    });

    _sdk = new NodeSDK({ spanProcessors: [_processor] });
    _sdk.start();
  } catch (err) {
    // SDK init failure: degrade gracefully
    console.warn("[langfuse] init failed (no-op mode):", err?.message);
    _sdk = null;
    _processor = null;
  }

  return !!_sdk;
}

/**
 * Flush pending spans to Langfuse.
 * Call this BEFORE a serverless function returns.
 * Non-throwing.
 */
export async function langfuseFlush() {
  try {
    if (_processor) await _processor.forceFlush();
  } catch {
    // swallow — observability must not affect the response
  }
}

/**
 * Wrap a Gemini agent call with a Langfuse generation trace.
 *
 * @param {object} opts
 * @param {string}  opts.agent      — tag for which agent ("boot"|"brew"|"oracle"|"plantpal")
 * @param {string}  [opts.model]    — model identifier, default "gemini-3.5-flash"
 * @param {any}     opts.input      — the prompt / user input sent to the model
 * @returns {{ end(output: any): Promise<void> }}
 *    Call .end(result) after the model call completes.
 *    .end() is non-throwing.
 */
export async function traceGeneration({ agent, model = "gemini-3.5-flash", input }) {
  const started = Date.now();
  let observation = null;

  try {
    const active = await ensureInit();
    if (!active) return _noop();

    const { startObservation } = await import("@langfuse/tracing");

    observation = startObservation(
      `saraloosa-${agent}`,
      {
        input,
        model,
        metadata: { agent, site: "saraloosa.org" },
      },
      { asType: "generation" }
    );
  } catch (err) {
    console.warn(`[langfuse] traceGeneration start failed (${agent}):`, err?.message);
    return _noop();
  }

  return {
    async end(output) {
      try {
        if (observation) {
          const latencyMs = Date.now() - started;
          observation
            .update({
              output,
              metadata: { latencyMs },
            })
            .end();
        }
        await langfuseFlush();
      } catch (err) {
        console.warn(`[langfuse] traceGeneration end failed (${agent}):`, err?.message);
      }
    },
  };
}

/** Returns a no-op handle identical in shape to traceGeneration's return. */
function _noop() {
  return { end: async () => {} };
}
