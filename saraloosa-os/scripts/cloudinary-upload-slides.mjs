import { v2 as cloudinary } from 'cloudinary';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

// CLOUDINARY_URL auto-read from env (run with: node --env-file=.env ...)
const SLIDES = 'C:/Users/Liezl/Documents/Github/bitbarnbytes/wildroots/wild-pharmacy/slides';
const FOLDER = 'wild-pharmacy/slides';
const MANIFEST = 'C:/Users/Liezl/Documents/Github/bitbarnbytes/wildroots/wild-pharmacy/slides-cloudinary.json';

const files = readdirSync(SLIDES).filter((f) => extname(f).toLowerCase() === '.mp4').sort();
console.log(`uploading ${files.length} clips to ${FOLDER} ...`);

const manifest = {};
for (const f of files) {
  const id = basename(f, '.mp4'); // "01".."26"
  const localBytes = statSync(join(SLIDES, f)).size;
  try {
    const r = await cloudinary.uploader.upload(join(SLIDES, f), {
      resource_type: 'video',
      public_id: id,
      folder: FOLDER,
      overwrite: true,
      use_filename: false,
      unique_filename: false,
    });
    manifest[id] = { public_id: r.public_id, secure_url: r.secure_url, bytes: r.bytes };
    console.log(`  ${f}  ${(localBytes / 1e6).toFixed(1)}MB -> ${r.public_id}  (cld ${(r.bytes / 1e6).toFixed(1)}MB)`);
  } catch (e) {
    console.error(`  FAILED ${f}: ${e.message || e}`);
    process.exitCode = 1;
  }
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`wrote manifest: ${MANIFEST} (${Object.keys(manifest).length} entries)`);
