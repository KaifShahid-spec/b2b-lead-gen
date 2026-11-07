import { createBrowserClient } from "@supabase/ssr";

function getRequiredEnvValue(primary: string | undefined, fallback: string | undefined, name: string) {
  const value = primary ?? fallback;

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

const supabaseUrl = getRequiredEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL, undefined, "NEXT_PUBLIC_SUPABASE_URL");
const supabaseKey = getRequiredEnvValue(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
);

export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
