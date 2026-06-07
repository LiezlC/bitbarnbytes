import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const repoRoot = path.resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const require = createRequire(import.meta.url);

const { PDFDocument, rgb } = require(path.join(repoRoot, '.tools/pdf-tools/node_modules/pdf-lib'));
const sharp = require(path.join(repoRoot, 'saraloosa-os/node_modules/sharp'));

const sourceRoot = path.join(repoRoot, 'wildroots');
const outputRoot = path.join(sourceRoot, 'watermark-covered');
const bannerPath = path.join(sourceRoot, 'bitsoil-barn-bytes-tiny-wordmark.png');

const excludeDirs = new Set(['watermark-covered']);

async function listPdfs(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!excludeDirs.has(entry.name)) {
        files.push(...await listPdfs(fullPath));
      }
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      files.push(fullPath);
    }
  }

  return files;
}

function outputPathFor(inputPath) {
  const relative = path.relative(sourceRoot, inputPath);
  const parsed = path.parse(relative);
  return path.join(outputRoot, parsed.dir, `${parsed.name} - branded.pdf`);
}

async function makeCoverBanner(widthPx = 560, heightPx = 120) {
  const wordmark = await sharp(bannerPath)
    .resize({ height: 58, fit: 'inside', withoutEnlargement: false })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: widthPx,
      height: heightPx,
      channels: 4,
      background: { r: 10, g: 12, b: 8, alpha: 0.94 },
    },
  })
    .composite([
      {
        input: wordmark,
        left: 26,
        top: 31,
      },
    ])
    .extend({
      top: 4,
      bottom: 4,
      left: 4,
      right: 4,
      background: { r: 210, g: 160, b: 52, alpha: 1 },
    })
    .png()
    .toBuffer();
}

async function coverPdf(inputPath, coverPng) {
  const pdfBytes = await fs.readFile(inputPath);
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const coverImage = await pdfDoc.embedPng(coverPng);
  const pages = pdfDoc.getPages();

  for (const page of pages) {
    const { width, height } = page.getSize();
    const stampWidth = Math.min(width * 0.3, 178);
    const stampHeight = stampWidth * (coverImage.height / coverImage.width);
    const margin = Math.max(8, Math.min(width, height) * 0.018);
    const x = width - stampWidth - margin;
    const y = Math.max(4, margin * 0.45);

    page.drawRectangle({
      x: x - 8,
      y: 0,
      width: width - x + 8,
      height: stampHeight + y + 10,
      color: rgb(0.04, 0.045, 0.03),
      opacity: 0.96,
    });

    page.drawImage(coverImage, {
      x,
      y,
      width: stampWidth,
      height: stampHeight,
    });
  }

  const outputPath = outputPathFor(inputPath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, await pdfDoc.save());

  return {
    input: path.relative(repoRoot, inputPath),
    output: path.relative(repoRoot, outputPath),
    pages: pages.length,
  };
}

const coverPng = await makeCoverBanner();
const pdfs = await listPdfs(sourceRoot);
const results = [];

for (const pdf of pdfs) {
  results.push(await coverPdf(pdf, coverPng));
}

await fs.writeFile(
  path.join(outputRoot, 'manifest.json'),
  JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
);

console.log(JSON.stringify({ count: results.length, results }, null, 2));
