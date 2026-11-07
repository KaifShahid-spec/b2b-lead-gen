import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export async function createSupabaseServerClient(cookieStore?: CookieStore) {
  const resolvedCookieStore = cookieStore ?? (await cookies());

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return resolvedCookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            resolvedCookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always set cookies directly.
        }
      }
    }
  });
}
