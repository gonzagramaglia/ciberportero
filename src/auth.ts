import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
// import { PrismaAdapter } from "@auth/prisma-adapter"
// import { db } from "@/lib/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  // adapter: PrismaAdapter(db),
  providers: [Google],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
