import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

// ─── GitHub App Auth ───────────────────────────────────────────
const APP_ID = Deno.env.get("GITHUB_APP_ID") ?? "";
const PRIVATE_KEY = Deno.env.get("GITHUB_APP_PRIVATE_KEY") ?? "";

// Fallback btoa
const btoaFallback = (str: string) => {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Base64Url Utility
const toBase64Url = (base64: string) => {
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
};

// Convert PEM to CryptoKey
async function importPrivateKey(pem: string) {
  const pemHeader = "-----BEGIN RSA PRIVATE KEY-----";
  const pemFooter = "-----END RSA PRIVATE KEY-----";
  let pemContents = pem.substring(
    pem.indexOf(pemHeader) + pemHeader.length,
    pem.indexOf(pemFooter),
  );
  pemContents = pemContents.replace(/\s/g, "");

  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) {
    binaryDer[i] = binaryDerString.charCodeAt(i);
  }

  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    true,
    ["sign"],
  );
}

// Generate JWT for GitHub App
async function generateGitHubAppJWT() {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iat: now - 60,
    exp: now + 10 * 60,
    iss: APP_ID,
  };

  const encodedHeader = toBase64Url(btoaFallback(JSON.stringify(header)));
  const encodedPayload = toBase64Url(btoaFallback(JSON.stringify(payload)));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const privateKey = (PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const cryptoKey = await importPrivateKey(privateKey);

  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(dataToSign),
  );

  const signatureBytes = new Uint8Array(signatureBuffer);
  let signatureBase64 = "";
  for (let i = 0; i < signatureBytes.length; i++) {
    signatureBase64 += String.fromCharCode(signatureBytes[i]);
  }
  const encodedSignature = toBase64Url(btoa(signatureBase64));

  return `${dataToSign}.${encodedSignature}`;
}

async function getInstallationToken(installationId: string) {
  const jwt = await generateGitHubAppJWT();
  const res = await fetch(
    `https://api.github.com/app/installations/${installationId}/access_tokens`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Leadgers-Audit",
      },
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to get installation token: ${err}`);
  }

  const data = await res.json();
  return data.token;
}

// ─── Edge Function Handler ───────────────────────────────────────
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error("Unauthorized");

    // 2. Get tenant
    const { data: tenantMember } = await supabase
      .from("tenant_members")
      .select("tenant_id")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    if (!tenantMember) throw new Error("No tenant found for user");
    const tenantId = tenantMember.tenant_id;

    // 3. Get GitHub Installation ID
    const { data: installation } = await supabase
      .from("github_installations")
      .select("installation_id")
      .eq("tenant_id", tenantId)
      .limit(1)
      .single();

    if (!installation)
      throw new Error("No GitHub App installed for this tenant");
    const installationId = installation.installation_id;

    const body = await req.json();
    const { action, payload } = body;
    // Action types: "create_issue", "close_issue", "link_pr"

    if (!action) throw new Error("No action specified");

    const ghToken = await getInstallationToken(installationId);

    if (action === "create_issue") {
      const { repoFullName, title, body: issueBody, findingId } = payload;
      // https://api.github.com/repos/OWNER/REPO/issues
      const res = await fetch(
        `https://api.github.com/repos/${repoFullName}/issues`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${ghToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Leadgers-Audit",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: `[Auditoria] ${title}`,
            body: issueBody,
            labels: ["leadgers-audit"],
          }),
        },
      );

      if (!res.ok)
        throw new Error(`GitHub Create Issue API Error: ${await res.text()}`);
      const issue = await res.json();

      // Ensure issue is stored in github_issues for tracking
      const { data: repoRec } = await supabase
        .from("github_repositories")
        .select("id")
        .eq("full_name", repoFullName)
        .eq("tenant_id", tenantId)
        .single();

      if (repoRec) {
        await supabase.from("github_issues").upsert({
          repo_id: repoRec.id,
          github_issue_number: issue.number,
          title: issue.title,
          state: issue.state,
          author: issue.user?.login || "unknown",
          opened_at: issue.created_at,
          url: issue.html_url,
          labels: issue.labels.map((l: any) => l.name),
          linked_finding_id: findingId || null,
        });

        // If a finding ID was provided, also link the finding to this issue
        if (findingId) {
          await supabase
            .from("audit_findings")
            .update({
              source_type: "github",
              source_ref: `${repoFullName}#${issue.number}`,
            })
            .eq("id", findingId);
        }
      }

      return new Response(JSON.stringify({ success: true, issue }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "close_issue") {
      const { repoFullName, issueNumber } = payload;
      const res = await fetch(
        `https://api.github.com/repos/${repoFullName}/issues/${issueNumber}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${ghToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "Leadgers-Audit",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            state: "closed",
            state_reason: "completed",
          }),
        },
      );

      if (!res.ok)
        throw new Error(`GitHub Close Issue API Error: ${await res.text()}`);
      const issue = await res.json();

      const { data: repoRec } = await supabase
        .from("github_repositories")
        .select("id")
        .eq("full_name", repoFullName)
        .eq("tenant_id", tenantId)
        .single();

      if (repoRec) {
        await supabase
          .from("github_issues")
          .update({ state: "closed", closed_at: new Date().toISOString() })
          .eq("repo_id", repoRec.id)
          .eq("github_issue_number", issueNumber);
      }

      return new Response(JSON.stringify({ success: true, issue }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (action === "link_pr") {
      const { prId, findingId } = payload;
      await supabase
        .from("github_pull_requests")
        .update({ linked_finding_id: findingId })
        .eq("id", prId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
