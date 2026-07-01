# Wild Pharmacy — the Pharmacopoeia

A **125-plant faceted dataset + a 3D knowledge-graph explorer**. Phase A of the
Wild Pharmacy expansion. (The current 13-plant labyrinth game stays free and
separate; this is the new layer.)

## Files
- **`plants.json`** — 125 plants, each faceted: `effectPath · ailments · partsUsed ·
  preparations · growsIn · otherUses · cautions · constituents · family · origin`
  (+ `cautionsNote`, `conservationStatus`, `references`).
- **`graph.json`** — graph-ready `{ nodes, links }`. Plant-nodes + facet-value-nodes;
  every edge is a typed `plant↔facet` link. **730 nodes, 3083 links.**
- **`graph.html`** — self-contained 3D force-directed explorer ([3d-force-graph]).
  Open it in any browser. The **"link lens"** filters to one dimension at a time
  (cautions = the "respect the minotaur" web, effect-path, preparations, where-it-grows…).
  Click a plant to focus it and read its facets.
- **`source-88.json`** — the structured dump of the 88 plants from
  `wildroots/Apothecary_Index.xlsx` ("Botanicals & Fungi") that seeded the run.

## How it was built
A subagent fan-out (**extract → adversarial-verify**, schema-enforced) over the 88
xlsx plants + 37 researched additions, then vocabulary-normalised and assembled into
the graph. Full design: `docs/superpowers/specs/2026-06-30-wild-pharmacy-knowledge-graph.md`.

Educational folklore, **never medical advice**. Cautions, conservation flags
(endangered → "grow, don't wild-harvest") and accurate origins are carried per plant.

## Regenerate / extend
Add plants to the source set and re-run the extraction workflow — the graph rebuilds
for any list (e.g. the deferred **"kitchen garden" food-as-medicine** layer of vegetables).

[3d-force-graph]: https://github.com/vasturiano/3d-force-graph
