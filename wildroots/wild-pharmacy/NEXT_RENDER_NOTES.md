# Wild Pharmacy — corrections for the next video render

Captured 2026-06-29. The current `WildPharmacy_overview.mp4` is a first pass; not happy with it.
Fix these on the next generation.

## 1. Drop the "South African medicinal plants" framing (the over-claim near the start)
The opening narration frames the whole experience as South African medicinal plants.
That's not accurate for the current 13-station list:
- **Genuinely SA-native (10):** kanna, kankerbossie, buchu, rooibos, honeybush, bulbine,
  wild dagga, pepperbark, wild ginger, pelargonium.
- **Not SA:** rosemary (Mediterranean), gotu kola (Asian — Centella asiatica).
- **Hedged:** wormwood (A. absinthium is European; SA Wilde-als = A. afra is native).

**Decision:** do NOT swap the non-SA herbs out — keep all 13. Instead, just don't claim
them all as South African. Frame as "a wild apothecary / healing herbs," several of them
SA-native, without the blanket indigenous claim.

**Root cause:** this line is NOT in any source file. It appears in BOTH generated
artifacts — the video narration AND the dual-voice audio overview — which means it's
NotebookLM's own inference. The sources lean heavily SA-coded (fynbos, Xhosa/Zulu
herbalism, plantzafrica refs, 10 native species), so NLM rounds the whole set up to
"South African." It must be actively steered away with the prompt on EVERY render
(video and audio both).

**Paste-ready steering line (add to every video + audio generation prompt):**
> Do not describe the collection as "South African medicinal plants" or imply the herbs
> are all indigenous to South Africa. Many are SA-native, but the set deliberately also
> includes Mediterranean rosemary and Asian gotu kola. Frame it as a wild apothecary of
> healing herbs from varied origins — emphasise use and effect, not a single country.

## 2. Style → anime (new default)
Anime is the best — and likely cheapest — fit to the current visuals. Move off the previous
default. Include style pointers in the prompt to steer it toward the existing look.

## 3. Narration voice → female (preferred; tweakable after)

## 4. Future expansion (once the basics hold)
When extending beyond these 13 to the wider healing-herb database, add per-herb "flavor"
tags instead of one blanket origin claim:
- **Origin** (e.g. indigenous-to-SA vs. naturalised/global)
- **Effect path** — focus / relax / immunity (respiratory) / digestive ease / etc.
Use these as the paths/hallways of the larger labyrinth.
