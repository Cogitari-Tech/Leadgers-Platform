import React, { useState, useRef, useEffect } from "react";
import { useTenant } from "../../../modules/auth/context/TenantContext";
import { Building, ChevronDown, Check, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TenantSwitcher: React.FC = () => {
  const { tenant, availableTenants, switchTenant } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!tenant || availableTenants.length <= 1) return null;

  const handleSwitch = async (targetTenantId: string) => {
    if (targetTenantId === tenant.id) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    setIsOpen(false);

    const { error } = await switchTenant(targetTenantId);

    setIsSwitching(false);

    if (!error) {
      // Force navigation to dashboard home on tenant switch
      navigate("/dashboard", { replace: true });
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors"
      >
        <Building className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium hidden sm:inline-block max-w-[120px] truncate">
          {isSwitching ? "Trocando..." : tenant.name}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-popover border border-border/50 rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border/20 uppercase tracking-wider">
            Suas Empresas
          </div>
          <div className="max-h-[300px] overflow-y-auto py-1 custom-scrollbar">
            {availableTenants.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSwitch(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left ${
                  t.id === tenant.id
                    ? "bg-primary/5 text-primary"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center">
                  <Briefcase
                    className={`w-4 h-4 ${t.id === tenant.id ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{t.name}</p>
                  {t.id === tenant.id && (
                    <p className="text-[10px] uppercase">Empresa Atual</p>
                  )}
                </div>
                {t.id === tenant.id && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
