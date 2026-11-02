import { NextRequest, NextResponse } from "next/server";
import { fetchAuthSession } from "aws-amplify/auth/server";
import { runWithAmplifyServerContext } from "@/lib/amplify/server";

/**
 * Route protection proxy for ivyshop International.
 *
 * - /admin/* → requires "Administradores" Cognito group → 403 + redirect to / if not authorized
 * - /checkout → requires authentication → redirect to /auth/login if not authenticated
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires protection
  const isAdminRoute = pathname.startsWith("/admin");
  const isCheckoutRoute = pathname.startsWith("/checkout");

  if (!isAdminRoute && !isCheckoutRoute) {
    return NextResponse.next();
  }

  try {
    // Get auth session in server context
    const session = await runWithAmplifyServerContext({
      nextServerContext: { request, response: NextResponse.next() },
      operation: (contextSpec) => fetchAuthSession(contextSpec),
    });

    const isAuthenticated =
      session.tokens?.accessToken !== undefined;

    // Not authenticated at all
    if (!isAuthenticated) {
      if (isAdminRoute) {
        // Admin: redirect to home with 403
        const response = NextResponse.redirect(new URL("/", request.url));
        response.headers.set("x-middleware-status", "403");
        return response;
      }
      if (isCheckoutRoute) {
        // Checkout: redirect to login preserving return URL
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Authenticated — check admin group for admin routes
    if (isAdminRoute) {
      const groups: string[] =
        (session.tokens?.accessToken?.payload?.["cognito:groups"] as string[]) ?? [];

      const isAdmin = groups.includes("Administradores");

      if (!isAdmin) {
        // Authenticated but not admin → redirect to home (403)
        const response = NextResponse.redirect(new URL("/", request.url));
        response.headers.set("x-middleware-status", "403");
        return response;
      }
    }

    return NextResponse.next();
  } catch {
    // On any auth error, treat as unauthenticated
    if (isAdminRoute) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (isCheckoutRoute) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/checkout",
  ],
};
