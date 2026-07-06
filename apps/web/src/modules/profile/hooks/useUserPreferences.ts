import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../config/supabase";
import { useAuth } from "../../auth/context/AuthContext";

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: string;
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_in_app: boolean;
}

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setPreferences({
          language: data.language,
          timezone: data.timezone,
          theme: data.theme,
          notifications_email: data.notifications_email,
          notifications_push: data.notifications_push,
          notifications_in_app: data.notifications_in_app,
        });
      } else {
        // Create default preferences if they don't exist
        const defaultPrefs: UserPreferences = {
          language: "pt-BR",
          timezone: "America/Sao_Paulo",
          theme: "dark",
          notifications_email: true,
          notifications_push: true,
          notifications_in_app: true,
        };

        const { error: insertError } = await supabase
          .from("user_preferences")
          .insert({ user_id: user.id, ...defaultPrefs });

        if (insertError) {
          console.error("Failed to create default preferences:", insertError);
        } else {
          setPreferences(defaultPrefs);
        }
      }
    } catch (err) {
      console.error("Preferences fetch error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      if (!user) return;
      setSaving(true);
      try {
        const { error: updateError } = await supabase
          .from("user_preferences")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (updateError) throw updateError;

        setPreferences((prev) => (prev ? { ...prev, ...updates } : null));
        return { success: true };
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        return { success: false, error: err };
      } finally {
        setSaving(false);
      }
    },
    [user],
  );

  return {
    preferences,
    loading,
    saving,
    error,
    updatePreferences,
    refresh: fetchPreferences,
  };
}
