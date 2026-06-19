/* =====================================================================
   Cloudinary delivery URL helper — Tier-2 integration
   ---------------------------------------------------------------------
   ENV-GATED: if PUBLIC_CLOUDINARY_CLOUD_NAME (Astro/Vite public var) or
   CLOUDINARY_CLOUD_NAME (server-side var) is set, cld() returns a
   Cloudinary fetch URL with auto format + quality + optional width.
   If neither env var is present, cld() returns `src` unchanged — zero
   behaviour change for anyone without a Cloudinary account.

   Usage (in any .astro component):
     import { cld } from '../lib/cloudinary.mjs';
     <img src={cld('/img/cover/thumb-field-guides.webp', { width: 640 })} ... />

   The helper uses Cloudinary's "fetch" delivery type so no upload step
   is required: Cloudinary fetches the image from your own domain on the
   first request and caches it on the CDN edge.

   Adoption path:
   1. Add CLOUDINARY_CLOUD_NAME (or PUBLIC_CLOUDINARY_CLOUD_NAME) to
      Netlify → Site settings → Environment variables.
   2. Set CLOUDINARY_SITE_ORIGIN to your live domain, e.g.
      https://saraloosa.org (used to build the absolute fetch URL).
   3. Replace <img src="..."> calls with
      <img src={cld('/img/...', { width: N })} ...> one section at a time.
   4. Bulk migration is a follow-up task — see TIER_FIXES_NOTES.md.

   Env vars (add to .env.example and Netlify site env):
     PUBLIC_CLOUDINARY_CLOUD_NAME   — preferred (Astro exposes to client too)
     CLOUDINARY_CLOUD_NAME          — server-side fallback
     CLOUDINARY_SITE_ORIGIN         — your live domain (no trailing slash)
                                      default: https://saraloosa.org
   ===================================================================== */

const CLOUD_NAME =
  (typeof import.meta !== "undefined" && import.meta.env?.PUBLIC_CLOUDINARY_CLOUD_NAME) ||
  (typeof process !== "undefined" && process.env?.PUBLIC_CLOUDINARY_CLOUD_NAME) ||
  (typeof process !== "undefined" && process.env?.CLOUDINARY_CLOUD_NAME) ||
  "";

const SITE_ORIGIN =
  (typeof process !== "undefined" && process.env?.CLOUDINARY_SITE_ORIGIN) ||
  "https://saraloosa.org";

/**
 * Return a Cloudinary fetch delivery URL, or `src` unchanged when
 * Cloudinary is not configured.
 *
 * @param {string} src    — site-relative path, e.g. "/img/cover/thumb.webp"
 * @param {object} [opts]
 * @param {number} [opts.width]   — pixel width for w_ transform (optional)
 * @param {string} [opts.quality] — Cloudinary quality string, default "auto"
 * @param {string} [opts.format]  — Cloudinary format string, default "auto"
 * @returns {string} delivery URL (Cloudinary) or original src
 */
export function cld(src, { width, quality = "auto", format = "auto" } = {}) {
  if (!CLOUD_NAME) return src;

  // Build a comma-separated transformation string
  const transforms = [`f_${format}`, `q_${quality}`];
  if (width) transforms.push(`w_${width}`);

  // Encode the absolute origin URL for the fetch delivery type
  const absoluteSrc = src.startsWith("http") ? src : `${SITE_ORIGIN}${src}`;
  const encoded = encodeURIComponent(absoluteSrc);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transforms.join(",")},c_limit/${encoded}`;
}
