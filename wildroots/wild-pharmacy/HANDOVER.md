# Wild Pharmacy — Build Handover (for the next Claude)

> Continuation of a long build session. Read this first to pick up cleanly.
> Owner: Liezl Coetzee. The Wild Pharmacy is a playable compost-punk Labyrinth RPG, a wing of the BitSoil world.
> The page lives at `wildroots/wild-pharmacy/index.html` (self-contained), served standalone at `http://localhost:8123` and staged into the Astro site at `/wild-pharmacy/`.

## What is built and verified (DONE)

A complete, playable RPG in one self-contained `index.html`:
- 13-hour clock with a real lose state; branching maze map (gate to the 13 stations to the cauldron heart; the cauldron unlocks once the cabinet holds 8 tinctures).
- Per-station 3-rung challenge over the plant's video clip: the riddle-door (identify the plant by its tell), the bridge with Sir Didymus (choose the right part), the stair-stack (choose the preparation). A wrong pick rouses the minotaur, which shows that plant's real caution and costs an hour. Stellar Sage and OraCular give hints for an hour each. Solving earns the tincture into the cabinet. Win by banking 8 and reaching the cauldron before hour 13; lose when it strikes 13.
- Lore guides: a "? what is this" learn-button per rung explains the mechanic and the real craft (identification, harvesting, extraction) plus a titbit. Free; separate from the paid companion hints.
- Plant almanac: a "field notes on this plant" button per station opens the full Index profile (uses, actives, grow, wildroots note, cautions, clickable sources) with a browser-TTS "hear it" read-aloud.
- Panel placement: the challenge card sits in a fixed corner tuned per station (`POS` map in the script, from a visual analysis of each scene) so it dodges that plant's identifying marker. Drag code is also present (live nudge of `#playbox` by its header).
- Backdrops: the plant's Grok clip plays behind everything; the rung's mechanic scene (nim images: riddle-door / sir-didymus / stair-stack) shows as a banner inside the card.
- Sound: procedural Web Audio SFX (collect chime, minotaur groan, page-turn, travel tick, win/lose) plus a `♪` mute toggle (persisted). An audio companion play button on the map streams the NLM narration.

Verify behaviour with `preview_eval` (DOM checks) and `preview_console_logs`. The preview SCREENSHOT renderer hangs constantly (harness issue) — do not rely on it; use DOM eval instead.

## Assets (all under `wildroots/wild-pharmacy/`)

- `slides/` — `slide_01.webp`..`slide_26.webp` (stills) and `01.mp4`..`26.mp4` (Grok clips). 26 scenes: 1 world, 2-5 maze landmarks, 6 cauldron, 7-10 cast (Hexi, goat familiar, Stellar Sage, OraCular), 11-23 = stations 01-13, 24 minotaur, 25 feather-seekers, 26 thesis. These ARE the gorgeous dark compost-punk look.
- `scenes/` — `riddle-door.jpg`, `sir-didymus.jpg`, `stair-stack.jpg`. nim Seedream 4.5 image gen. These DID match the dark grimoire aesthetic (the rung banners).
- `stations.json` — the 13 hero plants' real data, exported from `wildroots/Apothecary_Index.xlsx`. The truth source for the almanac and the challenge answers.
- `audio/` — `WildPharmacy_companion.mp3` (old two-host podcast, SUPERSEDED), `WildPharmacy_narration.mp3` (heritage single-narrator, still says "South African", SUPERSEDED), `WildPharmacy_narration_anime.mp3` (CURRENT companion: de-claimed framing, voice Liezl likes).
- `video/` — `WildPharmacy_overview.mp4` (heritage), `WildPharmacy_overview_anime.mp4` (anime). Source for the audio + frames.
- `frames/` (heritage kawaii slides) and `frames_anime/` (light botanical, 29 stills). NEITHER matches the dark RPG; do NOT use as backdrops. See task 3.

## Hard-won learnings / gotchas

- NLM video overviews render LIGHT, cute, educational illustration no matter the prompt: heritage gave kawaii mascot slides, anime gave pale white-background botanical line-art. Dark "grimoire" pointers in the prompt do NOT override NLM's house style. So NLM video is NOT a source of dark app art. Its value is the single-narrator AUDIO (and a transcript). Dark app art is the nim (Seedream) route, which delivered.
- NLM CLI prompts must contain NO embedded double-quotes. PowerShell splits the argument and the CLI errors with "unexpected extra arguments". Keep generation prompts quote-free (use parentheses, not quotes, for examples).
- The blanket "South African medicinal plants" framing came from the generation PROMPT wording (now removed), not from any source file. Of the 13: 10 are SA-native; gotu kola is Asian, rosemary Mediterranean, wormwood hedged (A. absinthium European vs native A. afra). For the 13, do NOT claim them collectively South African.
- NLM narrator voice ALTERNATES between renders (per Liezl). To flip gender, just re-render. Guaranteed fallback for a specific voice: re-voice the transcript through a TTS voice tool.
- Liezl's voice rules: no em-dashes in her-voice / outgoing content; educational, never medical advice; conservation-positive; never fabricate source URLs (use the real ones in the Index).

## NotebookLM access (Windows)

- venv + auth at `~/.notebooklm` (`browser_profile_v2`). Re-auth by launching Chrome via PowerShell `Start-Process` with `--remote-debugging-port=9222 --remote-allow-origins=*` on that profile, then extract cookies via CDP (the working PS block is in the session's scratchpad logs `nlm_*.log`). Sessions expire fast; relaunch as needed. Keep Chrome open during CLI calls.
- Notebook: `301a0e5b-07ed-4d40-aa9a-d5f9f09ceabf` ("Wild Pharmacy - Labyrinth (BitSoil)"). Selected source ids for generations: spec `9805c817-c3d8-4d2f-ae0d-0ac6ea12f9fa`, handover `3c91de3b-ca2f-4af4-bd74-43c406bb4a39`, Living Pharmacy `4c8e1d8b-8e61-4442-8646-86afee499f39`.
- See memory `nlm-slidedeck-technique` for the deck method; this build extends it to video + audio.

## Tooling available

- ffmpeg 7.1.1 + ffprobe (Bash). PyMuPDF (fitz), Pillow, openpyxl (system `python`). NO whisper installed.
- Frame extraction: scene-detect (`select='gt(scene,0.3)'`) works for slideshow-style (heritage); the anime video animates within scenes so use interval sampling instead (`fps=1/22`).
- Staging: `saraloosa-os/scripts/stage-wildpharmacy.mjs` copies `index.html, stations.json, slides, scenes, audio` to `public/wild-pharmacy/` (gitignored, regenerated at predev/prebuild). Homepage card added in `saraloosa-os/src/pages/index.astro`. The mjs + astro edits are in the MAIN repo working copy.
- Preview: `.claude/launch.json` has a `wild-pharmacy` config (python http.server 8123, `--directory wildroots/wild-pharmacy`).
- Spec: `docs/superpowers/specs/2026-06-28-wild-pharmacy-labyrinth-design.md`.

## PENDING / next tasks

1. **Confirm the companion audio** — Liezl to judge the new `WildPharmacy_narration_anime.mp3` (voice gender + that the de-claim landed). If she wants a different voice, re-render (alternation) or re-voice the transcript via a female TTS.
2. **Transcript** of the narration — not done (no whisper). Routes: install `faster-whisper` + transcribe the mp3, OR generate an NLM text report of the same content, OR skip.
3. **Mine the light frames for small assets** (Liezl's request) — crop individual plant specimens, the goat, and decorative botanicals out of `frames_anime/` into TOKENS / icons / small visual assets for the evolving gameverse. They are clean line-art on white, good for small cutouts, not for backdrops. `frames_anime/frame_005.png` is a tidy "Learning Loop" (identify -> harvest -> extract -> concoct) diagram usable on a help / how-to screen.
4. **Commit** the whole build (page, spec, stations.json, scenes, audio, stage wiring). Liezl has repeatedly deferred; offer and do it on her explicit go. Decide branch (worktree `claude/nice-germain-363248` vs main repo) and whether the heavy `slides/` clips are gitignored (Cloudinary plan) or committed.
5. **Cloudinary** — host the ~66 MB of clips and stream them for a lean Netlify deploy (planned, not done). `cloudinary` is already a dependency.
6. **Polish list** (offered, not done): a door-opening flourish on a correct identify; true clickable-scene hotspots (needs purpose-built scenes); matching nim scenes for the gate / cauldron / map backdrop.
7. **Expanded version** (Liezl's direction): grow beyond 13 to more healing herbs from the Index; structure the larger labyrinth by ORIGIN (indigenous-to-SA etc.) AND by EFFECT-PATH (focus / relax / immunity-respiratory / digestive ease) as branching "hallways". The current 13 stays de-claimed; the expansion is where the origin/effect framing lives.

## Working style

Liezl works in portfolio, not single-focus: offer state-indexed task menus rather than "pick one lane". She is visual-first (show, do not tell): verify by running and surface the result, never ask her to check manually. No em-dashes in her-voice or outgoing copy (also avoid the "Not X. Y." antithesis and rule-of-three triplets). Existing memories worth reading: `wild-pharmacy-labyrinth`, `nlm-slidedeck-technique`, `bitbarnbytes-overview`, `bitbarnbytes-agentification`.
