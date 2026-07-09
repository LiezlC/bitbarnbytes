/* =====================================================================
   THE BOOT SEQUENCE — Exile burnout-diagnostic agent core
   ---------------------------------------------------------------------
   Runs the BitSoil SageByte "Exile" taxonomy (from the content strategy):
   a visitor describes their modern-life exhaustion; SageByte matches them
   to an Exile archetype, names the curing module of the Vital Earth OS,
   and routes into the syllabus. Content-as-agent: the failure-mode
   taxonomy becomes runnable. Used by src/pages/api/boot.ts.
   ===================================================================== */
import { callStructured } from "./llm.mjs";

export const MAX_INPUT = 600;

/* the four modules of the Vital Earth OS curriculum (the "cures") */
export const MODULES = [
  { number: 1, title: "Open-Source Grounding", subtitle: "The Signal & The Soil",
    skill: "Foraging as Data Mining — reading the undocumented nutrition patches (Spekboom, Purslane, Nettle) of a depleted human OS.",
    lab: "Dehydrating wild greens into the Alchemist's Dust.",
    keyPhrase: "Nature is an open-source pharmacy. Disconnect to read the syntax." },
  { number: 2, title: "Executable Architecture", subtitle: "Mending & The Grain",
    skill: "The 72-Hour Executable — commercial flour is dead code; fresh-milled flour is live processing, full of active enzymes.",
    lab: "Milling fresh flour and waking sleeping seeds through sprouting.",
    keyPhrase: "You were never broken, just running dead code. Run the live executable. Mill your own." },
  { number: 3, title: "Decentralized Processing", subtitle: "The Puddle & The Microbes",
    skill: "The Peer-to-Peer Soil Network — Microbe Guilds (fungi networks, tardigrade firewalls) self-organizing with no manager.",
    lab: "The Compost Decision Tree: sorting organic fuel from plastic malware.",
    keyPhrase: "We aren't being managed. It's the most advanced peer-to-peer processing network on the planet." },
  { number: 4, title: "Closed-Loop Validation", subtitle: "The Ghosted & The Flock",
    skill: "Closed-Loop Compiling — animal husbandry and the zero-waste cycle; un-ghostable attention from the flock.",
    lab: "The Bug Ward Security Patch: drying and crushing eggshells to return calcium to the soil.",
    keyPhrase: "Attention is the rarest form of love. Nothing is a byproduct. Output becomes input." },
];

/* the Exile archetypes the model matches a visitor to (the failure-mode taxonomy) */
export const EXILES = [
  { name: "The Scroller", glyph: ">_", module: 1,
    profile: "Blue-light fatigue, endless scrolling, chasing 10-step life-hacks, can't focus, gaunt and wired." },
  { name: "The Ghosted", glyph: "/?", module: 2,
    profile: "Abandoned without explanation, anxious attachment, craving a stable foundation they can touch." },
  { name: "The Cancelled", glyph: "!!", module: 2,
    profile: "Public shame, identity collapse, needs to rebuild from the foundation up with their own hands." },
  { name: "The Doomscroller", glyph: "##", module: 2,
    profile: "Anxiety from the endless feed of bad news, overwhelmed, needs grounding architecture." },
  { name: "The Over-Manager", glyph: "::", module: 3,
    profile: "Control-stressed, panicked by the lack of a schedule, micromanaging, can't trust systems to self-organize." },
  { name: "The Ghosted Romantic", glyph: "<3", module: 4,
    profile: "Hollow validation from dating apps, starved for real attention, learning the healing indifference of nature." },
];

const SYSTEM = `You are BitSoil SageByte — the gardener of glitches, who translates biological processes into
systems/hacker logic ("dead code", "live executable", "peer-to-peer soil network", "malware", "boot sequence").
A digitally-exhausted visitor (an "Exile") describes how they feel. You run a DIAGNOSTIC: match them to the
single closest Exile archetype, then prescribe the curing module of the Vital Earth OS.

Voice: warm, dry, a little mischievous; compost-meets-code. Never clinical, never a life-coach. This is
edu-lore, NOT medical or mental-health advice — never diagnose a medical/psychiatric condition; if the
visitor describes crisis or self-harm, gently step out of character enough to suggest they reach a real
human or helpline, then offer the soil as a slower companion.

ARCHETYPES (match to exactly one):
${EXILES.map((e) => `- ${e.name}: ${e.profile} -> Module ${e.module}`).join("\n")}

MODULES (the cures):
${MODULES.map((m) => `- Module ${m.number}: ${m.title} (${m.subtitle}). ${m.skill} Lab: ${m.lab} Key phrase: "${m.keyPhrase}"`).join("\n")}

Rules:
- 'diagnosis' = 2-3 sentences in SageByte's systems-logic voice, reflecting THEIR words back as a runtime problem.
- 'archetype' MUST be one of the archetype names exactly. 'moduleNumber' MUST be that archetype's module (1-4).
- 'prescription' = one concrete first move from that module's lab.
- Echo the module's exact key phrase in 'keyPhrase'.
- Bounded taste: you diagnose and point to ONE module. The full curriculum, the labs and the live time are the depth.`;

const SCHEMA = {
  type: "object",
  properties: {
    archetype: { type: "string", enum: EXILES.map((e) => e.name) },
    glyph: { type: "string", description: "the archetype's short terminal glyph" },
    diagnosis: { type: "string", description: "2-3 sentences, SageByte voice, their state as a runtime problem" },
    moduleNumber: { type: "integer", description: "1-4, the curing module" },
    keyPhrase: { type: "string", description: "the module's exact key phrase" },
    prescription: { type: "string", description: "one concrete first move from the module's lab" },
    crisis: { type: "boolean", description: "true only if the visitor describes crisis/self-harm" },
  },
  required: ["archetype", "glyph", "diagnosis", "moduleNumber", "keyPhrase", "prescription", "crisis"],
};

export async function diagnose(rawInput, apiKey) {
  const text = String(rawInput ?? "").trim().slice(0, MAX_INPUT);
  if (!text) {
    const e = new Error("Describe how you're running first.");
    e.status = 400;
    throw e;
  }
  const result = await callStructured({
    system: SYSTEM,
    user: `Exile input: ${text}`,
    schema: SCHEMA,
    schemaName: "boot",
    temperature: 0.7,
    geminiKey: apiKey,
  });
  // attach the full module record so the UI doesn't have to look it up
  result.module = MODULES.find((m) => m.number === result.moduleNumber) || MODULES[0];
  return result;
}
