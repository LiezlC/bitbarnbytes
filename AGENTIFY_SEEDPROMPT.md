# Agentify This Repo — Seedprompt

*A portable brief for asking a Claude/AI instance to run an "agentification analysis" of whatever repo it is rooted in. Drop it into a session running inside the target repo (or `@`-reference this file). Optionally fill the OPTIONAL HINTS block at the bottom; leave it blank to give the analysis a long leash.*

---

## What I want from you

Go through **this repo** and find material that could be packaged as interactive, in-app "agents" — small live tools that *run a piece of my judgment or my content* for a visitor, on demand. Then propose concretely what to build, grounded in files that actually exist here.

Map the terrain first. Don't riff in the abstract — read the codebase, find what's already live, and root every proposal in real file paths. Think laterally, take risk-leaps, and expand rather than contract: find possibilities, not problems.

## The idea this is rooted in (distilled)

A creator-economy argument I'm working from: as AI makes *information* and *static content* effectively free, recorded courses / PDFs / talking-head explainers lose standalone value. What an expert can still sell narrows to four things:

1. **Live time** — the human in the room. Judgment, facilitation, taste, presence. The premium, scarce asset.
2. **Agents** — your skills and expertise packaged so they *run without you*. A bundled "digital employee" that solves a specific problem.
3. **Workflows** — multi-step processes vetted by your real experience, where the value is the *guaranteed outcome*, not the individual task. ("Tell me whether X is true / give me the finished thing," not "here's a tool.")
4. **Context** — your archive of frameworks, transcripts, results, reasoning, made machine-readable. Impossible to copy. It's both a product on its own and the fuel the agents and workflows run on. (Bet: a large and growing share of web traffic is *agents* looking for context to cite — so being agent-addressable is a moat, and a "paywall for agents" — free tier vs. paid tier — is a real model.)

A companion shift: stop optimizing *how to prompt*. Describe the **outcome** you want and let the system architect it. The agents you build encode outcomes, not keystrokes.

## The expansion — package CONTENT as agents

Beyond workflows, **the content itself can become agents.** If a body of work contains recurring, named conceptual instruments — a framework, a diagnostic lens, a recurring vocabulary, a cast of perspectives, a taxonomy of failure modes — each of those can become a *runnable* interactive demo instead of something you only read. A definition becomes a tool that does something to the visitor's own situation. A back-catalog becomes a live oracle that matches their case to your material.

## What "agentified" looks like (a proven precedent)

This pattern is already shipping on a sister site (sociable.systems). Two live shapes worth copying:

- **Single-shot structured demo** — visitor types one input; a fast model returns a *schema-structured* JSON verdict (scores, a cast of named perspectives each delivering one attack/read, a one-line verdict, one concrete "hardening" move); the UI reveals it with a staggered animation and ends in a CTA. Built on: a small `/api/<name>` route (Gemini Flash or similar + a response schema + a per-IP rate limit) and a reveal component. Example there: a six-seat adversarial "council" that stress-tests a single governance promise in fifteen seconds.
- **RAG "ask" console** — a chat box answering *only* from a pre-built embedding index of the site's own content, with every chunk tagged `free` vs `paid` so the agent answers fully from open material and routes to the gated offering for the rest. That tagging *is* the "paywall for agents."

You don't have to use those exact stacks — match whatever this repo already uses. The point is the *shape*: cheap model + structured output or retrieval + a reveal that ends in a route to depth.

## The one design rule (keep it through everything)

Every content-agent gives a **real but deliberately bounded taste, then routes to depth.** The free run is *one* promise / *one* concept / a fifteen-second read. The paid or live thing is the whole document, the cohort, the human at the table. This is what lets you be generous without cannibalizing the thing you actually sell. If a proposed agent gives away the whole judgment for free, redesign its boundary.

## Method — do this in order

1. **Map the stack.** Framework, AI/LLM usage (any embeddings, chat, structured-output already wired?), styling, API-route convention, how content is stored (markdown? data files? a DB?).
2. **Find what's already interactive/live.** Any existing demos, forms, chat, or generators. These are your templates — reuse their scaffolding, don't reinvent it.
3. **Map the content and the surfaces.** Routes/sections, the flagship offerings or products, the bodies of writing, and especially the **recurring named frameworks, vocabularies, casts-of-perspective, and failure-mode taxonomies** — those are the richest agent candidates.
4. **Then propose**, grounded in real paths.

## What to hand back

- **The reframe first:** "Here's what you already have that's secretly an agent (or half-built one)." Name it before proposing new builds.
- **Agent proposals, surface by surface** — each with: what the visitor inputs, what the agent does, what it returns, which existing file/content it's grounded in, which offering it routes to, and roughly how it reuses existing scaffolding. Group into *extend-what-exists*, *new content-as-agent builds*, and the *context/moat layer*.
- **The moat layer:** is there a body of work worth exposing as agent-addressable context (an `llms.txt`, a corpus manifest, an MCP endpoint, a free/paid context product)? Timestamped reasoning that predates the stampede is the uncopyable asset — say how to make it citable.
- **Where to start:** recommend ONE to prototype first, and say why (cheapest reuse of existing scaffolding × clearest outcome × clearest thing it sells). Offer to build it running in a local preview before anything ships.

Voice for the analysis: concrete, expansive, lateral. Don't flatten what's distinctive about the material into generic "AI features." Honor the asymmetry — these agents are *instruments I built*, disclosed as such, not colleagues with stakes.

---

## OPTIONAL HINTS (fill in or leave blank)

- **Repo / project is:** _(one line — what this site or project is)_
- **Flagship offerings to look at first:** _(named products, books, services, tools)_
- **Bodies of content / recurring frameworks I suspect are agent-ready:** _(names)_
- **Hard constraints:** _(stack/provider limits, things not to touch, budget)_
- **Anything off the table:** _()_
