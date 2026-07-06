import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const API_URL = import.meta.env.VITE_API_URL;

if (!supabaseUrl || !supabaseAnonKey || (import.meta.env.PROD && !API_URL)) {
  console.error(
    "CRITICAL: Required environment variables are missing. Check your .env file.",
  );
  console.error(
    "Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and VITE_API_URL (in PROD)",
  );

  if (import.meta.env.PROD) {
    throw new Error(
      "Missing required environment variables in production environment.",
    );
  }
}

// Fallback for development to avoid crash, but client will fail on requests
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
);
