# ⚠️ STALE — DO NOT DEPLOY / DO NOT EDIT

These files (`lib/*.mjs` + the sibling `netlify/functions/*.mjs`) are the
**pre-Astro standalone "Dig Deeper" path**. They are **not built and not
deployed**: the repo-root `netlify.toml` sets `base = "saraloosa-os"`, so
Netlify only ever builds from the Astro app and never sees this root `lib/`
or `netlify/functions/`.

## The live agent code lives in `saraloosa-os/src/`

| Concern | Live (edit here)                                   | Stale (this folder)        |
|---------|----------------------------------------------------|----------------------------|
| Cores   | `saraloosa-os/src/lib/*-core.mjs`, `llm.mjs`       | `lib/*-core.mjs`           |
| Routes  | `saraloosa-os/src/pages/api/{ask,boot,brew,plantpal}.ts` | `netlify/functions/*.mjs` |

These root copies have **drifted** from the live versions (`oracle-core.mjs`
differs; only `corpus.json` still matches). They are retained for historical
reference only — deleting them is safe (recoverable from git history).

**If you're changing agent behavior, edit `saraloosa-os/src/…`, not these files.**

_Signposted 2026-06-26 during the priority-next cleanup pass._
