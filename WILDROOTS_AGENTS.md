# Wildroots content-agents

Four in-app agents, all via `saraloosa-os/src/lib/llm.mjs` (**Gemini 3.5 Flash primary, HuggingFace
Inference Providers fallback**) with structured output, each giving a real but **bounded** taste then
routing to depth (a paid Gumroad bundle or a curriculum module).

1. **The Kitchen Alchemy Lab** (`/api/brew`) — the Brewing Bench, model-powered. (Dig Deeper page)
2. **The Soil Oracle** (`/api/ask`) — RAG "ask" console grounded only in the corpus + the moat layer. (Dig Deeper page)
3. **The Boot Sequence** (`/api/boot`) — Exile burnout diagnostic on `/the_syllabus`. (Astro page)
4. **The Plant Pal Identifier** (`/api/plantpal`) — describe a plant → matched Plant Pal + one fact + a firm
   foraging-safety caution → routes to the Field Guide Set. (Dig Deeper page, garden surface). Safety-critical:
   never confirms edibility; vague/risky inputs return low confidence + a STOP caution.

## Provider fallback (`src/lib/llm.mjs`)
`callStructured({system, user, schema})` tries Gemini first, then HuggingFace's OpenAI-compatible router
(`router.huggingface.co/v1`, model `HF_MODEL` default `openai/gpt-oss-120b:cerebras`) if Gemini is missing,
rate-limited, or errors. **To activate the fallback, set `HF_TOKEN`** (free HF account) in Netlify env + local;
without it the fallback is a graceful no-op. All four cores call through this one helper.

## Selling
The Brewing Bench + Soil Oracle "go deeper" CTAs, the Plant Pal route, and the bedrock bundle buttons link to
the live Gumroad products (`bitsoil.gumroad.com/l/<slug>`) via `productFor()` in the Dig Deeper page. Edit the
`PRODUCT` slug map there if storefront slugs change.

## Deployment (unified — current)

All three ship from the **one** Astro/Netlify site (`saraloosa-os`, → saraloosa.org):
- The three endpoints are Astro API routes in `saraloosa-os/src/pages/api/{brew,ask,boot}.ts`
  (`prerender = false`), bundled into one Netlify SSR function by `@astrojs/netlify` (adapter applied
  only at `astro build` — see `astro.config.mjs`).
- The shared cores live in `saraloosa-os/src/lib/` (`brew-core.mjs`, `oracle-core.mjs` which `import`s
  `corpus.json`, `boot-core.mjs`).
- The Dig Deeper page + its assets are staged into `saraloosa-os/public/dig-deeper/` at build by
  `saraloosa-os/scripts/stage-digdeeper.mjs` (the `prebuild`/`predev` hook), so they serve at
  `/dig-deeper/`. That folder is gitignored — the PDFs live in the repo only once (under `wildroots/`).
- **Required:** set `GOOGLE_GENERATIVE_AI_API_KEY` in the Netlify site env (one var powers all three).

Local: `cd saraloosa-os && npm run dev` (predev stages Dig Deeper), then `/`, `/the_syllabus`,
`/dig-deeper/`, and the three `/api/*` routes all work on one origin.

The standalone path below (`wildroots/` + `scripts/dev-server.mjs` + root `netlify/functions/`) still
works for previewing the Dig Deeper bundle on its own, but is no longer the deploy path.

---

## 1. The Kitchen Alchemy Lab

A model-powered upgrade to the Brewing Bench in `wildroots/dig-deeper/index.html`. A visitor
types whatever's in their kitchen/garden right now; the cauldron returns a **named elixir**, a
**cast of soil characters** each reading one ingredient, a **Three-Day-Rule / safety caution**, a
one-line verdict, one concrete next move, and a **route to the matching paid bundle**. It runs *on*
the Wildroots canon — the content is the agent. Bounded taste → route to depth.

## Pieces
- `lib/brew-core.mjs` — shared agent core: the in-world system prompt, the response schema, the
  Gemini call, and the bundle→PDF link map. Used by both server and function (one source of truth).
- `scripts/dev-server.mjs` — local preview: serves `wildroots/dig-deeper/` **and** answers
  `POST /api/brew`. Per-IP rate limit (8 / 5 min).
- `netlify/functions/brew.mjs` — the same `/api/brew` for production (ship-this-week path).
- `wildroots/dig-deeper/index.html` — the lab UI + reveal, inlined (the page must stay
  self-contained: `build-deploy.py` only copies md/pdf/webp/png).

Model: **gemini-3.5-flash**, structured output via `responseSchema`.

## Run locally
```sh
# key resolves from env, else gem-voice/.env.local automatically
node scripts/dev-server.mjs
# → http://localhost:8787/   (scroll to the Underground Laboratory → Brewing Bench)
```
Set the key explicitly if needed:
```sh
GOOGLE_GENERATIVE_AI_API_KEY=... node scripts/dev-server.mjs
```

## Ship to production (the deferred decision)
`dig-deeper` is **not** what Netlify currently deploys — `netlify.toml` builds `saraloosa-os/dist`.
To put this live, pick one:
- **(a) fast path** — give `wildroots/_deploy` its own Netlify site, set
  `GOOGLE_GENERATIVE_AI_API_KEY` in its env, and ship `netlify/functions/brew.mjs` alongside it
  (the function self-routes to `/api/brew` via its `config.path`).
- **(b) consolidation** — fold `dig-deeper` into the Astro site as a route and use Astro/Netlify
  endpoints; unifies the two sites and fixes the dead `/the_syllabus` and `/the_compost` links.

After publishing the Gumroad products, replace the `GUMROAD` placeholder + per-bundle `buy` links
(see `wildroots/gumroad-listings.md`) and rebuild with `python wildroots/scripts/build-deploy.py`.

---

## 2. The Soil Oracle (RAG ask + the moat layer)

"Ask the Underground" — a console that answers **only** from the Wildroots corpus, cites the free
documents it used, and routes to the paid bundle for depth. The free/paid tagging *is* the paywall
for agents. Lives in the Root Zone (Vital Earth Academy) section of the page.

### The corpus pipeline (single source of truth)
The page's inline `DOCS` + `FACTS` are the canon. `scripts/extract-corpus.mjs` reads them out of
`index.html` and emits three artifacts — so the corpus never drifts from the page:

```sh
node scripts/extract-corpus.mjs
#  -> lib/corpus.json                  (server-side grounding for the Oracle)
#  -> wildroots/dig-deeper/corpus.json (public, free/paid tagged, agent-addressable)
#  -> wildroots/dig-deeper/llms.txt    (crawler manifest: named frameworks + free/paid boundary)
```
Re-run it whenever you edit `DOCS`/`FACTS` in the page. `build-deploy.py` copies `corpus.json` +
`llms.txt` into the deploy bundle.

### Pieces
- `lib/oracle-core.mjs` — the ask agent: loads `lib/corpus.json`, builds a grounded prompt
  (answer-only-from-corpus, cite titles, route to one bundle), schema-structured output.
- `scripts/dev-server.mjs` — also answers `POST /api/ask`.
- `netlify/functions/ask.mjs` — production `/api/ask`.
- `wildroots/dig-deeper/index.html` — the "Ask the Underground" console + reveal (inlined).

Behavior verified: in-corpus → grounded answer + real citations; out-of-corpus → `inCorpus:false`,
**no fabrication**, honest redirect; empty → 400; temperature 0.4 (grounded, not creative).

### Netlify note for `/api/ask`
`oracle-core.mjs` reads `lib/corpus.json` via `fs` at runtime, so the function must bundle it. In
`netlify.toml` for the dig-deeper site add:
```toml
[functions]
  included_files = ["lib/corpus.json"]
```

---

## Next agents (proposed, not built)
- **Plant Pal Identifier** — describe a weed → the Pal persona + nutrition + safety + Field Guide route.
- **The Boot Sequence** — burnout intake matching the visitor to one of the 5 Exile archetypes; belongs
  on the Astro side and fills the dead `/the_syllabus` link.
