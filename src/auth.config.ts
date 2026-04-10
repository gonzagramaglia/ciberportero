import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"

export default {
  providers: [Google],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    },
    redirect({ url, baseUrl }) {
      // Allow relative URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Allow same-origin URLs
      try {
        if (new URL(url).origin === baseUrl) return url
      } catch {}
      return baseUrl
    },
  },
} satisfies NextAuthConfig
