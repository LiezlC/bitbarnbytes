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

## Tier B — Distinctive AI (Pinecone Soil Oracle)  ✅ DONE 2026-06-30
- [x] B1 13 plants upserted into `saraloosa-soil` ns `wild-pharmacy` (MCP now + reproducible `scripts/build-wildpharmacy-pinecone.mjs` / `npm run index:wildpharmacy`). Semantic retrieval verified (burn→Bulbine top hit).
- [x] B2 `/api/herb` endpoint + `src/lib/herb-oracle.mjs` core: searches ns wild-pharmacy, composes grounded answer via llm.mjs (Gemini→HF), deterministic fallback if no model key. Isolated from main Soil Oracle.
- [x] B3 In-game "ask the soil oracle" on the map: free-text Q&A → /api/herb, with offline keyword fallback (stemmed) so it works standalone. Verified in preview.
- [x] B4 Langfuse tracing reused (traceGeneration agent:"herb-oracle"). Deploy needs PINECONE_API_KEY + GOOGLE_GENERATIVE_AI_API_KEY (+ optional HF_TOKEN) in Netlify env — all already in .env.example.

## Tier C — Visual
- [~] C1 Mine frames_anime into tokens/icons — Learning Loop extracted (assets/learning-loop.png); goat/botanicals/bottles still need Liezl pointing at a contact sheet
- [x] C2 Dark nim (Seedream 4.5) atmospheric labyrinth backdrop (assets/map-bg.jpg) wired as a faint wash behind the title + map screens (opacity .5 under scrim). Generated 2 variations, picked the symmetric cauldron-centred one. ~20 credits.
- [x] C3 Favicon (assets/favicon.svg) + app icons (icon-192/512/180 from the cauldron plate) + composed OG share image (assets/og.jpg, 1200x630 over slide_06)

## Tier D — Distribution
- [x] D1 SEO/OG/Twitter meta + JSON-LD (VideoGame schema) + canonical in index.html head (serves as /wild-pharmacy/ meta)
- [x] D2 sitemap.xml entry + llms.txt entries (site map + Soil Oracle agent) for /wild-pharmacy/
- [x] D3 PWA: manifest.webmanifest + sw.js service worker (same-origin shell cache; Cloudinary + /api/ pass through) → installable, offline shell. SW registered + controlling (verified).

## Tier E — Depth
- [ ] E1 Expansion herbs from Apothecary_Index.xlsx beyond 13
- [ ] E2 Restructure labyrinth by ORIGIN + EFFECT-PATH branching hallways (keeps the de-claimed 13)

## Arsenal notes
- Cloudinary LIVE (cloud `dpowc778t`); clips + audio streamed. Creds in gitignored `saraloosa-os/.env`.
- Pinecone index `saraloosa-soil` ready (1024-dim, llama-text-embed-v2, fieldMap text→chunk_text).
- nim (Seedream/Z-image) for dark art; check credits before generating.
- faster-whisper venv at `~/.whisper-venv` (transcripts done).
