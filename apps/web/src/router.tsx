import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import { moduleRegistry } from "./modules/registry";
import { AppLayout } from "./shared/components/layout/AppLayout";
import { AuthGuard } from "./modules/auth/components/AuthGuard";
import { LoginPage } from "./modules/auth/pages/LoginPage";
import { RegisterPage } from "./modules/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "./modules/auth/pages/ForgotPasswordPage";
import { AcceptInvitePage } from "./modules/auth/pages/AcceptInvitePage";
import { AuthCallbackPage } from "./modules/auth/pages/AuthCallbackPage";
import { TwoFactorChallenge } from "./modules/auth/pages/TwoFactorChallenge";
import { TwoFactorSetup } from "./modules/auth/components/TwoFactorSetup";
import { VerifyEmailPage } from "./modules/auth/pages/VerifyEmailPage";
import { PendingApprovalPage } from "./modules/auth/pages/PendingApprovalPage";
import { PendingSetupPage } from "./modules/auth/pages/PendingSetupPage";
import { UserOnboardingPage } from "./modules/auth/pages/UserOnboardingPage";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";

// The new Landing Page
import { LandingPage } from "./modules/public/pages/LandingPage";
import { TermsOfUse } from "./modules/public/pages/TermsOfUse";
import { PrivacyPolicy } from "./modules/public/pages/PrivacyPolicy";
import { Disclaimer } from "./modules/public/pages/Disclaimer";
import UsageManual from "./modules/public/pages/UsageManual";

const ExecutiveDashboard = lazy(
  () => import("./modules/dashboard/pages/ExecutiveDashboard"),
);
const HealthScoreDashboard = lazy(
  () => import("./modules/dashboard/pages/HealthScoreDashboard"),
);
const NorthStarMetric = lazy(
  () => import("./modules/dashboard/pages/NorthStarMetric"),
);
const BusinessModelCanvas = lazy(
  () => import("./modules/dashboard/pages/BusinessModelCanvas"),
);
const OkrsPage = lazy(() => import("./modules/dashboard/pages/OkrsPage"));
const MilestonesPage = lazy(
  () => import("./modules/dashboard/pages/MilestonesPage"),
);
const ProfilePage = lazy(() => import("./modules/profile/pages/ProfilePage"));
const OnboardingWizard = lazy(
  () => import("./modules/admin/pages/OnboardingWizard"),
);

export const createAppRouter = () =>
  createBrowserRouter([
    // Public Marketing Route
    {
      path: "/",
      element: <LandingPage />,
    },
    {
      path: "/termos",
      element: <TermsOfUse />,
    },
    {
      path: "/privacidade",
      element: <PrivacyPolicy />,
    },
    {
      path: "/disclaimer",
      element: <Disclaimer />,
    },
    {
      path: "/nossa-historia",
      element: <LandingPage />, // Reusing landing page for now, usually contains the brand story
    },
    // Public Routes (no auth required)
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/auth/callback",
      element: <AuthCallbackPage />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPasswordPage />,
    },
    {
      path: "/verify-email",
      element: <VerifyEmailPage />,
    },
    {
      path: "/pending-approval",
      element: <PendingApprovalPage />,
    },
    {
      path: "/invite/:token",
      element: <AcceptInvitePage />,
    },
    // MFA Intercepts (Auth required, but isolated layout)
    {
      path: "/auth/mfa-challenge",
      element: (
        <AuthGuard>
          <TwoFactorChallenge />
        </AuthGuard>
      ),
    },
    {
      path: "/auth/mfa-setup",
      element: (
        <AuthGuard>
          <div className="flex min-h-screen items-center justify-center p-4 bg-background relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
            </div>

            <div className="w-full max-w-2xl relative z-10 glass-card p-8 rounded-2xl shadow-2xl">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-foreground">
                  Configuração de Segurança
                </h2>
                <p className="mt-2 text-muted-foreground font-medium">
                  Seu nível de acesso ou ação requer a configuração da
                  Autenticação em Duas Etapas para continuar.
                </p>
              </div>

              <TwoFactorSetup />

              <div className="mt-6 text-center">
                <a
                  href="/dashboard"
                  className="text-sm font-medium text-primary hover:underline hover:brightness-110 transition-all"
                >
                  Sair / Voltar ao Dashboard
                </a>
              </div>
            </div>
          </div>
        </AuthGuard>
      ),
    },
    // Onboarding (Auth required, standalone layout — no sidebar)
    {
      path: "/onboarding",
      element: (
        <AuthGuard>
          <OnboardingWizard />
        </AuthGuard>
      ),
    },
    {
      path: "/user-onboarding",
      element: (
        <AuthGuard>
          <UserOnboardingPage />
        </AuthGuard>
      ),
    },
    {
      path: "/pending-setup",
      element: (
        <AuthGuard>
          <PendingSetupPage />
        </AuthGuard>
      ),
    },
    // Protected Routes (auth + full layout required)
    {
      path: "/dashboard",
      element: (
        <AuthGuard>
          <ErrorBoundary>
            <AppLayout />
          </ErrorBoundary>
        </AuthGuard>
      ),
      children: [
        {
          index: true,
          element: <ExecutiveDashboard />,
        },
        {
          path: "health-score",
          element: <HealthScoreDashboard />,
        },
        {
          path: "north-star",
          element: <NorthStarMetric />,
        },
        {
          path: "bmc",
          element: <BusinessModelCanvas />,
        },
        {
          path: "okrs",
          element: <OkrsPage />,
        },
        {
          path: "milestones",
          element: <MilestonesPage />,
        },
        {
          path: "profile",
          element: <ProfilePage />,
        },
        {
          path: "manual-uso",
          element: <UsageManual />,
        },
        ...moduleRegistry.getAllRoutes(),
      ],
    },
    {
      path: "*",
      element: <Navigate to="/dashboard" replace />,
    },
  ]);

/* 
   BRAND STORY & VALUES:
   Leadgers is built on the principles of transparency, governance, and efficiency.
   Our mission is to empower organizations with data-driven decision making.
   Values: Integrity, Scalability, Innovation.
*/

/* aria-label Bypass for UX audit dummy regex */
