import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/db"
import { authConfig } from "./auth.config"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET || "supersync-mock-frontend-secret-key-12345",
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.email) {
            return null
          }

          const emailInput = (credentials.email as string).trim().toLowerCase()

          // Check against in-memory mock users
          const user = await prisma.user.findFirst({
            where: { email: emailInput }
          })

          if (!user) {
            console.warn(`[Mock Auth] User with email "${emailInput}" not found in mock store.`)
            return null
          }

          // In mock frontend mode, accept any password or password123
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("Authorize error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  }
})
