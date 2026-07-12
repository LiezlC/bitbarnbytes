# AGENTS.md — working agreement for bitbarnbytes

_This is the shared, agent-neutral guide for **any** AI coding agent working in this repo — Claude, Codex, Gemini/Antigravity, Cursor, or whatever comes next. `CLAUDE.md` and `GEMINI.md` just point here. Read this first._

## ⛔ Never strand work in a branch. Land it where Liezl can actually see it.

Liezl works from the **main checkout** working tree (`C:/Users/Liezl/Documents/Github/bitbarnbytes`) and judges "done" by what she sees **on her drive** and on the **live site** (https://saraloosa.org). Work that only lives in an unmerged feature branch **does not exist to her and is not deployed.** Do not leave it there.

**Definition of done — all four, every time:**
1. **Committed** — nothing finished left uncommitted in the working tree.
2. **Pushed** — the branch is on `origin`.
3. **On `main`** — merged/fast-forwarded into `main`, which is the live/deployed branch. After committing: `git push origin HEAD:main` (fast-forward), or open **and merge** a PR — but don't stop at the branch.
4. **Verified** — for anything that deploys, fetch the real saraloosa.org URL (e.g. `curl`) and confirm the change is actually there before saying "done."

Do **not** report something as done until all four hold. If you deliberately leave something unmerged (a genuine draft), say so explicitly and say why.

**Continuity:** on start, run `python C:\Users\Liezl\.agents\agentops.py orient` (or read `C:\Users\Liezl\.agents\PORTFOLIO_RESUME.md`) to pick up where the last agent left off, and leave a handover on finish. Portfolio agent-ops system: `agent-command-center/docs/agent-ops/`.

## Branch & deploy reality (so you don't ship from a stale copy)
- **`main` is the source of truth for the live site, and pushing it DOES trigger deployment.** The Netlify site `bitbarnbytes` is hooked up to GitHub CI. Every push to the `main` branch automatically builds and deploys to production.
- **To actually ship after landing on `main`:** Simply push your merged changes to `origin main`. Wait a few minutes for the Netlify CI to finish the build, and then `curl` the real saraloosa.org URL to confirm the change is live (definition-of-done step 4). Do **NOT** run manual `netlify-cli` deploys unless the CI specifically fails.
- **`feat/soft-meter` is a shared, active integration branch** — multiple sessions/agents commit to it, and `main` is kept in sync via merges. It can drift **behind** `main` when fixes land via other branches. **Before editing any file, run `git diff HEAD origin/main -- <file>`** so you don't clobber newer `main` content or build on a stale base. (This exact drift stranded a dig-deeper edit once — don't repeat it.)
- **`wildroots/*` content is staged into the site at build** by `saraloosa-os/scripts/stage-*.mjs` (prebuild) → gitignored `public/`. Edit the **source** in `wildroots/` **and** the stage script; never commit `public/`.

## Hands off Liezl's WIP unless she says otherwise
She keeps large uncommitted working files — Gumroad product PDFs/zips, docs, source art. **Never commit, move, delete, or overwrite these** unless she explicitly asks, and show her the diff first. Local backup folders (`*.bak-*/`) are not for git.

## Secrets
Env-gated integrations (Gemini, Pinecone, Umami, Gumroad, Cloudinary, etc.) read keys from the **Netlify site env** (`bitbarnbytes`) and local gitignored `.env` files. Never commit secrets. Public IDs (e.g. the Umami `website-id`) are fine in client code.
