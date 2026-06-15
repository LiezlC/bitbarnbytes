# The Kitchen Alchemy Lab — first Wildroots content-agent

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
