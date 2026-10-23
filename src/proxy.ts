import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { resolveAccess } from "@/lib/auth/protected-routes";
import { DEMO_COOKIE, isDemoCookieValue, isDemoEnvEnabled } from "@/lib/auth/demo";
import { getSupabasePublishableKey, isSupabaseConfigured } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const demoQuery = searchParams.get("demo") === "1";

  const access = resolveAccess({
    pathname,
    supabaseConfigured: isSupabaseConfigured(),
    demoEnv: isDemoEnvEnabled(),
    demoCookie: demoQuery || isDemoCookieValue(request.cookies.get(DEMO_COOKIE)?.value),
  });

  if (access === "pass") {
    const response = NextResponse.next();
    if (demoQuery) {
      response.cookies.set(DEMO_COOKIE, "1", {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
    }
    return response;
  }

  const response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabasePublishableKey()!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/learn/:path*",
    "/practice/:path*",
    "/challenges/:path*",
    "/rankings/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/path/:path*",
    "/review/:path*",
    "/achievements/:path*",
    "/arena/:path*",
    "/wrapped/:path*",
  ],
};
