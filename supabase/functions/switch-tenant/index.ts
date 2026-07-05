import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Get standard auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    const { tenant_id } = await req.json();
    if (!tenant_id) {
      throw new Error("Missing target tenant_id");
    }

    // 2. Init Supabase clients (User Client & Admin Client)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Client acting as the user to fetch user session
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error(userError?.message || "Invalid or expired token");
    }

    // Client acting as admin to verify membership and update App Metadata
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 3. Verify membership to target tenant securely
    const { data: memberData, error: memberError } = await supabaseAdmin
      .from("tenant_members")
      .select("id, status")
      .eq("tenant_id", tenant_id)
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (memberError || !memberData || memberData.status !== "active") {
      throw new Error("User is not an active member of the requested tenant");
    }

    // 4. Update the user app_metadata using Admin API
    const currentMetadata = user.app_metadata || {};
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        app_metadata: {
          ...currentMetadata,
          tenant_id: tenant_id,
        },
      });

    if (updateError) {
      throw new Error(
        `Failed to update tenant metadata: ${updateError.message}`,
      );
    }

    return new Response(JSON.stringify({ success: true, tenant_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in switch-tenant function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
