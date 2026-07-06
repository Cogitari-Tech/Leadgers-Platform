import { useState, useCallback, useEffect } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";

export interface TenantMemberOption {
  id: string;
  name: string;
  email: string;
  role: string;
}

export function useTenantMembers() {
  const { tenant } = useAuth();
  const [members, setMembers] = useState<TenantMemberOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMembers = useCallback(async () => {
    if (!tenant?.id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("tenant_members")
        .select(
          `
          id,
          role:roles(name, display_name),
          user:users!tenant_members_user_id_fkey(
            email,
            raw_user_meta_data
          )
        `,
        )
        .eq("tenant_id", tenant.id)
        .eq("status", "active");

      if (error) throw error;

      const mapped: TenantMemberOption[] = (data ?? []).map((m: any) => ({
        id: m.id,
        name:
          m.user?.raw_user_meta_data?.name ||
          m.user?.email?.split("@")[0] ||
          "Sem Nome",
        email: m.user?.email || "",
        role: m.role?.display_name || m.role?.name || "Membro",
      }));

      setMembers(mapped);
    } catch (err) {
      console.error("Error fetching tenant members:", err);
    } finally {
      setLoading(false);
    }
  }, [tenant?.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, loading, refresh: fetchMembers };
}
