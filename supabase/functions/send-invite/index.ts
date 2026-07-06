import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { getCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const resend = new Resend(resendApiKey);
    const { email, link, inviter_name } = await req.json();

    if (!email || !link) {
      throw new Error("Missing email or link in request body");
    }

    const { data, error } = await resend.emails.send({
      from: "Leadgers Governance <noreply@m.leadgers.com>",
      to: email,
      subject: `Convite de acesso para Leadgers Governance de ${inviter_name || "um membro da equipe"}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #000000; color: #f8fafc; padding: 40px; border-radius: 8px; border: 1px solid #1e293b;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ffffff; font-weight: 900; letter-spacing: -2px; margin: 0;">LEADGERS</h1>
          </div>
          <h2 style="color: #ffffff; text-align: center; letter-spacing: -0.5px;">
            Convite Estratégico
          </h2>
          <p style="color: #cbd5e1; font-size: 16px; line-height: 1.5; text-align: center;">
            Você foi convidado por <strong>${inviter_name}</strong> para colaborar em um ambiente seguro na
            <strong>Leadgers Governance</strong>.
          </p>
          <div style="text-align: center; margin: 40px 0;">
            <a
              href="${link}"
              style="background-color: #ffffff; color: #000000; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;"
            >
              Aceitar Convite
            </a>
          </div>
          <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px; text-transform: uppercase;">
            &copy; ${new Date().getFullYear()} Leadgers Governance
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in send-invite function:", error);
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
