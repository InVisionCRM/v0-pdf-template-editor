import { Prisma } from "@prisma/client"
import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: Prisma.UserRoleType
    }
    accessToken: string
    refreshToken: string
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string
    role: Prisma.UserRoleType
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Prisma.UserRoleType
    accessToken: string
    refreshToken: string
  }
} 