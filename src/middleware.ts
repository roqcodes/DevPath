import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isProtectedPath } from "@/lib/auth/protected-routes";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    login.searchParams.set("error", "auth_not_configured");
    return NextResponse.redirect(login);
  }

  const response = NextResponse.next();
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

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
  ],
};
