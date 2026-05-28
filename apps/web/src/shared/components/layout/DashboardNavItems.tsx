import React from "react";
import { Link, useLocation } from "react-router-dom";
import * as LucideIcons from "lucide-react";

interface NavItemProps {
  isCollapsed: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const DashboardNavItems: React.FC<NavItemProps> = ({
  isCollapsed,
  setIsMobileMenuOpen,
}) => {
  const location = useLocation();

  const items = [
    {
      to: "/dashboard/health-score",
      icon: LucideIcons.HeartPulse,
      label: "Health Score",
    },
    {
      to: "/dashboard/north-star",
      icon: LucideIcons.Sparkles,
      label: "North Star",
    },
    {
      to: "/dashboard/bmc",
      icon: LucideIcons.LayoutDashboard,
      label: "Business Model Canvas",
    },
    { to: "/dashboard/okrs", icon: LucideIcons.Target, label: "OKRs" },
    {
      to: "/dashboard/milestones",
      icon: LucideIcons.Flag,
      label: "Milestones",
    },
  ];

  return (
    <>
      {!isCollapsed && (
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/40">
          Estratégia
        </div>
      )}

      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          aria-label={item.label}
          onClick={() => setIsMobileMenuOpen(false)}
          className={`group flex items-center px-3 py-2 text-[13px] font-medium transition-all rounded-lg ${
            location.pathname === item.to
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted/50"
          } ${isCollapsed ? "justify-center" : ""}`}
        >
          <item.icon className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3 truncate">{item.label}</span>}
        </Link>
      ))}
    </>
  );
};
