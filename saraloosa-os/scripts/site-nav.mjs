/* =====================================================================
   SHARED SITE NAV for the standalone pages (arcade cabinets, Wild Pharmacy,
   Pharmacopoeia, dig-deeper) — they keep their own look, but get a small
   floating "saraloosa" pill that opens the common site navigation, so
   visitors can always get back into the main site.
   injectNav(html, current) is idempotent; it also strips the older
   #sys-nav top bar if present.
   ===================================================================== */
export const LINKS = [
  ["/", "home"],
  ["/the_syllabus", "syllabus"],
  ["/the_compost", "compost"],
  ["/dig-deeper/", "library"],
  ["/arcade", "arcade"],
  ["/wild-pharmacy/", "wild pharmacy"],
  ["/wild-pharmacy/pharmacopoeia/", "pharmacopoeia"],
];

export function navBlock(current = "") {
  const links = LINKS.map(([href, label]) =>
    `<a href="${href}"${href === current ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  return `
<!-- ============ SARALOOSA SITE NAV (injected) ============ -->
<style>
  #site-nav{position:fixed;top:10px;left:10px;z-index:2147483000;font:500 13px/1.2 system-ui,-apple-system,"Segoe UI",sans-serif}
  #site-nav>button{display:flex;align-items:center;gap:6px;padding:6px 12px 6px 8px;border-radius:999px;border:1px solid rgba(185,199,154,.7);background:rgba(255,251,239,.92);color:#1d3b2c;cursor:pointer;box-shadow:0 6px 20px -10px rgba(0,0,0,.5);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font:inherit}
  #site-nav>button:hover,#site-nav>button:focus-visible{border-color:#b4540f;outline:none}
  #site-nav .sn-menu{display:none;margin-top:6px;flex-direction:column;min-width:170px;padding:6px;border-radius:14px;border:1px solid rgba(185,199,154,.7);background:rgba(255,251,239,.97);box-shadow:0 14px 34px -14px rgba(0,0,0,.55)}
  #site-nav.open .sn-menu{display:flex}
  #site-nav .sn-menu a{color:#1d3b2c;text-decoration:none;padding:7px 10px;border-radius:9px}
  #site-nav .sn-menu a:hover,#site-nav .sn-menu a:focus-visible{background:#e7efd6;color:#b4540f;outline:none}
  #site-nav .sn-menu a[aria-current]{color:#3a7a3c;font-weight:700}
  @media print{#site-nav{display:none}}
</style>
<nav id="site-nav" aria-label="Saraloosa site navigation">
  <button type="button" aria-expanded="false" aria-controls="sn-menu"><svg width="18" height="18" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="6.5" fill="#f2b632"/><g stroke="#e0891f" stroke-width="2.4" stroke-linecap="round"><path d="M16 2v4M16 26v4M2 16h4M26 16h4M6 6l3 3M23 23l3 3M6 26l3-3M23 9l3-3"/></g></svg>saraloosa ▾</button>
  <div class="sn-menu" id="sn-menu">${links}</div>
</nav>
<script>(function(){var n=document.getElementById('site-nav'),b=n.querySelector('button');
b.addEventListener('click',function(e){e.stopPropagation();var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
document.addEventListener('click',function(e){if(!n.contains(e.target)){n.classList.remove('open');b.setAttribute('aria-expanded','false')}});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){n.classList.remove('open');b.setAttribute('aria-expanded','false')}});})();</script>
<!-- ============ /SARALOOSA SITE NAV ============ -->
`;
}

export function injectNav(html, current = "") {
  html = html.replace(/\n?<!-- =+ GLOBAL SYS_NODE NAV =+ -->[\s\S]*?<\/nav>\n?/, "\n");
  html = html.replace(/\n?<!-- =+ SARALOOSA SITE NAV \(injected\) =+ -->[\s\S]*?<!-- =+ \/SARALOOSA SITE NAV =+ -->\n?/, "\n");
  return html.replace(/<body([^>]*)>/i, (m) => `${m}\n${navBlock(current)}`);
}
