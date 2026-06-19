# Tier-2 Integration Notes — saraloosa-os

Branch: `claude/tier1-3-fixes`  
Implemented: 2026-06-19

---

## A. Langfuse observability

### How it works

All four Gemini agents (boot, brew, oracle, plantpal) are instrumented via a
lazy-init singleton in `src/lib/langfuse.mjs`.  The helper:

1. Checks for `LANGFUSE_PUBLIC_KEY` + `LANGFUSE_SECRET_KEY` + `LANGFUSE_HOST`
   at first call. If any are absent → **no-op mode** (every call is a silent
   stub; zero overhead, zero breakage).
2. When enabled, lazily initialises `@langfuse/otel` `LangfuseSpanProcessor`
   inside `@opentelemetry/sdk-node` (dynamic `import()` so the SDK is only
   loaded when the env vars are present).
3. Each API route calls `traceGeneration({ agent, input })` before the core
   function, then `.end(result)` after. Both calls are `try/catch`-wrapped —
   a Langfuse error never surfaces to the user.
4. `forceFlush()` is called inside `.end()` so spans are sent before the
   Netlify function returns.

### Files touched

| File | Change |
|---|---|
| `src/lib/langfuse.mjs` | **NEW** — helper (lazy init, traceGeneration, langfuseFlush) |
| `src/pages/api/boot.ts` | imports traceGeneration, wraps diagnose() call |
| `src/pages/api/brew.ts` | imports traceGeneration, wraps brew() call |
| `src/pages/api/ask.ts`  | imports traceGeneration, wraps ask() call |
| `src/pages/api/plantpal.ts` | imports traceGeneration, wraps identifyPlant() call |
| `package.json` | added `@langfuse/otel`, `@langfuse/tracing`, `@opentelemetry/sdk-node` |

### Env vars required (Netlify site settings)

```
LANGFUSE_PUBLIC_KEY=pk-lf-…
LANGFUSE_SECRET_KEY=sk-lf-…
LANGFUSE_HOST=https://cloud.langfuse.com
```

Keys are in Langfuse UI → Project → Settings → API Keys.  
US cloud: use `https://us.cloud.langfuse.com`.

### NEEDS-LIEZL

- [ ] Create a Langfuse account / project at https://cloud.langfuse.com
- [ ] Copy public key + secret key into Netlify env vars (scope: Functions)
- [ ] Verify traces appear in Langfuse dashboard after next deploy

---

## B. Cloudinary media CDN

### How it works

`src/lib/cloudinary.mjs` exports `cld(src, opts)`:

- Reads `PUBLIC_CLOUDINARY_CLOUD_NAME` (preferred — Astro exposes to client)
  or `CLOUDINARY_CLOUD_NAME` (server-only fallback).
- If set: returns a Cloudinary **fetch** delivery URL using format/quality
  auto transforms + optional width cap. Cloudinary fetches the image from
  `CLOUDINARY_SITE_ORIGIN` (default `https://saraloosa.org`) on first
  request and caches it globally.
- If not set: returns `src` unchanged. Zero CDN, zero breakage.

### Demo wiring

One image has been wired as a demo:

**`src/pages/index.astro`** — hero panel background:

```astro
<img src={cld('/img/story/1-the-secret-of-the-wildroots-sprouts-branded-p02.webp', { width: 900 })} ... />
```

When `PUBLIC_CLOUDINARY_CLOUD_NAME` is set, this delivers via Cloudinary CDN
with `f_auto,q_auto,w_900,c_limit`. When it's not set, it delivers the local
path — identical behaviour to before.

### Files touched

| File | Change |
|---|---|
| `src/lib/cloudinary.mjs` | **NEW** — cld() helper |
| `src/pages/index.astro` | imports cld, wraps hero image |
| `package.json` | added `cloudinary` |
| `.env.example` | added CLOUDINARY_* vars |

### Env vars required (Netlify site settings)

```
PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_SITE_ORIGIN=https://saraloosa.org
```

### Adoption path (bulk migration — follow-up task)

1. Add env vars to Netlify → Site settings → Environment variables.
2. Replace `<img src="...">` with `<img src={cld('...', { width: N })}>` in:
   - `src/pages/index.astro` — remaining card images
   - `src/pages/the_syllabus.astro`
   - `src/pages/the_compost.astro`
   - `src/pages/arcade.astro`
   - `src/layouts/TerminalLayout.astro` (OG image meta tag)
3. Consider uploading static assets to Cloudinary media library for
   upload-type delivery (more transforms available) vs fetch-type.
4. The `dig-deeper/` assets (staged from wildroots/) are large webp files —
   these are the highest-value Cloudinary targets for bandwidth savings.

---

## Key-gated items needing Liezl's action

| Item | Blocker |
|---|---|
| Langfuse traces live | Langfuse account + API keys in Netlify env |
| Cloudinary CDN live | Cloudinary account + cloud name in Netlify env |
| Cloudinary bulk migration | After single-image demo confirmed working |
