import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xrrowiwkhbfvvnsepgjk.supabase.co";

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);