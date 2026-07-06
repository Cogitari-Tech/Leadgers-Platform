import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";

// Encapsulates all Supabase access for the Google Workspace integration so that
// presentation components never talk to Supabase directly (Clean Architecture:
// components → hooks → infrastructure).
export function useGoogleWorkspace() {
  const { tenant, signInWithGoogle } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkIntegration() {
      if (!tenant) {
        setChecking(false);
        return;
      }
      setChecking(true);
      try {
        const { data, error } = await supabase
          .from("google_workspace_integrations")
          .select("id")
          .eq("tenant_id", tenant.id)
          .limit(1)
          .maybeSingle();

        if (!cancelled) setIsConnected(!error && Boolean(data));
      } catch {
        if (!cancelled) setIsConnected(false);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    checkIntegration();
    return () => {
      cancelled = true;
    };
  }, [tenant]);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      await signInWithGoogle();
      // On success the browser redirects through the OAuth flow, so we leave
      // `connecting` set until navigation happens.
    } catch (err) {
      console.error("Google Workspace connect error:", err);
      setConnecting(false);
    }
  }, [signInWithGoogle]);

  const disconnect = useCallback(async () => {
    if (!tenant) return;
    setConnecting(true);
    try {
      const { error } = await supabase
        .from("google_workspace_integrations")
        .delete()
        .eq("tenant_id", tenant.id);

      if (error) throw error;
      setIsConnected(false);
    } finally {
      setConnecting(false);
    }
  }, [tenant]);

  return { isConnected, checking, connecting, connect, disconnect };
}
