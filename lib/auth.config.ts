import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/sign-in',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard')
      const isAuthRoute =
        nextUrl.pathname === '/sign-in' || nextUrl.pathname === '/sign-up'

      if (isProtectedRoute && !isLoggedIn) return false
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl))
      }
      return true
    },
  },
}