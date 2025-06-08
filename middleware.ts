import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req) {
  const token = await getToken({ req })
  const { pathname } = req.nextUrl

  // Allow auth-related API calls and the sign-in/error pages
  if (
    pathname.startsWith('/api/auth') ||
    pathname === '/auth/signin' ||
    pathname === '/auth/error'
  ) {
    return NextResponse.next()
  }

  // If no token, redirect to the sign-in page
  if (!token) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // If token exists, allow the request to proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (images, fonts, etc.)
     *
     * This ensures the middleware runs on all pages and API routes
     * that require authentication.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
