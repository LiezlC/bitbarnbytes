/* POST /api/subscribe — capture an email for the Pharmacopoeia soft meter's
   middle tier. Writes to a Netlify Blobs store you own (no third-party ESP
   required); dedupes by email. Read them back later via the Blobs API or a
   small export endpoint. Fails soft — the client unlocks regardless. */
export const prerender = false;

import type { APIRoute } from "astro";
import { getStore } from "@netlify/blobs";

const json = (status: number, obj: unknown) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const POST: APIRoute = async ({ request }) => {
  let email = "", source = "";
  try {
    ({ email, source } = await request.json());
  } catch {
    return json(400, { ok: false, error: "No email provided." });
  }
  email = (email || "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json(400, { ok: false, error: "That doesn't look like an email." });
  }
  try {
    const store = getStore("pharmacopoeia-emails");
    await store.setJSON(email, {
      email,
      source: (source || "pharmacopoeia").slice(0, 60),
      at: new Date().toISOString(),
    });
    return json(200, { ok: true });
  } catch (err: any) {
    // never break the unlock UX over a storage hiccup
    console.error("[subscribe] blob error:", err?.message);
    return json(200, { ok: false, stored: false });
  }
};
