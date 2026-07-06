import { lazy } from "react";
import type { ModuleConfig } from "../registry";

const TeamManagement = lazy(() =>
  import("./pages/TeamManagement").then((m) => ({ default: m.TeamManagement })),
);
const RoleManagement = lazy(() =>
  import("./pages/RoleManagement").then((m) => ({ default: m.RoleManagement })),
);
const TenantSettings = lazy(() =>
  import("./pages/TenantSettings").then((m) => ({ default: m.TenantSettings })),
);
const BillingManagement = lazy(() =>
  import("./pages/BillingManagement").then((m) => ({
    default: m.BillingManagement,
  })),
);
const ProjectsListPage = lazy(() =>
  import("../projects/pages/ProjectsListPage").then((m) => ({
    default: m.ProjectsListPage,
  })),
);
const ProjectDetailsPage = lazy(() =>
  import("../projects/pages/ProjectDetailsPage").then((m) => ({
    default: m.ProjectDetailsPage,
  })),
);

const adminModule: ModuleConfig = {
  id: "admin",
  name: "Administrar Sistema",
  description: "Gestão de equipe, projetos, funções e configurações da empresa",
  icon: "Settings",
  version: "1.0.0",
  permissions: [
    "admin.manage",
    "team.manage",
    "projects.view",
    "projects.manage",
  ],
  routes: [
    {
      path: "admin/team",
      element: <TeamManagement />,
    },
    {
      path: "projects",
      element: <ProjectsListPage />,
    },
    {
      path: "projects/:id",
      element: <ProjectDetailsPage />,
    },
    {
      path: "admin/roles",
      element: <RoleManagement />,
    },
    {
      path: "admin/settings",
      element: <TenantSettings />,
    },
    {
      path: "admin/billing",
      element: <BillingManagement />,
    },
  ],
  navigation: [
    { label: "Gerenciar Equipe", path: "admin/team", icon: "Users" },
    { label: "Gerenciar Projetos", path: "projects", icon: "Briefcase" },
    { label: "Definir Funções", path: "admin/roles", icon: "Shield" },
    {
      label: "Ajustar Configurações",
      path: "admin/settings",
      icon: "Settings",
    },
    {
      label: "Faturamento e Assinatura",
      path: "admin/billing",
      icon: "CreditCard",
    },
  ],
  settings: {},
};

export default adminModule;
