/* POST /api/verify-license — verify a Gumroad licence key for full Pharmacopoeia
   access. Soft-meter backend: the only server-side piece, so the product id stays
   secret and the check can't be spoofed from the browser console.

   Env (set in Netlify site env, scopes: functions + runtime):
     GUMROAD_PRODUCT_ID         — the "full pharmacopoeia" product's id   (preferred)
     GUMROAD_PRODUCT_PERMALINK  — …or its permalink, if that's all you have
     GUMROAD_TEST_KEY           — optional: a key that always unlocks, for previewing
                                  the paid state without a real purchase (remove for prod)
*/
export const prerender = false;

import type { APIRoute } from "astro";

const json = (status: number, obj: unknown) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const POST: APIRoute = async ({ request }) => {
  let license_key = "";
  try {
    ({ license_key } = await request.json());
  } catch {
    return json(400, { valid: false, error: "Enter your licence key." });
  }
  license_key = (license_key || "").trim();
  if (!license_key) return json(400, { valid: false, error: "Enter your licence key." });

  const testKey = import.meta.env.GUMROAD_TEST_KEY;
  if (testKey && license_key === testKey) return json(200, { valid: true, reason: "test" });

  const productId = import.meta.env.GUMROAD_PRODUCT_ID;
  const permalink = import.meta.env.GUMROAD_PRODUCT_PERMALINK;
  if (!productId && !permalink) {
    return json(503, { valid: false, error: "Licensing isn't switched on yet." });
  }

  const body = new URLSearchParams({ license_key, increment_uses_count: "false" });
  if (productId) body.set("product_id", productId);
  else body.set("product_permalink", permalink as string);

  try {
    const res = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
    const data: any = await res.json().catch(() => ({}));
    const p = data?.purchase || {};
    const bad =
      p.refunded || p.chargebacked || p.disputed ||
      p.subscription_cancelled_at || p.subscription_failed_at;
    const valid = !!data?.success && !bad;
    return json(200, {
      valid,
      reason: valid ? "ok" : (data?.message || "That key didn't check out."),
    });
  } catch {
    return json(502, { valid: false, error: "Couldn't reach the licence service — try again." });
  }
};
