// lib/supabase.ts
// Server-only Supabase client. Uses the secret key (full DB/Storage access)
// since every caller is a Server Component or Server Action, never the
// browser — there is no client-side Supabase usage in this app.
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variables");
}

export const supabase = createClient(url, secretKey);

export const MEDIA_BUCKET = "media";
