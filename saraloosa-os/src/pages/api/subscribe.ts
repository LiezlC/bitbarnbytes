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

/* GET /api/subscribe?token=… — export the captured list as JSON.
   Guarded by the SUBSCRIBE_EXPORT_TOKEN env var; returns 401 unless it matches. */
export const GET: APIRoute = async ({ url }) => {
  const token = import.meta.env.SUBSCRIBE_EXPORT_TOKEN;
  if (!token || url.searchParams.get("token") !== token) {
    return json(401, { error: "Set SUBSCRIBE_EXPORT_TOKEN and pass ?token=… to export." });
  }
  try {
    const store = getStore("pharmacopoeia-emails");
    const { blobs } = await store.list();
    const emails = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
    emails.sort((a: any, b: any) => (a?.at < b?.at ? 1 : -1)); // newest first
    return json(200, { count: emails.length, emails });
  } catch (err: any) {
    return json(500, { error: err?.message || "Couldn't read the list." });
  }
};
