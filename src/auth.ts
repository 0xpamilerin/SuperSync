import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/db"
import { authConfig } from "./auth.config"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }
          
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string }
          })
          
          if (!user) {
            return null
          }
          
          // Compare hash with the provided password
          const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password)
          
          if (!isPasswordValid) {
            return null
          }
          
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
