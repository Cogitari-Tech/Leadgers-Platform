import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../../config/supabase";

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Protects routes from unauthenticated access.
 * Redirects to /login if no session is found.
 * Redirects to /verify-email if user email is not confirmed.
 * Enforces Two-Factor Authentication (AAL2) based on role or enrollment.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const {
    user,
    session,
    tenant,
    loading: authLoading,
    initialized,
  } = useAuth();
  const location = useLocation();
  const [checkingMfa, setCheckingMfa] = useState(true);
  const [mfaStatus, setMfaStatus] = useState<
    "ok" | "needs_challenge" | "needs_setup"
  >("ok");

  useEffect(() => {
    async function verifyMfaStatus() {
      if (!user) {
        setCheckingMfa(false);
        return;
      }

      try {
        const { data, error } =
          await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (error) throw error;

        const { currentLevel, nextLevel } = data;

        // If current level is AAL1 but the user has registered factors (nextLevel = AAL2),
        // they must complete the MFA challenge.
        if (currentLevel === "aal1" && nextLevel === "aal2") {
          // CHECK FOR TRUSTED DEVICE
          const deviceId = localStorage.getItem("leadgers_device_id");
          if (deviceId) {
            const { data } = await supabase
              .from("device_trusts")
              .select("expires_at")
              .eq("device_id", deviceId)
              .eq("user_id", user.id)
              .eq("revoked", false)
              .single();

            if (data && new Date(data.expires_at) > new Date()) {
              setMfaStatus("ok");
              setCheckingMfa(false);
              return;
            }
          }

          setMfaStatus("needs_challenge");
          setCheckingMfa(false);
          return;
        }

        // Roles that require strict 2FA
        const strictRoles = ["admin", "cfo", "auditor"];
        const isStrictRole = user.role && strictRoles.includes(user.role.name);

        // If the role requires 2FA but the user hasn't enrolled (nextLevel = AAL1),
        // force them to setup screen.
        if (isStrictRole && nextLevel === "aal1") {
          setMfaStatus("needs_setup");
          setCheckingMfa(false);
          return;
        }

        setMfaStatus("ok");
      } catch (err) {
        console.error("Failed to verify MFA level", err);
        setMfaStatus("ok"); // fallback to let them pass or handle error later
      } finally {
        setCheckingMfa(false);
      }
    }

    if (initialized && !authLoading) {
      verifyMfaStatus();
    }
  }, [user, initialized, authLoading]);

  // Handle loading states
  if (!initialized || authLoading || checkingMfa) {
    return (
      <div className="flex h-screen items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />

        <div className="flex flex-col items-center gap-6 relative z-10 glass-panel p-10 rounded-[2.5rem] border border-border/40 shadow-2xl">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/20 border-t-primary shadow-[0_0_20px_rgba(var(--primary),0.2)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
            </div>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-black text-foreground uppercase tracking-[0.2em]">
              Autenticando
            </p>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">
              Leadgers Security Protocol
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Not logged in -> public landing page
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Email not confirmed -> verify-email screen
  const supabaseUser = session?.user;
  const isSetupTestUser =
    supabaseUser?.email === "teste@leadgers.com" ||
    supabaseUser?.email === "test_removivel@leadgers.com" ||
    supabaseUser?.email === "qa_vibe_test@leadgers.com" ||
    (supabaseUser?.email?.startsWith("onboarding-test") &&
      supabaseUser?.email?.endsWith("@leadgers.com"));

  const isDevEnvironment = import.meta.env.DEV;
  if (
    supabaseUser &&
    !supabaseUser.email_confirmed_at &&
    !isSetupTestUser &&
    !isDevEnvironment &&
    location.pathname !== "/verify-email"
  ) {
    return <Navigate to="/verify-email" replace />;
  }

  // Needs validation -> challenge screen
  if (
    mfaStatus === "needs_challenge" &&
    location.pathname !== "/auth/mfa-challenge"
  ) {
    return (
      <Navigate to="/auth/mfa-challenge" state={{ from: location }} replace />
    );
  }

  // Needs to create factor -> setup screen
  if (mfaStatus === "needs_setup" && location.pathname !== "/auth/mfa-setup") {
    return <Navigate to="/auth/mfa-setup" state={{ from: location }} replace />;
  }

  // --- Onboarding Flows ---

  if (tenant && user) {
    const isOwnerOrAdmin =
      user.role?.name === "owner" || user.role?.name === "admin";

    // Removed agent log for stability

    // 1. Company Setup (Tenant Onboarding)
    if (!tenant.onboarding_completed) {
      // Safety net: If the wizard just completed but React state hasn't propagated yet,
      // do NOT redirect back to onboarding (prevents redirect loop)
      const justCompleted =
        sessionStorage.getItem("onboarding_just_completed") === "true";
      if (justCompleted) {
        console.log(
          "[AuthGuard] Onboarding just completed (session flag). Allowing through.",
        );
        // DO NOT REMOVE the flag here. Let the context catch up.
        // When tenant.onboarding_completed becomes true, this block won't run.
      } else {
        console.log(
          "[AuthGuard] Tenant onboarding NOT completed. Redirecting to /onboarding. Tenant ID:",
          tenant.id,
          "Path:",
          location.pathname,
        );
        if (isOwnerOrAdmin) {
          if (location.pathname !== "/onboarding") {
            return <Navigate to="/onboarding" replace />;
          }
        } else {
          // Not owner/admin but tenant is pending setup
          if (location.pathname !== "/pending-setup") {
            return <Navigate to="/pending-setup" replace />;
          }
        }
      }
    } else {
      // Eject from tenant onboarding routes if already completed
      if (
        location.pathname === "/onboarding" ||
        location.pathname === "/pending-setup"
      ) {
        return <Navigate to="/dashboard" replace />;
      }

      // --- Special case for Test User: always see onboarding once per session ---
      const isTestUser =
        user.email === "teste@leadgers.com" ||
        user.email === "test_removivel@leadgers.com" ||
        user.email === "qa_vibe_test@leadgers.com" ||
        (user.email?.startsWith("onboarding-test") &&
          user.email?.endsWith("@leadgers.com"));

      const hasSeenTour = sessionStorage.getItem("has_seen_tour") === "true";

      if (
        isTestUser &&
        !hasSeenTour &&
        location.pathname !== "/user-onboarding" &&
        location.pathname !== "/onboarding"
      ) {
        return <Navigate to="/user-onboarding" replace />;
      }

      // Tenant is set up. Now check user onboarding.
      // Optimistically consider it complete if they just finished and have the session flag
      const onboardingCompleted = user.user_onboarding_completed || hasSeenTour;

      if (
        !onboardingCompleted &&
        location.pathname !== "/user-onboarding" &&
        location.pathname !== "/onboarding"
      ) {
        if (!isOwnerOrAdmin) {
          return <Navigate to="/user-onboarding" replace />;
        }
      } else if (
        (onboardingCompleted || isOwnerOrAdmin) &&
        location.pathname === "/user-onboarding" &&
        !(isTestUser && !hasSeenTour)
      ) {
        // Eject if already completed user onboarding, or not required
        return <Navigate to="/dashboard" replace />;
      }
    }
  } else if (user && !tenant) {
    // Edge case: User is authenticated but has no tenant associated.
    // Likely a first-time Google/GitHub sign-up.
    // Redirect to the register page but force the organization choice step.
    if (location.pathname !== "/register") {
      return (
        <Navigate
          to="/register?step=choice"
          state={{ from: location }}
          replace
        />
      );
    }
  }

  return <>{children}</>;
}
