import { NextRequest, NextResponse } from "next/server"

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get("jopad_token")?.value

  const isPublic =
    pathname === "/" || pathname === "/login" || pathname === "/set-password"
  const isProtected =
    pathname.startsWith("/dashboard") || pathname.startsWith("/set-password")

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
