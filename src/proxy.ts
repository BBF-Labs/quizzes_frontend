import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
 
  // Allow the home page, static files, images, and API routes
  if (
    pathname === '/' ||
    pathname.includes('.') || // Static files like favicon.ico, images, etc.
    pathname.startsWith('/_next') || // Next.js internal files
    pathname.startsWith('/api') || // Backend API routes
    pathname.startsWith('/assets') // Static assets
  ) {
    return NextResponse.next()
  }
 
  // Redirect all other paths to the home page
  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  // Apply middleware to all paths except those matched by the internal Next.js exclusion rules
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
