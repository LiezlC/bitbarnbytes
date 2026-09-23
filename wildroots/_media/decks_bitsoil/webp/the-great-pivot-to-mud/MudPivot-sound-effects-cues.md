# MudPivot — separate sound-effects track

Align **MudPivot-sound-effects.wav** or **MudPivot-sound-effects.mp3** at **00:00** beside the finished `MudPivot-voiceover.mp3`. Use one effects file, not both. Duration: **17:24.500** of decoded audio. The MP3 container may report 17:24.528 because of encoder padding.

The track contains no narration. Gentle farm ambience, occasional animal calls, muddy Foley and short original electronic passages are already balanced and ducked against the finished narration. Start with both track faders at 0 dB; adjust the effects track to taste. Keep this file’s quiet level: do not independently normalise it to the voiceover’s loudness. If the narration timing changes, the baked-in volume dips will need updating.

## Files

- `MudPivot-sound-effects.wav`: stereo, 48 kHz, 24-bit PCM; local editing master. This approximately 301 MB file remains on disk because it exceeds GitHub’s ordinary single-file limit.
- `MudPivot-sound-effects.mp3`: stereo, 48 kHz, 256 kbps; smaller complete track, included in the repository.
- This cue sheet records the editorial intent and source provenance.

## Sound and balance

The farm begins at a distance, opens at the gate, shelters inside the barn and settles into dusk. Repeated ambience clips have two-second equal-power crossfades, slight level variation and scene-specific fades. The soil-listening scene deliberately approaches silence. Calls and splashes are placed sparsely, often just after a line or in a picture hold. Individual calls can extend softly under the next sentence.

The electronic arc moves from short dry interface clicks to a small power-down at the portal, then brief rhythmic passages. The main groove begins at 13:20.4 after the hoof finds the drum, runs at exactly 122 BPM and fades into the grid scene. Its clearest opening is the narration gap around 13:39.5–13:44.5. There is no ongoing music bed.

A 50 ms look-ahead speech envelope reduces ambience and Foley by up to 8 dB and beats by up to 10 dB, with a gentle 450 ms release. Natural effects have a broad presence reduction around 2.6 kHz to leave room for consonants; the beat uses a restrained kick and soft hats. Foley positions remain within a moderate stereo spread. The narrator audio is used only to calculate this volume automation.

## Source provenance

Eighteen custom sound-effect assets were generated with ElevenLabs Sound Effects through the user’s existing Magica account on 23 September 2026: open field, barn, dusk, rooster, hens, adult goat, kid goat, puppy, horse breath, pig, mud steps, mud plop, mud splash, hedge rush, gate latch, hoof, paper chewing and mallet. These are synthetic effects, not documentary field recordings. Prompts requested natural sounds with no speech or music.

Interface sounds and 122 BPM rhythm passages are original local synthesis; no commercial songs or recognisable notification melodies were sampled. Local production records, source assets, generation prompts and service responses are in `soundscape-production/`; credentials and private service records are excluded from Git.

## Verification

- All 18 source assets decoded successfully; 73 ambience/effect/music cues were assembled.
- Uncompressed master: 1044.500 seconds, stereo 48 kHz / 24-bit. Sample peak: -18.0 dBFS; RMS: -45.0 dBFS.
- Independent MP3 measurement: -40.8 LUFS integrated, 11.1 LU loudness range, -18.0 dBTP true peak. Both WAV and MP3 decode without errors.
- WAV SHA-256: `bd8f17fa84688f7b8db0a7da13f77463a18bd166aec5657d375d2c4a5319afc5`.
- In one-second windows with narrator RMS above -30 dBFS, the narrator exceeds the effects by a median 28.5 dB; the fifth-percentile margin is 19.6 dB.
- Audio timing and level checks are objective checks; final subjective balance should be judged on the listener’s speakers or headphones.
- The existing narration and draft MP4 are unchanged.

## Timed cues

Times below mark the start of each edited clip. Generation can include a small amount of natural lead-in; the marked time is not a claim of frame-perfect visual contact. Ambience entries describe scene-shaped layers across the full duration.

| Start | End | Scene | Sound | Purpose |
|---|---|---|---|---|
| 00:00.0 | 17:24.5 | 01 | Open field: breeze, leaves and distant birds | Continuous scene-shaped bed; fades between open field, sheltered barn and dusk. |
| 00:00.0 | 17:24.5 | 01 | Sheltered barn: straw and quiet timber | Continuous scene-shaped bed; fades between open field, sheltered barn and dusk. |
| 00:00.0 | 17:24.5 | 01 | Dusk: delicate insects and evening air | Continuous scene-shaped bed; fades between open field, sheltered barn and dusk. |
| 00:01.9 | 00:02.0 | 01 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 00:09.1 | 00:09.2 | 01 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 00:13.8 | 00:13.9 | 01 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 00:17.0 | 00:17.5 | 01 | Electronic chime | Brief interface punctuation; no stock notification melody. |
| 00:24.6 | 00:24.7 | 02 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 00:33.7 | 00:33.8 | 02 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 00:35.5 | 00:36.0 | 02 | Electronic chime | Brief interface punctuation; no stock notification melody. |
| 00:48.5 | 00:48.6 | 03 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 00:52.6 | 00:53.1 | 03 | Electronic chime | Brief interface punctuation; no stock notification melody. |
| 00:58.1 | 00:59.9 | 03 | Paper chew | The goat chews the guarantee. |
| 01:04.5 | 01:07.9 | 04 | Rooster | A distant arrival at the farm; never a morning alarm beside the listener. |
| 01:10.5 | 01:14.5 | 04 | Hens | Chickens patrol the uncorrected sunset. |
| 01:14.3 | 01:14.4 | 04 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 01:50.7 | 01:53.2 | 05 | Mud steps | A little weight behind SageByte’s muddy boots. |
| 02:38.5 | 02:40.1 | 07 | Paper chew | The networking event finally has nutritional value. |
| 02:47.2 | 02:47.3 | 08 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 02:53.0 | 02:53.1 | 08 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 03:01.4 | 03:01.9 | 08 | Electronic chime | Brief interface punctuation; no stock notification melody. |
| 03:13.2 | 03:15.0 | 08 | Goat | A small reply in the picture hold after the goat org chart. |
| 03:19.8 | 03:21.4 | 09 | Mud plop | The pig lowers itself into the earth. |
| 03:25.0 | 03:26.5 | 09 | Pig | Satisfied punctuation after “Highly recommended”. |
| 03:46.2 | 03:48.2 | 10 | Paper chew | The form about the other forms. |
| 03:50.5 | 03:50.6 | 10 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 03:56.8 | 03:58.6 | 10 | Mud plop | The wet, authoritative silence gets one soft full stop. |
| 04:19.1 | 04:21.4 | 11 | Horse | A relaxed pony breath after both animals arrive. |
| 04:37.4 | 04:41.0 | 12 | Hedge rustle | The dogs break through the hedge. |
| 04:44.5 | 04:46.5 | 12 | Puppy | The roadmap request receives a happy canine answer. |
| 05:04.9 | 05:06.1 | 13 | Goat | A brief natural bleat after the spoken “I’m HERE!”. |
| 05:08.8 | 05:08.9 | 13 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 05:14.1 | 05:14.2 | 13 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 05:15.8 | 05:15.9 | 13 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 05:40.2 | 05:42.0 | 14 | Goat | The magnificent bleat crosses the sky; softens immediately under the next words. |
| 06:09.5 | 06:11.1 | 15 | Puppy | The tiny puppy answers the horse’s wolf-sized observation. |
| 06:47.7 | 06:49.7 | 16 | Horse | A patient breath after ambition forgets to budget for satisfaction. |
| 07:02.8 | 07:02.9 | 17 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 07:31.5 | 07:33.2 | 18 | Gate latch | The boundary opens, directly after “She lifts the latch”. |
| 08:09.3 | 08:11.1 | 19 | Puppy | A distant happy dog in the picture hold after the belly-in-the-sun passage. |
| 08:17.0 | 08:17.1 | 20 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 08:42.0 | 08:43.5 | 20 | Pig | A tiny consultant’s snuffle at the dashboard scene’s end. |
| 08:46.0 | 08:46.1 | 21 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 08:52.1 | 08:54.7 | 21 | Mud splash | A liquid asset with practical applications. |
| 09:16.0 | 09:16.1 | 22 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 09:17.2 | 09:17.7 | 22 | Electronic chime | Brief interface punctuation; no stock notification melody. |
| 09:28.9 | 09:33.9 | 22 | Hens | Grain disappears into small purposeful lives. |
| 09:46.4 | 09:50.0 | 22 | Rooster | A far-off farm call in the corn scene’s spacious ending. |
| 10:02.2 | 10:03.6 | 23 | Pig | The pig’s eyebrow gets a small sceptical snuffle. |
| 10:19.9 | 10:20.9 | 24 | Hoof | A hoof, not an interface designer, operates the keyboard. |
| 10:20.2 | 10:20.3 | 24 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 10:24.1 | 10:24.2 | 24 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 10:45.0 | 10:46.7 | 25 | Mallet | The portal meets the ground: blunt, small and physical. |
| 10:46.8 | 10:47.5 | 25 | Electronic powerdown | Brief interface punctuation; no stock notification melody. |
| 10:47.0 | 10:54.9 | 25 | 122 BPM soft techno / wooden-percussion pulse | A brief electronic pulse breaks apart after the portal falls; withdraw before the tender explanation. |
| 11:06.0 | 11:08.7 | 26 | Mud steps | Hands enter the mud; a sticky tactile close-up. |
| 11:17.7 | 11:19.0 | 26 | Hens | A tiny cluck after the chicken’s podcast punchline. |
| 11:32.3 | 11:40.2 | 26 | 122 BPM soft techno / wooden-percussion pulse | A short physical pulse emerges as ordinary hands begin living; clear before the next scene. |
| 11:48.9 | 11:50.4 | 27 | Mud plop | The bulldog falls: one comic splat, then room for the reassurance. |
| 12:02.2 | 12:04.0 | 27 | Puppy | The dog recovers during the picture hold. |
| 12:11.2 | 12:14.5 | 28 | Mud splash | Hooves and paws enter the shared mud. |
| 12:19.0 | 12:22.7 | 28 | Mud splash | The unusable group photograph acquires another splash. |
| 12:39.9 | 12:41.4 | 29 | Paper chew | Eligibility criteria become a snack. |
| 12:52.0 | 12:53.6 | 29 | Kid goat | A gentle companion in the pause before listening to the soil. |
| 13:05.0 | 13:06.1 | 30 | Hedge rustle | A very small soil-level rustle; this scene is deliberately almost silent. |
| 13:20.4 | 13:21.4 | 31 | Hoof | The hoof finds the drum and starts the 122 BPM passage. |
| 13:20.4 | 13:51.9 | 31 | 122 BPM soft techno / wooden-percussion pulse | The hoof starts the actual 122 BPM passage. Music rises only in narration gaps and fades into the spiralling grid. |
| 13:52.4 | 13:53.8 | 32 | Pig | Horizontal expertise has a contented grunt. |
| 14:16.0 | 14:16.1 | 33 | Electronic click | Brief interface punctuation; no stock notification melody. |
| 14:33.2 | 14:36.7 | 34 | Hens | Chickens peck while the arrows scatter. |
| 15:08.0 | 15:10.2 | 35 | Horse | A soft sleepy exhale after “Soon”. |
| 16:24.6 | 16:26.1 | 38 | Kid goat | A tiny bleat before settling to the bottle. |
| 17:21.0 | 17:23.6 | 39 | Mud steps | Two quiet departing steps under the coat-and-evening invitation. |

## Handover — 23 September 2026

Created as the user-requested separate sound-effects stem for the completed MudPivot narration. No source video was changed and no new voiceover was generated. The local builder is `rewrite-review-2026-09-22/build-soundscape.py`; it reuses cached source effects and rebuilds locally without making generation requests. Keep the WAV as the editing master and the MP3 as the portable repository copy.
