// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import netlify from '@astrojs/netlify';

// output stays 'static' — every page prerenders as before. Only the Boot
// Sequence endpoint (src/pages/api/boot.ts) opts into on-demand rendering
// via `export const prerender = false`, becoming a Netlify function at build.
// The adapter is applied only for `astro build` — in `astro dev` the endpoint
// runs natively, and skipping the adapter avoids its Netlify-dev emulation
// tripping over the repo-root netlify.toml `base`.
const isBuild = process.argv.includes('build');

// NOTE: the three agent endpoints need GOOGLE_GENERATIVE_AI_API_KEY in the
// Netlify site env (scopes: functions + runtime). Set in Netlify, not here.

// https://astro.build/config
export default defineConfig({
  output: 'static',
  ...(isBuild ? { adapter: netlify() } : {}),
  vite: {
    plugins: [tailwindcss()]
  }
});