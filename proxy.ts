import { auth } from '@/src/lib/auth'
import { NextResponse } from 'next/server'

const protectedPaths = ['/dashboard', '/candidates', '/positions', '/settings']
const authPaths = ['/login', '/register']

export default auth(function proxy(req) {
  const path = req.nextUrl.pathname
  const isProtected = protectedPaths.some((p) => path.startsWith(p))
  const isAuthPage = authPaths.includes(path)

  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isAuthPage && req.auth) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
