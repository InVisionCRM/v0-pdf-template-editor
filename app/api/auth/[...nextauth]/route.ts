import { AuthOptions } from "next-auth"
import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
// import { GOOGLE_CALENDAR_CONFIG } from "@/lib/config/google-calendar"
import { GOOGLE_SCOPES } from "@/lib/constants"
import { PrismaClient } from "@prisma/client"
import type { Adapter } from "next-auth/adapters"

const UserRole = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  USER: 'USER'
} as const

// Define all required Google Calendar scopes
const GOOGLE_SCOPES_JOINED = GOOGLE_SCOPES.join(" ")

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: GOOGLE_SCOPES_JOINED,
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('SignIn callback triggered:', { user: user?.email, account: account?.provider })
      }
      
      if (!user.email) {
        console.error('SignIn failed: No email provided')
        return false;
      }
      
      try {
        // Create or update user with proper name and role
        const dbUser = await prisma.user.upsert({
          where: { email: user.email },
          update: {
            name: user.name || profile?.name || user.email,
            image: user.image || null
          },
          create: {
            email: user.email,
            name: user.name || profile?.name || user.email,
            role: UserRole.USER,
            image: user.image || null
          },
        });
        
        if (process.env.NODE_ENV === 'development') {
          console.log('User created/updated successfully:', dbUser.email)
        }
        
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, account, user }) {
      if (process.env.NODE_ENV === 'development' && account) {
        console.log('JWT callback triggered for user:', user?.email)
      }
      
      if (account && user) {
        token.accessToken = account.access_token || "";
        token.refreshToken = account.refresh_token || "";
        token.id = user.id;

        try {
          // Get user from database to check role
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
          });
          
          if (dbUser) {
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("Error in jwt callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Handle JWT decryption errors gracefully
      try {
        if (session.user) {
          session.user.id = token.id;
          session.user.role = token.role;
          session.accessToken = token.accessToken;
          session.refreshToken = token.refreshToken;
        }
        return session;
      } catch (error) {
        console.error("Session callback error:", error);
        // Return empty session with undefined user to prevent crashes
        return {
          ...session,
          user: undefined
        };
      }
    },
    async redirect({ url, baseUrl }) {
      // Handles redirect on signin
      if (process.env.NODE_ENV === 'development') {
        console.log('Redirect callback:', { url, baseUrl })
      }
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Clear existing cookies by setting a new cookie with same name
        maxAge: process.env.NODE_ENV === 'production' ? 30 * 24 * 60 * 60 : 24 * 60 * 60, // 30 days prod, 1 day dev
      },
    },
  },
  // Add error handling for JWT issues
  events: {
    async signOut({ token }) {
      // Clear any problematic tokens
      if (process.env.NODE_ENV === 'development') {
        console.log('User signed out, clearing token')
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
