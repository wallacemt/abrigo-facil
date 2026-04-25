import { createClient } from "@supabase/supabase-js";
export const SUPABASE_AVATAR_BUCKET = "avatars";

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Variáveis SUPABASE_URL e SUPABASE_ANON_KEY são obrigatórias.");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
