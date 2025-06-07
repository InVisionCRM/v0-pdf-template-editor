import { UserRole } from "@/lib/generated/prisma"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: UserRole
    }
    accessToken: string
    refreshToken: string
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    accessToken: string
    refreshToken: string
  }
} 