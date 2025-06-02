import { NextResponse } from 'next/server'

// List of protected routes
const protectedRoutes = ['/dashboard', '/items', '/invoices', '/profile']

export function middleware(request) {
  debugger
  console.log('Middleware running:', request.nextUrl.pathname)

  const { pathname } = request.nextUrl
  const userId = request.cookies.get('user_id')?.value

  // Redirect to /login if user is not authenticated
  if (protectedRoutes.some(route => pathname.startsWith(route)) && !userId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// 👇 This is where you add the config block
export const config = {
  matcher: ['/dashboard/:path*', '/items/:path*', '/invoices/:path*', '/profile/:path*']
}
