# Wild Pharmacy — "Magnificent" enhancement roadmap

> Open-ended autonomous mandate (2026-06-30): survey the full arsenal, identify
> every way to make the gameworld magnificent, implement in waves, chain onward.
> Base build is complete + Cloudinary-hosted (see `wildroots/wild-pharmacy/HANDOVER.md`).
> Game is a self-contained `wildroots/wild-pharmacy/index.html`.

## Tier A — Game systems & feel (pure index.html)  ✅ DONE 2026-06-30
- [x] A1 Persistence: localStorage codex (discovered plants), run stats (best escape hour, runs, wins, tinctures all-time), carried across sessions
- [x] A2 Trophies: First Tincture, Cauldron Opener, Master Herbalist (all 13 seen), Conservation Steward (pepperbark+wild-ginger clean), Fleet-footed (≤hour 9), Minotaur-free, Unaided — with unlock toasts
- [x] A3 Correct-answer flourish: door-pulse + tick animation + SFX on each right rung
- [x] A4 Accessibility: ARIA dialog roles, focus trap + restore in popups, number-key (1-4) answers, `prefers-reduced-motion`, focus-visible outlines
- [x] A5 Result share-card: canvas image + copy/Web-Share + save-image, on win and lose
- [x] A6 Difficulty / mercy: 13h (true) vs 16h (mercy), persisted; HUD limit dynamic
- [x] A7 Learning Loop how-to screen (assets/learning-loop.png; staged via stage-wildpharmacy.mjs)
- [x] A8 Feather-seekers boon (scene 25): on opening the cauldron, Daedalus/Icarus gift an hour back

## Tier B — Distinctive AI (Pinecone Soil Oracle)
- [ ] B1 Upsert the 13 plants (+ expansion) into existing `saraloosa-soil` index, namespace `wild-pharmacy`
- [ ] B2 Netlify function `ask-oracle` proxying Pinecone search (key server-side); reuse existing Soil Oracle endpoint if present
- [ ] B3 In-game "Ask the Oracle" free-text herb Q&A (augments static hints; graceful offline fallback to static)
- [ ] B4 (opt) Langfuse tracing on Oracle calls

## Tier C — Visual
- [ ] C1 Mine frames_anime into tokens/icons (goat familiar, botanicals, bottles) — needs Liezl pointing; Learning Loop already extracted
- [ ] C2 Dark nim (Seedream) scenes for gate / cauldron / map backdrop (handover polish; needs credits)
- [ ] C3 Favicon + app icons; Cloudinary-generated OG share image

## Tier D — Distribution
- [ ] D1 SEO/OG/Twitter meta on standalone + Astro card; JSON-LD
- [ ] D2 sitemap + llms.txt entry for /wild-pharmacy/
- [ ] D3 PWA: web manifest + service worker → installable, offline (local-clip fallback)

## Tier E — Depth
- [ ] E1 Expansion herbs from Apothecary_Index.xlsx beyond 13
- [ ] E2 Restructure labyrinth by ORIGIN + EFFECT-PATH branching hallways (keeps the de-claimed 13)

## Arsenal notes
- Cloudinary LIVE (cloud `dpowc778t`); clips + audio streamed. Creds in gitignored `saraloosa-os/.env`.
- Pinecone index `saraloosa-soil` ready (1024-dim, llama-text-embed-v2, fieldMap text→chunk_text).
- nim (Seedream/Z-image) for dark art; check credits before generating.
- faster-whisper venv at `~/.whisper-venv` (transcripts done).
