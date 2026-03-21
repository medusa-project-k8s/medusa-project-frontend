import { NextRequest, NextResponse } from "next/server"

/**
 * Region map / Medusa fetch in middleware is disabled.
 * Only `/` redirects to `/{NEXT_PUBLIC_DEFAULT_REGION}` (default `eu`) so `[countryCode]` routes work.
 */
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "eu"

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (pathname === "/" || pathname === "") {
    return NextResponse.redirect(
      new URL(`/${DEFAULT_REGION}${search}`, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
