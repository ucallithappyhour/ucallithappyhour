import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xrrowiwkhbfvvnsepgjk.supabase.co";
const supabaseAnonKey = "sb_publishable_GFuhKC74LWarBEHj_b_D1w_mRoj4zYa";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
