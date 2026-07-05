import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch up to 50 unprocessed events
    const { data: events, error } = await supabase
      .from("github_governance_events")
      .select("*")
      .eq("processed", false)
      .limit(50);

    if (error) throw error;
    if (!events || events.length === 0) {
      return new Response(JSON.stringify({ message: "No events to process" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let processedCount = 0;

    for (const event of events) {
      try {
        const payload = event.raw_payload;
        const tenantId = event.tenant_id;

        // --- 1. Repository creation/update ---
        if (event.event_type === "repository" && payload.repository) {
          const orgData = await supabase
            .from("github_organizations")
            .select("id")
            .eq("github_org_id", payload.repository.owner.id)
            .single();

          await supabase.from("github_repositories").upsert(
            {
              tenant_id: tenantId,
              github_repo_id: payload.repository.id,
              org_id: orgData.data?.id || null,
              name: payload.repository.name,
              full_name: payload.repository.full_name,
              visibility: payload.repository.private ? "private" : "public",
              default_branch: payload.repository.default_branch,
              language: payload.repository.language,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "github_repo_id" },
          );
        }

        // --- 2. Security Alerts ---
        if (event.event_type.endsWith("_alert") && payload.alert) {
          const repoRec = await supabase
            .from("github_repositories")
            .select("id")
            .eq("github_repo_id", payload.repository.id)
            .single();

          if (repoRec.data) {
            await supabase.from("github_security_alerts").upsert({
              repo_id: repoRec.data.id,
              alert_type: event.event_type.replace("_alert", ""),
              severity:
                payload.alert.security_severity ||
                payload.alert.severity ||
                "medium",
              state: payload.alert.state,
              title:
                payload.alert.security_vulnerability?.package?.name ||
                payload.alert.rule?.name ||
                "Alert",
              url: payload.alert.html_url,
            });

            // Create an audit finding if it's open
            if (payload.alert.state === "open") {
              await supabase.from("audit_findings").insert({
                tenant_id: tenantId,
                title: `GitHub Security Alert: ${payload.alert.rule?.name || "Unknown"}`,
                description: payload.alert.html_url,
                severity:
                  payload.alert.security_severity === "critical"
                    ? "critical"
                    : "high",
                status: "open",
                source_type: "github",
                source_ref: payload.alert.html_url,
              });
            }
          }
        }

        // --- 3. PR Updates ---
        if (event.event_type === "pull_request" && payload.pull_request) {
          const repoRec = await supabase
            .from("github_repositories")
            .select("id")
            .eq("github_repo_id", payload.repository.id)
            .single();
          if (repoRec.data) {
            await supabase.from("github_pull_requests").upsert({
              repo_id: repoRec.data.id,
              github_pr_number: payload.pull_request.number,
              title: payload.pull_request.title,
              state: payload.pull_request.state,
              author: payload.pull_request.user?.login,
              opened_at: payload.pull_request.created_at,
              merged_at: payload.pull_request.merged_at,
              closed_at: payload.pull_request.closed_at,
              url: payload.pull_request.html_url,
            });
          }
        }

        // Mark event as processed
        await supabase
          .from("github_governance_events")
          .update({ processed: true })
          .eq("id", event.id);

        processedCount++;
      } catch (err) {
        console.error(`Failed to process event ${event.id}:`, err);
      }
    }

    return new Response(JSON.stringify({ success: true, processedCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
