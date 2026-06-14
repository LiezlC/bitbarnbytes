"""Assemble the public deploy bundle for the Dig Deeper experience.

Copies ONLY the assets referenced by dig-deeper/index.html into wildroots/_deploy/,
with index.html at the bundle root and all ../ asset paths rewritten to ./.
Everything else in wildroots (strategy drafts, unwatermarked originals, tables,
backups, scripts, audits) stays private by construction.

Usage:  python scripts/build-deploy.py    (run from the wildroots folder)
Deploy: point any static host at wildroots/_deploy/ (or drag-drop it).
"""
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent          # wildroots/
SRC_HTML = ROOT / "dig-deeper" / "index.html"
DEPLOY = ROOT / "_deploy"

html = SRC_HTML.read_text(encoding="utf-8")

# every quoted relative path to a content asset mentioned anywhere in the page
refs = set(re.findall(r'"([^"]+?\.(?:md|pdf|webp|png))"', html))
refs = {r.lstrip("./").lstrip("../").lstrip("/") for r in refs if not r.startswith("http")}

if DEPLOY.exists():
    shutil.rmtree(DEPLOY)
DEPLOY.mkdir()

copied, missing, total = [], [], 0
for rel in sorted(refs):
    src = ROOT / rel
    if not src.exists():
        # bare filenames whose folder is prefixed at runtime (e.g. "infogs/"+f)
        hits = [p for p in ROOT.rglob(Path(rel).name)
                if "_deploy" not in p.parts and "watermark-covered" not in p.parts or rel.startswith("watermark-covered")]
        if hits:
            src = hits[0]
            rel = src.relative_to(ROOT).as_posix()
        else:
            missing.append(rel)
            continue
    dst = DEPLOY / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)
    copied.append(rel)
    total += src.stat().st_size

# the page itself, served from the bundle root with ../ rewritten to ./
(DEPLOY / "index.html").write_text(html.replace('"../', '"./').replace("'../", "'./"), encoding="utf-8")

print(f"deploy bundle: {DEPLOY}")
print(f"  {len(copied)} assets, {total/1024/1024:.1f} MB + index.html")
for m in missing:
    print(f"  MISSING (link will 404): {m}", file=sys.stderr)
sys.exit(1 if missing else 0)
