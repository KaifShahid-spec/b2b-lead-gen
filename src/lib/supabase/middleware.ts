import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  let response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // 1. Read environment variables (No hardcoded secrets!)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase environment variables in middleware.");
    return response;
  }

  // 2. Create Supabase Client
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: { headers: requestHeaders },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let user = null;

  // 3. Safely get user (prevents build crashes if Supabase is paused)
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error("⚠️ Middleware auth check failed:", error);
    return response; // Let the request pass through if auth fails
  }

  const url = request.nextUrl.clone();

  // 4. Define Route Types
  const isAuthRoute =
    url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/signup") ||
    url.pathname.startsWith("/forgot-password") ||
    url.pathname.startsWith("/reset-password") ||
    url.pathname.startsWith("/verify-email");

  const isProtectedRoute =
    url.pathname.startsWith("/dashboard") ||
    url.pathname.startsWith("/leads") ||
    url.pathname.startsWith("/campaigns") ||
    url.pathname.startsWith("/settings") ||
    url.pathname.startsWith("/onboarding");

  // 5. Redirect Unauthenticated Users away from Protected Routes
  if (!user && isProtectedRoute) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 6. Redirect Authenticated Users away from Auth Routes (Login/Signup)
  if (user && isAuthRoute) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 7. Onboarding Guard (Only applies to protected routes)
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from("users")
      .select("onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    const completed = profile?.onboarding_completed === true;
    const isOnboardingRoute = url.pathname.startsWith("/onboarding");

    // If they haven't finished onboarding, force them to the wizard
    if (!completed && !isOnboardingRoute) {
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }

    // If they HAVE finished onboarding, don't let them go back to the wizard
    if (completed && isOnboardingRoute) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  // 🌟 8. HOMEPAGE FIX: 
  // If a logged-in user visits the homepage (/), let them see it.
  // Do not redirect them. The code will naturally fall through to `return response;`
  // at the bottom, which serves the marketing page.

  return response;
}