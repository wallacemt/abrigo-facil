import { createClient } from "@supabase/supabase-js";
export const SUPABASE_AVATAR_BUCKET = process.env.SUPABASE_AVATAR_BUCKET;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
}

// Server-side client using the service role key (bypasses RLS).
// Never expose this client or its key to the browser.
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
