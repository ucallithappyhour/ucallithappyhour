import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xrrowiwkhbfvvnsepgjk.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhycm93aXdraGJmdnZuc2VwZ2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMjMzOTAsImV4cCI6MjA5NjY5OTM5MH0.HsSIKm6OVuv5jTFDuPJ0luu4qBlcXMqCHEolATiiq3g";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);