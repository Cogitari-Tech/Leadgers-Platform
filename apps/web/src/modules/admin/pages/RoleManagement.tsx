import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";
import type { Role } from "../../auth/types/auth.types";
import { ShieldCheck, Lock, Users, ChevronRight } from "lucide-react";

interface RoleWithPermissions extends Role {
  permissions: string[];
}

type RolePermissionRow = {
  role_id: string;
  permission?: { code: string }[];
};

export function RoleManagement() {
  const { tenant } = useAuth();
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant) return;

    const fetchData = async () => {
      // Fetch roles for this tenant (+ system roles)
      const { data: rolesData } = await supabase
        .from("roles")
        .select("*")
        .or(`tenant_id.eq.${tenant.id},tenant_id.is.null`)
        .order("hierarchy_level", { ascending: false });

      // Fetch all permissions
      // Fetch all permissions (unused but kept for reference)
      // const { data: permsData } = await supabase
      //   .from("permissions")
      //   .select("*")
      //   .order("module");

      // Fetch role-permission mappings
      const roleIds = rolesData?.map((r: { id: string }) => r.id) ?? [];
      const { data: rpData } = await supabase
        .from("role_permissions")
        .select("role_id, permission:permissions(code)")
        .in("role_id", roleIds);

      // Build role-permissions map
      const permMap = new Map<string, string[]>();
      rpData?.forEach((rp: RolePermissionRow) => {
        const codes = permMap.get(rp.role_id) ?? [];
        const permissionCodes = (rp.permission ?? []).map((p) => p.code);
        permMap.set(rp.role_id, [...codes, ...permissionCodes]);
      });

      const enrichedRoles: RoleWithPermissions[] = (rolesData ?? []).map(
        (r: Role) => ({
          ...r,
          permissions: permMap.get(r.id) ?? [],
        }),
      );

      setRoles(enrichedRoles);
      // setAllPermissions(permsData ?? []); // We don't use it yet in this view
      setLoading(false);
    };

    fetchData();
  }, [tenant]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-foreground font-display flex items-center gap-4">
            <ShieldCheck className="w-10 h-10 text-primary" />
            Matriz de Acesso
          </h1>
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest opacity-60">
            Governança de permissões e hierarquia de privilégios
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 rounded-2xl bg-primary/10 border border-primary/20 shadow-sm">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Ambiente de Alta Segurança
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="bg-muted/30 border-b border-border/40 px-10 py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Lock className="w-5 h-5 text-muted-foreground/40" />
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">
              Estrutura de Cargos & Funções
            </h2>
          </div>
          <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
            Total de {roles.length} Níveis Detectados
          </p>
        </div>

        {loading ? (
          <div className="p-24 flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl border-4 border-primary/10 border-t-primary animate-spin shadow-xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">
              Mapeando Permissões
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {roles.map((role, idx) => (
              <div
                key={role.id}
                className="group relative px-10 py-10 hover:bg-primary/[0.02] transition-all duration-500 animate-in fade-in slide-in-from-left-8"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-10">
                  <div className="flex-1 min-w-[300px] space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-background/50 border border-border/60 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6 text-primary/40 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                          {role.display_name}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
                          Identificador: {role.name}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">
                      {role.description ||
                        "Nenhuma descrição estratégica para este nível de acesso."}
                    </p>
                  </div>

                  <div className="lg:w-48 flex flex-col items-center lg:items-start gap-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 ml-1">
                      Nível de Auditoria
                    </span>
                    <div className="flex items-center gap-1.5 bg-background/50 px-5 py-3 rounded-2xl border border-border/40 shadow-inner group-hover:border-primary/20 transition-all">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full shadow-sm ${
                            i < Math.ceil((role.hierarchy_level || 0) / 20)
                              ? "bg-primary animate-in zoom-in"
                              : "bg-muted/20"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:w-[400px] justify-start lg:justify-end">
                    <span className="w-full text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 text-left lg:text-right mb-1 px-1">
                      Privilégios Ativos
                    </span>
                    {role.permissions && role.permissions.length > 0 ? (
                      role.permissions.map((p: string) => (
                        <div
                          key={p}
                          className="px-4 py-2 rounded-xl bg-muted/20 border border-border/40 text-[10px] font-black tracking-widest text-muted-foreground/60 group-hover:bg-primary/5 group-hover:border-primary/20 group-hover:text-primary transition-all flex items-center gap-2"
                        >
                          <div className="w-1 h-1 rounded-full bg-current opacity-40" />
                          {p.replace(/_/g, " ").toUpperCase()}
                        </div>
                      ))
                    ) : (
                      <span className="text-[10px] italic text-muted-foreground/30 font-bold uppercase tracking-widest px-1">
                        Acesso Restrito / Visualização
                      </span>
                    )}
                  </div>
                </div>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-4">
                  <ChevronRight className="w-6 h-6 text-primary/20" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="py-16 flex flex-col items-center gap-6 opacity-30 mt-12">
        <div className="h-px w-48 bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="text-[11px] font-black uppercase tracking-[0.6em] text-muted-foreground text-center">
          Leadgers Cyber-Governance Matrix v2.1
        </p>
      </div>
    </div>
  );
}
