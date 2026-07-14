import fs from 'fs';
import path from 'path';

const navCode = `
<!-- ============ GLOBAL SYS_NODE NAV ============ -->
<style>
  #sys-nav {
    position: fixed; top: 0; left: 0; right: 0; height: 40px; z-index: 9999;
    background: rgba(18, 17, 16, 0.85); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    border-bottom: 1px solid #372415; display: flex; justify-content: space-between; align-items: center;
    padding: 0 18px; font-family: monospace; font-size: 12px; color: #e8e4dc;
  }
  #sys-nav a { color: inherit; text-decoration: none; margin-left: 14px; transition: color 0.2s; }
  #sys-nav a:hover { color: #e8a33d; }
  #sys-nav .brand { font-weight: bold; color: #4e7d3a; }
</style>
<nav id="sys-nav">
  <div><span class="brand">SYS_NODE:</span> saraloosa.org</div>
  <div>
    <a href="/">/root</a>
    <a href="/the_syllabus">/syllabus</a>
    <a href="/the_compost">/compost</a>
    <a href="/arcade">/arcade</a>
  </div>
</nav>
`;

const games = [
  'bitsoil-farm',
  'cyber-pastoral',
  'dreamscape-forager',
  'sunset-ranch',
  'twin-peaks-tycoon'
];

games.forEach(game => {
  const filePath = path.join('C:', 'Users', 'Liezl', 'Documents', 'Github', 'bitbarnbytes', 'saraloosa-os', 'public', 'arcade', game, 'index.html');
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes('id="sys-nav"')) {
    content = content.replace('<body>', `<body>\n${navCode}`);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Injected nav into ${game}`);
  }
});
