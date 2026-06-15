/* =====================================================================
   build-arcade — stage external HTML game applets into the Barnyard Arcade
   ---------------------------------------------------------------------
   Reads each game's self-contained index.html + background image from a
   source bundle (outside the repo), then for each game:
     • converts background.(png|jpg) -> tiny background.webp, rewrites the ref
     • injects a CONSISTENT instruction overlay (objective + how-to + controls
       + a persistent ❓ help button + a "← Arcade" back link)
     • emits a thumbnail webp for the arcade hub
   Output (committed, since Netlify can't see the external source bundle):
     saraloosa-os/public/arcade/<slug>/index.html + background.webp
     saraloosa-os/public/img/arcade/<slug>.webp

   Run:  node wildroots/scripts/build-arcade.mjs ["<source-bundle-dir>"]
   Add a new applet later: drop an entry in GAMES below and re-run.
   ===================================================================== */
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const repoRoot = path.resolve(new URL("../..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const require = createRequire(import.meta.url);
const TOOLS = [
  path.join(repoRoot, ".tools/pdf-tools/node_modules"),
  "C:/Users/Liezl/Documents/Github/bitbarnbytes/.tools/pdf-tools/node_modules",
].find((p) => existsSync(p)) || path.join(repoRoot, ".tools/pdf-tools/node_modules");
const { createCanvas, loadImage } = require(path.join(TOOLS, "@napi-rs/canvas"));

const SRC_BASE = process.argv[2] ||
  "C:/Users/Liezl/Documents/Github/Playa/extracted/art-mindfulness-gumroad-bundle/farming-sim";
const OUT = path.join(repoRoot, "saraloosa-os", "public", "arcade");
const THUMBS = path.join(repoRoot, "saraloosa-os", "public", "img", "arcade");

/* ---- the applets + their (now blatantly clear) instructions ---- */
const GAMES = [
  {
    slug: "bitsoil-farm", dir: "bitsoil-farm-the-digital-detox",
    title: "BitSoil Farm", emoji: "🚜",
    tagline: "The Digital Detox — turn digital noise into fertile soil.",
    objective: "Drain your Digital Stress to 0% while growing Fertile Soil to 100% — each milestone unlocks a chapter of the Scroller's story.",
    how: [
      "Click the floating <b>digital noise</b> (words & 📱💬🔥 icons) to compost it into soil and growing plants.",
      "Click passing <b>animals</b> (🐐 🐕 🐓) for a bonus hit of stress relief.",
      "Read each story card that unlocks, then keep composting.",
    ],
    controls: "Click / tap · ⏸ pauses",
  },
  {
    slug: "cyber-pastoral", dir: "cyber-pastoral-farm-interface",
    title: "Cyber-Pastoral", emoji: "🌿",
    tagline: "A solarpunk homestead interface.",
    objective: "Grow a self-sufficient solarpunk homestead by harvesting three resources: ⚡ Energy, 🧬 Bio and 💾 Data.",
    how: [
      "Click the <b>resource nodes</b> — solar panels, 🌲 trees and 💻 terminals — as they activate to collect ⚡ / 🧬 / 💾.",
      "Watch the <b>system console</b> for prompts on what the homestead needs next.",
      "Balance all three resources to keep the homestead humming.",
    ],
    controls: "Click / tap nodes",
  },
  {
    slug: "dreamscape-forager", dir: "dreamscape-forager",
    title: "Dreamscape Forager", emoji: "🌙",
    tagline: "Drift and gather in a floating dream.",
    objective: "Glide through the dreamscape and collect as many glowing <b>Dewdrops</b> as you can for the highest score.",
    how: [
      "Press <b>Spacebar</b> or <b>click</b> to hop/flap upward — release to drift gently down.",
      "Float through the <b>Dewdrops</b> to collect them and build your score.",
      "Missing a dewdrop costs a few points, so glide with intention.",
    ],
    controls: "Click / Spacebar = hop",
  },
  {
    slug: "sunset-ranch", dir: "sunset-ranch-simulator",
    title: "Sunset Ranch", emoji: "🌅",
    tagline: "A calm dusk-lit sandbox ranch.",
    objective: "Tend a peaceful ranch at golden hour. There's no timer and no way to lose — just keep the animals happily grazing.",
    how: [
      "Click <b>open ground</b> to scatter fresh grass.",
      "The <b>animals</b> wander toward the grass and graze — guide them around the field.",
      "Click anywhere to interact and unwind. That's the whole point.",
    ],
    controls: "Click / tap the ground",
  },
  {
    slug: "twin-peaks-tycoon", dir: "twin-peaks-tycoon",
    title: "Twin Peaks Tycoon", emoji: "⛰️",
    tagline: "Mine the twin peaks, build a fortune.",
    objective: "Become a tycoon by mining the two peaks and converting 🪨 Stone and ⚡ Energy into 💰 Cash (Stone ×5 + Energy ×10).",
    how: [
      "Click <b>resources</b> as they surface from the <b>left & right biomes</b> to collect Stone and Energy.",
      "Cash in your haul to grow your running total.",
      "Keep both peaks producing to maximise earnings.",
    ],
    controls: "Click / tap resources",
  },
];

/* ---- the injected instruction overlay (self-contained, brand-styled) ---- */
function overlay(g) {
  const lis = g.how.map((h) => `<li>${h}</li>`).join("");
  return `
<div id="arcade-help-overlay">
  <div id="ah-card">
    <div id="ah-kicker">⛏ BARNYARD ARCADE</div>
    <h1>${g.emoji} ${g.title}</h1>
    <p id="ah-tag">${g.tagline}</p>
    <div class="ah-sec"><span class="ah-h">🎯 Objective</span><p>${g.objective}</p></div>
    <div class="ah-sec"><span class="ah-h">🎮 How to play</span><ul>${lis}</ul></div>
    <div class="ah-sec"><span class="ah-h">🕹 Controls</span><p>${g.controls}</p></div>
    <button id="ah-play">▶ Play</button>
  </div>
</div>
<button id="arcade-help-btn" title="How to play">❓</button>
<a id="arcade-back" href="/arcade/" title="Back to the Barnyard Arcade">← Arcade</a>
<style>
  #arcade-help-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
    padding:20px;background:rgba(18,17,16,.82);backdrop-filter:blur(4px);font-family:'JetBrains Mono','Fira Code',ui-monospace,monospace;}
  #ah-card{max-width:540px;width:100%;max-height:88vh;overflow-y:auto;background:#fdf6e3;color:#2b1d12;
    border:3px solid #4e7d3a;border-radius:16px;padding:26px 28px;box-shadow:0 18px 50px rgba(0,0,0,.5);}
  #ah-kicker{font-size:11px;letter-spacing:2px;color:#4e7d3a;font-weight:700;}
  #ah-card h1{font-size:26px;margin:6px 0 2px;color:#214d2c;font-weight:800;line-height:1.15;}
  #ah-tag{font-style:italic;color:#5c4630;margin-bottom:16px;font-family:Georgia,serif;}
  .ah-sec{margin-bottom:14px;}
  .ah-h{display:block;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#ff9d45;font-weight:700;margin-bottom:4px;}
  .ah-sec p{line-height:1.5;font-size:14.5px;font-family:Georgia,serif;}
  .ah-sec ul{margin:0 0 0 18px;line-height:1.55;font-size:14px;font-family:Georgia,serif;}
  .ah-sec li{margin-bottom:5px;}
  #ah-play{margin-top:8px;width:100%;padding:13px;background:#4e7d3a;color:#fff;border:2px solid #214d2c;
    border-radius:12px;font-size:16px;font-weight:700;cursor:pointer;font-family:inherit;transition:background .2s;}
  #ah-play:hover{background:#6aa84f;}
  #arcade-help-btn{position:fixed;bottom:16px;left:16px;z-index:99998;width:42px;height:42px;border-radius:50%;
    background:rgba(78,125,58,.92);color:#fff;border:2px solid #fdf6e3;font-size:18px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.4);}
  #arcade-help-btn:hover{background:#6aa84f;}
  #arcade-back{position:fixed;top:16px;left:16px;z-index:99998;background:rgba(18,17,16,.7);color:#f5e9c9;
    text-decoration:none;font-family:'JetBrains Mono',monospace;font-size:12px;padding:7px 12px;border-radius:10px;border:1px solid rgba(245,233,201,.4);}
  #arcade-back:hover{background:rgba(18,17,16,.9);color:#ffb300;}
</style>
<script>
  (function(){
    var ov=document.getElementById('arcade-help-overlay'),
        btn=document.getElementById('arcade-help-btn'),
        play=document.getElementById('ah-play');
    function show(){ov.style.display='flex';} function hide(){ov.style.display='none';}
    if(play) play.onclick=hide;
    if(btn) btn.onclick=show;
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') hide(); });
  })();
</script>`;
}

async function toWebp(srcFile, outFile, maxWidth, quality) {
  const img = await loadImage(await fs.readFile(srcFile));
  const scale = Math.min(1, maxWidth / img.width);
  const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
  const c = createCanvas(w, h);
  c.getContext("2d").drawImage(img, 0, 0, w, h);
  await fs.mkdir(path.dirname(outFile), { recursive: true });
  await fs.writeFile(outFile, c.toBuffer("image/webp", quality));
  return { w, bytes: (await fs.stat(outFile)).size };
}

const firstExisting = (dir, names) => names.map((n) => path.join(dir, n)).find((p) => existsSync(p));

await fs.mkdir(OUT, { recursive: true });
await fs.mkdir(THUMBS, { recursive: true });

for (const g of GAMES) {
  const srcDir = path.join(SRC_BASE, g.dir);
  if (!existsSync(path.join(srcDir, "index.html"))) { console.warn(`SKIP ${g.slug}: no index.html at ${srcDir}`); continue; }
  let html = await fs.readFile(path.join(srcDir, "index.html"), "utf8");
  const outDir = path.join(OUT, g.slug);
  await fs.mkdir(outDir, { recursive: true });

  // background image -> webp + rewrite refs
  const bg = firstExisting(srcDir, ["background.png", "background.jpg", "background.jpeg"]);
  if (bg) {
    const r = await toWebp(bg, path.join(outDir, "background.webp"), 1600, 70);
    html = html.replace(/background\.(png|jpe?g)/gi, "background.webp");
    console.log(`  ${g.slug}: background.webp ${(r.bytes / 1024).toFixed(0)}KB (${r.w}px)`);
  }

  // inject the instruction overlay right after <body ...>
  html = html.replace(/(<body[^>]*>)/i, `$1\n${overlay(g)}\n`);
  await fs.writeFile(path.join(outDir, "index.html"), html, "utf8");

  // thumbnail for the arcade hub (prefer source art, else the background)
  const thumbSrc = firstExisting(srcDir, ["source.jpg", "source.jpeg", "source.png"]) || bg;
  if (thumbSrc) {
    try {
      const t = await toWebp(thumbSrc, path.join(THUMBS, `${g.slug}.webp`), 560, 74);
      console.log(`  ${g.slug}: thumb ${(t.bytes / 1024).toFixed(0)}KB`);
    } catch (e) { console.warn(`  ${g.slug}: thumb failed (${e.message})`); }
  }
}
console.log(`\narcade staged -> ${path.relative(repoRoot, OUT)}`);
