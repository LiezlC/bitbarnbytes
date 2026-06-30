# Wild Pharmacy — Living Pharmacopoeia Knowledge Graph

> Phase A spec (the data foundation). 2026-06-30.
> Expands the Wild Pharmacy from the 13-plant labyrinth into a **125-plant living
> pharmacopoeia**, navigable as a **3D Obsidian-style knowledge graph** where
> plants cluster by shared themes via many-to-many links.
> **The current 13-plant game stays free and untouched** — this is a new layer.

## Decomposition (3 sub-projects — A first)
- **A — the linked facet dataset** *(this spec)*: structure 125 plants into tagged
  facets + a graph-ready node/link file. The foundation; B and C depend on it.
- **B — the 3D graph viz/navigation** (`3d-force-graph`, self-contained HTML).
- **C — labyrinth integration** (expanded game / new mode).

## Scope: 125 plants
- **88** from `wildroots/Apothecary_Index.xlsx` → sheet "Botanicals & Fungi" (already richly populated: name, latin, family, part, F/S/I flags, actives, uses, growable, note, also-known, cautions, source, references).
- **37 additions** (researched to the same depth):
  - extras (8): aloe, turmeric, coconut, basil, amaranth, asparagus, pine, nasturtium
  - spice + topical (8): cinnamon, clove, moringa, tulsi, comfrey, witch hazel, meadowsweet, cardamom
  - cornerstones (2): cannabis, bamboo
  - oils + exotics (6): neem, argan, black seed (Nigella), evening primrose, blue lotus, baobab
  - caffeine crew (2): coffee, cacao
  - from Liezl's seed order (11): borage, opium poppy, Roman chamomile, celery, rhubarb, tobacco, dill, coriander, tarragon, parsley, caper
- **Deferred** to a future "kitchen garden / food-as-medicine" rerun: the vegetables
  (onion, beetroot, brassicas, carrot, squash, lettuce, peas, etc.). The pipeline
  re-runs for any list, so additions append later without rework.

## Facet schema (the link dimensions)
Every **plant** is a node. Every **facet-value** is also a node. **Edges = plant↔facet**, typed by dimension (so the graph can filter/cluster by any one). Facets:

| Facet            | Controlled-vocab values (examples)                                                                                                     |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `effectPath[]`   | focus · calm · sleep · immunity · respiratory · digestive · skin · pain · energy · hormonal · cardiovascular · cognitive · liver/detox |
| `ailments[]`     | anxiety · insomnia · indigestion · cough · cold/flu · wounds · inflammation · headache · low mood … (canonicalised)                    |
| `partsUsed[]`    | leaf · flower · root · bark · seed · rhizome · aerial · resin · fruit · gel · oil · whole                                              |
| `preparations[]` | tincture · infusion (tea) · decoction · infused oil · dried · distilled (essential oil / hydrosol) · poultice · ferment · syrup · salve · powder/capsule · smoke |
| `growsIn[]`      | fynbos · Mediterranean · tropical · subtropical · temperate · + conditions (sun/shade · drought-hardy · damp · easy-garden)            |
| `otherUses[]`    | culinary · cosmetic · dye · ritual/spiritual · fibre · companion-plant · smoke · aromatic                                              |
| `cautions[]` (warnings) | avoid-in-pregnancy · breastfeeding · drug-interactions · toxic-in-overdose · sedating · controlled/regulated · thujone · phototoxic · allergen (e.g. Asteraceae) · not-for-long-term · endangered-conservation |
| `constituents[]` | named actives + classes (alkaloids · flavonoids · terpenes · caffeine · GLA …)                                                         |
| `family`         | botanical family (single)                                                                                                              |
| `origin`         | native region (single)                                                                                                                 |

`preparations[]` is the "how you make the medicine" dimension (the game's *extract → concoct* step) — clusters every tincture, every infused oil, every distillation. `cautions[]` makes **warnings a first-class linkable category** (the "respect the minotaur" web): plants cluster by *avoid-in-pregnancy*, *toxic-in-overdose*, *drug-interactions*, etc. — so the dangerous ones light up together.

Carried (non-link) per-plant fields: `commonNames · latin · cautionsNote (free-text detail behind the cautions[] tags) · conservationStatus · growableNote · references · effectFlags(F/S/I)`.

## Data sources
- **The 88:** parse/structure the existing prose in the xlsx (no invention needed).
- **The 37 new:** research from reputable herbal references (web), filled to the same schema. Caution + conservation accuracy is non-negotiable.

## Extraction approach (subagent fan-out — a Workflow)
1. **Source assembly:** dump the 88 plants' prose from the xlsx → working JSON; list the 37 new names.
2. **Fan-out extraction:** parallel subagents, each a batch (~8–10 plants), emit the facet schema (structured JSON, controlled-vocab tags) from source prose (88) or research (37).
3. **Adversarial verification:** a second pass checks each plant's tags against the source — no invented ailments/constituents, cautions accurate, conservation flags correct, de-claim rules honoured.
4. **Vocabulary normalisation:** merge synonymous tags to canonical facet-values so links actually form (e.g. "anxiousness"→"anxiety").
5. **Merge → outputs:** `plants.json` (per-plant facets) + `graph.json` (nodes + typed links), ready for `3d-force-graph` in Phase B.

## Guardrails (Wildroots rules)
- Educational folklore, **never medical advice**; every plant carries its cautions.
- **Conservation-positive:** flag endangered/overharvested (goldenseal, slippery elm, chaga, cat's claw, pepperbark, wild ginger…) with "grow, don't wild-harvest."
- **Don't claim all SA-native** — origin tags accurate per plant.
- **Powerful/toxic plants** (opium poppy, tobacco, cannabis, pokeweed, wormwood) get prominent caution facets — the "respect the minotaur" layer.
- Never fabricate source URLs; use the Index's real refs + reputable herbal sources.

## Deliverables
- `wildroots/wild-pharmacy/pharmacopoeia/plants.json` (125 plants, faceted)
- `wildroots/wild-pharmacy/pharmacopoeia/graph.json` (graph-ready nodes + links)
- a short data README

## Success criteria
- 125 plants, every facet dimension populated from a controlled vocabulary.
- Known clusters self-form on spot-check: the caffeine crew (coffee·tea·guarana·cola·cacao via caffeine + focus), SA fynbos, Asteraceae, the nervines/calm set, the endangered-steward cluster, the **preparation** clusters (every tincture / infused oil / distillation), and the **caution** web (the avoid-in-pregnancy / toxic / drug-interaction constellations).
- Cautions + conservation status accurate and source-traceable.

## Out of scope (later phases)
- B: the 3D `3d-force-graph` viz/navigation.
- C: labyrinth game expansion.
- The food-as-medicine vegetable layer.
