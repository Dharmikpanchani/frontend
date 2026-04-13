import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const host = req.headers.get("host") || "";
  const pathname = url.pathname;
  const token = req.cookies.get("auth_token")?.value;

  // 1. Define Route Types
  const isPublicRoute = 
    pathname === "/" || 
    pathname === "/login" || 
    pathname.startsWith("/login/otp") || 
    pathname.startsWith("/forgot-password");

  // Avoid redirect loops for static assets
  if (pathname.startsWith("/_next") || pathname.includes(".") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 2. Auth Protection Logic
  if (!token && !isPublicRoute) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (token && (pathname === "/login" || pathname === "/login/otp")) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 3. Subdomain Rewriting Logic
  const isLocal = host.includes("localhost") || host.includes("lvh.me");
  let subdomain = "";
  if (isLocal) {
    if (host.includes("lvh.me")) {
      subdomain = host.split(".lvh.me")[0];
    }
  } else {
    const mainDomain = process.env.NEXT_PUBLIC_END_WITH_DOMAIN || "appworkdemo.com";
    if (host.includes(mainDomain) && host !== mainDomain) {
        subdomain = host.split(`.${mainDomain}`)[0];
    }
  }

  if (subdomain && subdomain !== "www") {
    url.pathname = `/school${pathname}`;
  } else {
    url.pathname = `/developer${pathname}`;
  }

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
