I’ll audit the working directory as it exists locally (including gitignored/untracked files) and produce a prioritized SWOT-style ranking.

[5 tools called]

Windows shell here lacks Unix utils. I’ll use PowerShell/cmd alternatives and Verdent tools for the sweep.

[4 tools called]

The root has no untracked files and a clean working tree. I now need to include gitignored content and map the directory tree.

[3 tools called]

There are ~92,354 filesystem items (~82,762 files, ~1.34 GB). `glob` with `**/*` timed out or hit limits, so I’ll sample top-level directories and recurse selectively with PowerShell.

[3 tools called]

I now need per-directory sizes and key metadata, plus a look at potential secrets/env files.

[3 tools called]

No raw credential files found outside node_modules. I see a `.env.example` and `node_modules` duplicates. Let me inspect key config/metadata files and gitignore.

[8 tools called]

The .env.example is restricted, which is fine. I see a Claude worktree with a near-duplicate of the entire repo (~464 MB). That is a major duplication/space issue. Let me inspect the .tools, scripts, lib, _internal, and duplicate patterns.

[4 tools called]

Good data. I see dist/ duplicates of wildroots assets inside saraloosa-os, node_modules bloat, and the .claude worktree duplicating everything. Let me check for duplicate files across the repo and inspect the README / top-level docs.

[4 tools called]

I see the project now: an Astro/Netlify site (`saraloosa-os`) plus Wildroots content and a Claude worktree. There is significant duplication. Let me inspect the CI workflow and key source/config files to understand build/deploy health.

[4 tools called]

Now I need to understand the duplication with root-level `lib/` and `scripts/` vs `saraloosa-os/src/lib/`. Also inspect `.claude` worktree size and whether it’s an actual git worktree or a copy.

[4 tools called]

The `.claude/worktrees/tender-golick-46a46f` is a legitimate git worktree on branch `claude/tender-golick-46a46f` (commit ef7eb0f), not a copy. It contains ~29,500 files / 464 MB. That is a normal Git worktree, not bloat per se, but it doubles node_modules and build artifacts locally. Now let me look at `dist` duplicates and the `wildroots` vs `public/dig-deeper` duplication.

[3 tools called]

I now need to check if `saraloosa-os/public/dig-deeper` is gitignored (likely yes) and whether `dist/` is also gitignored. Also inspect the staging script and duplicate logic.

[4 tools called]

I have a good picture now. Let me also check for stale branches, git objects, and whether there are very large or old git objects.

[3 tools called]

The git rev-list parsing failed because of spaces in filenames, but I got the top hashes. The git objects are 163 MB (unpacked). That’s moderate. I now have enough data to compile the SWOT-based ranking. Let me also inspect a couple key code files to assess code health, and check for outdated dependencies or known issues.

[4 tools called]

I have enough data. Let me also quickly check the root-level `lib/` and `scripts/` for staleness vs `saraloosa-os/src/lib/`, since they appear duplicated.

[4 tools called]

Root `lib/` cores differ from `saraloosa-os/src/lib/` cores; `corpus.json` is identical. This means the standalone Dig Deeper path (root `lib/` + `netlify/functions/`) is stale relative to the Astro path. Good finding. Let me check the standalone `netlify/functions/` vs Astro API routes too.

[3 tools called]

I now have a complete picture. Let me update the todo and produce the final SWOT-based file ranking.

[1 tool called]

## bitbarnbytes local-drive sweep — SWOT-based file attention ranking

Scope: full working tree including gitignored content (`node_modules`, `dist`, `.claude` worktree, `_media`, `.tools`, etc.).  
Stats: ~92,354 filesystem items / ~82,762 files / ~1.34 GB.

### Executive SWOT

| Strengths | Weaknesses |
|---|---|
| Single deploy target (`saraloosa-os`) with clean Astro + Netlify adapter. | Local disk is ~3× the git-tracked payload because of duplicate `node_modules`, worktree, build output, and staged assets. |
| Smart staging script keeps PDF source-of-truth in `wildroots/` only. | Two divergent agent-core codebases: root `lib/` vs `saraloosa-os/src/lib/`. |
| `llms.txt`, corpus pipeline, and agent-addressable moat layer exist. | Hard-coded Windows path in `llm.mjs` (`C:/Users/Liezl/.../.env.local`). |
| CI uses `npm ci`, Node 22, scoped paths. | `dist/` and `public/dig-deeper/` are committed/present locally despite being gitignored. |
| No raw credential files found outside `node_modules`. | `.env.example` is access-restricted; env vars required at runtime are not documented locally. |

| Opportunities | Threats |
|---|---|
| Remove or consolidate stale standalone `netlify/functions/` and root `lib/` into the Astro path. | Stale standalone functions could be redeployed accidentally and serve older agent behavior. |
| Add `.gitignore` cleanup for `dist/`, `.netlify/`, `.astro/` in the worktree too. | Git repo is 163 MB unpacked; large binaries (PDFs, WASM, DLLs) in history could bloat clones. |
| Deduplicate staged assets, optimize media, and move large PDFs to CDN/Cloudinary (already a dependency). | Hard-coded key path and `import.meta.env` reliance create local dev friction and potential key leakage in traces. |

---

### Ranked attention list

**P0 — address first (risk or quick win)**

| # | Item | Why it matters | Concrete next step |
|---|---|---|---|
| 1 | `saraloosa-os/src/lib/llm.mjs` | Hard-coded absolute Windows path to `gem-voice/.env.local` at line 26; breaks any other machine and is a leakage/trace risk. | Replace with a `.env` loader or `process.env` only; remove the cross-repo path fallback. |
| 2 | Root `lib/` + `netlify/functions/` | These are the **old** standalone Dig Deeper path. Hashes show `brew-core.mjs` and `oracle-core.mjs` differ from `saraloosa-os/src/lib/`, while `corpus.json` matches. Keeping them risks deploying stale behavior. | Either delete them and rely solely on `saraloosa-os/src/pages/api/*`, or symlink/copy-and-sync them from the Astro path. Update `WILDROOTS_AGENTS.md` accordingly. |
| 3 | `saraloosa-os/dist/` + `saraloosa-os/public/dig-deeper/` | `dist/` is 20.38 MB and `public/dig-deeper/` is 18.26 MB despite being gitignored. They are present locally, which suggests they were committed before ignore rules were added or were built locally and left. | Run `git rm -r --cached saraloosa-os/dist saraloosa-os/public/dig-deeper` if tracked, otherwise add a cleanup script and ensure CI/build artifacts are not in the repo. |
| 4 | `.claude/worktrees/tender-golick-46a46f/` | Legitimate Git worktree, but it duplicates the entire repo including its own `node_modules` (324 MB) and `dist/`. | Decide if the branch is still active. If merged/stale, run `git worktree remove .claude/worktrees/tender-golick-46a46f` and delete the remote branch; if still needed, add per-worktree `.gitignore` for build/dependency dirs. |

**P1 — high impact / medium urgency**

| # | Item | Why it matters | Concrete next step |
|---|---|---|---|
| 5 | `wildroots/_media/` (37 MB decks + 33 MB previews) | Gitignored but sits on disk; large raw PDF/PNG deck sources inflate local storage and are not shipped. | Move canonical masters to external/Cold storage or Cloudinary (already integrated); keep only web-optimized previews in repo, or document the archive policy. |
| 6 | `wildroots/gumroad-uploads/*.zip` | 30 MB of paid-product bundles sitting locally; duplication with watermark-covered variants. | Keep only manifest/slug map in repo; move ZIPs to Gumroad/cloud storage. Add a build-time fetch if needed. |
| 7 | `.tools/pdf-tools/node_modules/` + `.tools/npm-cache/` | ~90 MB of helper tooling cached locally; not tracked but adds local bloat. | If `.tools/` is meant to be portable, document dependencies; otherwise remove `node_modules` and cache and rely on global/tool-based installs. |
| 8 | `saraloosa-os/src/pages/api/ask.ts` | Imports `resolveKey` from `boot-core.mjs` for the Oracle, which is a naming/code-organization smell (cross-agent dependency). | Rename/consolidate key resolution into `llm.mjs` or a shared `env.mjs`; remove `@ts-ignore` and `@ts-expect-error` suppressions by adding minimal type declarations. |
| 9 | `saraloosa-os/src/lib/langfuse.mjs` | Observability is env-gated, but there is no local fallback documentation; if env is missing it should gracefully no-op. | Verify graceful no-op behavior and document required env vars in `saraloosa-os/.env.example` (currently unreadable due to access policy). |

**P2 — polish and optimization**

| # | Item | Why it matters | Concrete next step |
|---|---|---|---|
| 10 | `wildroots/dig-deeper/index.html` vs `saraloosa-os/public/dig-deeper/index.html` | The standalone page is the source; Astro staging rewrites paths. The two can drift. | Consider turning the Dig Deeper page into an Astro route/component so it can use the same layout/SEO/JSON-LD instead of a copied static file. |
| 11 | `saraloosa-os/src/content/` (curriculum, field-notes, lore) | Only a few markdown files; rich content lives in `wildroots/` outside Astro content collections. | Migrate high-value content into `src/content/` with schemas in `content.config.ts` to unlock typed queries and better SEO. |
| 12 | `.github/workflows/ci.yml` | CI only runs on PR; no scheduled dependency/security audit. | Add `npm audit` step or Dependabot; consider a periodic CI run to catch upstream breakages. |
| 13 | `saraloosa-os/package.json` dependencies | Heavy deps: `@opentelemetry/sdk-node`, `@langfuse/otel`, `@pinecone-database/pinecone`, `cloudinary`. | Review which are actually used at runtime vs build time; tree-shake or move dev-only deps. |
| 14 | Git object store (163 MB unpacked, no packfile) | Repository clone will be slower than necessary. | Run `git gc --aggressive` and push packed refs/objects; consider `git lfs` for PDF/WASM/DLL history if media must stay in repo. |
| 15 | `_internal/` | Empty except for `README.txt`; safe, but indicates a dumping ground. | Either use it for local scratch with a clear retention rule or remove if unused. |

---

### Recommended order of attack

1. **Fix the hard-coded path** in `llm.mjs` — one-line change, high portability/security payoff.  
2. **Remove or reconcile the stale standalone `netlify/functions/` and root `lib/`** with the Astro path to end the two-truth problem.  
3. **Purge `dist/` and `public/dig-deeper/`** from the index if still tracked, and add a pre-commit check.  
4. **Clean up the Claude worktree** if its branch is no longer active.  
5. **Offload large media/ZIPs** to Cloudinary/Gumroad storage and reclaim ~200 MB locally.  

Would you like me to start executing any of these (beginning with the `llm.mjs` env path fix and stale-file cleanup), or produce a detailed cleanup script first?