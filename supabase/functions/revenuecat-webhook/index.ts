import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Receives RevenueCat server-to-server events and keeps public.entitlements
 * in sync. RevenueCat calls this URL with an Authorization header holding a
 * shared secret we choose; events carry app_user_id = the app's user id.
 */
const GRANTING = ["INITIAL_PURCHASE", "RENEWAL", "UNCANCELLATION", "PRODUCT_CHANGE", "NON_RENEWING_PURCHASE"];
const REVOKING = ["EXPIRATION", "REFUND", "SUBSCRIPTION_PAUSED"];

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const expected = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
  if (!expected || req.headers.get("Authorization") !== `Bearer ${expected}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { event } = await req.json();
    const userId = event?.app_user_id as string | undefined;
    const type = event?.type as string | undefined;
    if (!userId || !type) {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    const granting = GRANTING.includes(type);
    const revoking = REVOKING.includes(type);
    if (granting || revoking) {
      const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      const { error } = await admin
        .from("entitlements")
        .update({ premium: granting, updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      if (error) throw error;
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});
