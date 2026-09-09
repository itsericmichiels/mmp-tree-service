// proxy.ts
// Gates every /admin/* route behind a signed session cookie so the CMS isn't
// a public URL. /admin/login itself is left open, obviously — otherwise
// nobody could ever log in.
//
// Named `proxy.ts` (not `middleware.ts`) per this Next.js version's renamed
// file convention — see node_modules/next/dist/docs/01-app/03-api-reference/
// 03-file-conventions/proxy.md.
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (await verifySessionToken(token)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
