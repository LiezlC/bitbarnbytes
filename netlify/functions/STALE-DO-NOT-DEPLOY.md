# ⚠️ STALE — DO NOT DEPLOY / DO NOT EDIT

These standalone Netlify Functions (`ask.mjs`, `brew.mjs`) belong to the
**pre-Astro "Dig Deeper" path** and are **never deployed**: the repo-root
`netlify.toml` sets `base = "saraloosa-os"`, so the build root is the Astro app
and this `netlify/functions/` directory is outside it.

The **live** equivalents are Astro API routes:
`saraloosa-os/src/pages/api/{ask,boot,brew,plantpal}.ts`, backed by
`saraloosa-os/src/lib/*-core.mjs`.

Retained for reference only. See `../../lib/STALE-DO-NOT-DEPLOY.md` for the
full map. **Edit the Astro routes, not these files.**

_Signposted 2026-06-26 during the priority-next cleanup pass._
