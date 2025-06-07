import { AuthOptions } from "next-auth"
import NextAuth from "next-auth/next"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db/prisma"
// import { GOOGLE_CALENDAR_CONFIG } from "@/lib/config/google-calendar"
import { GOOGLE_SCOPES } from "@/lib/constants"
import { Prisma } from "@prisma/client"

// Define all required Google Calendar scopes
const GOOGLE_SCOPES_JOINED = GOOGLE_SCOPES.join(" ")

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
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
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;
      
      try {
        // Create or update user with proper name and role
        await prisma.user.upsert({
          where: { email: user.email },
          update: {},
          create: {
            email: user.email,
            name: user.name || profile?.name || user.email,
            role: "USER",
            image: user.image || null
          },
        });
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, account, user }) {
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
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    // error: '/auth/error', // Optional: specify a custom error page
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined, // Set if using subdomains
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
