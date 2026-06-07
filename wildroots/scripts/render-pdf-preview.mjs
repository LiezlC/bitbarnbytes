import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

const repoRoot = path.resolve(new URL('../..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const require = createRequire(import.meta.url);
const { createCanvas } = require(path.join(repoRoot, '.tools/pdf-tools/node_modules/@napi-rs/canvas'));
const pdfjs = await import(pathToFileURL(path.join(repoRoot, '.tools/pdf-tools/node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href);

class NodeCanvasFactory {
  create(width, height) {
    const canvas = createCanvas(width, height);
    return {
      canvas,
      context: canvas.getContext('2d'),
    };
  }

  reset(canvasAndContext, width, height) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }

  destroy(canvasAndContext) {
    canvasAndContext.canvas.width = 0;
    canvasAndContext.canvas.height = 0;
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

const input = process.argv[2];
const output = process.argv[3];

if (!input || !output) {
  console.error('Usage: node render-pdf-preview.mjs input.pdf output.png');
  process.exit(1);
}

const data = new Uint8Array(await fs.readFile(input));
const doc = await pdfjs.getDocument({ data, disableWorker: true }).promise;
const page = await doc.getPage(1);
const viewport = page.getViewport({ scale: 1.4 });
const canvasFactory = new NodeCanvasFactory();
const canvasAndContext = canvasFactory.create(viewport.width, viewport.height);

await page.render({
  canvasContext: canvasAndContext.context,
  viewport,
  canvasFactory,
}).promise;

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, canvasAndContext.canvas.toBuffer('image/png'));
canvasFactory.destroy(canvasAndContext);

console.log(JSON.stringify({ input, output, pages: doc.numPages }, null, 2));
