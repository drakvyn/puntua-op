import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Routes requiring authentication — checked before role
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/admin"];

// Routes only for guests
const GUEST_ROUTES = ["/auth/login", "/auth/register"];

// Role-restricted routes: only these roles can access
const ROLE_ROUTES = [
  { prefix: "/admin", allowed: ["admin"] },
  { prefix: "/dashboard", allowed: ["user", "admin"] }, 
  {prefix: "/user", allowed: ["user"]}
];
// Where each role lands after login
const ROLE_HOME: Record<string, string> = {
  admin: "/dashboards/admin",
  store: "/dashboards/store",
  user: "/dashboard/user",
};

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;
  const role = session?.user?.role;

  const isProtected = PROTECTED_ROUTES.some((p) => nextUrl.pathname.startsWith(p));
  const isGuestOnly = GUEST_ROUTES.some((p) => nextUrl.pathname.startsWith(p));

  // Not logged in → redirect to login
  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in → redirect to role home
  if (isGuestOnly && isLoggedIn && role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/dashboard", nextUrl.origin));
  }

  // Role check — wrong role for this section
  if (isLoggedIn && role) {
    const restricted = ROLE_ROUTES.find((r) => nextUrl.pathname.startsWith(r.prefix));
    if (restricted && !restricted.allowed.includes(role)) {
      return NextResponse.redirect(new URL(ROLE_HOME[role] ?? "/dashboard", nextUrl.origin));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};