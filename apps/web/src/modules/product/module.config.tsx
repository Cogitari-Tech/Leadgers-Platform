// apps/web/src/modules/product/module.config.tsx
import { lazy } from "react";
import type { ModuleConfig } from "../registry";

const RoadmapKanban = lazy(() => import("./pages/RoadmapKanban"));

export const productModuleConfig: ModuleConfig = {
  id: "product",
  name: "Gestão de Produto",
  description:
    "Roadmap visual do produto com Kanban, integração GitHub e vínculo com OKRs",
  icon: "KanbanSquare",
  version: "1.0.0",

  permissions: [
    "product.view",
    "product.create",
    "product.edit",
    "product.delete",
  ],

  routes: [
    {
      path: "product/roadmap",
      element: <RoadmapKanban />,
      handle: { title: "Roadmap" },
    },
  ],

  navigation: [
    {
      label: "Roadmap",
      path: "product/roadmap",
      icon: "KanbanSquare",
    },
  ],

  settings: {},

  onModuleLoad: async () => {
    console.log("✅ Gestão de Produto carregada");
  },

  onModuleUnload: async () => {
    console.log("🔌 Gestão de Produto descarregada");
  },
};

export default productModuleConfig;
