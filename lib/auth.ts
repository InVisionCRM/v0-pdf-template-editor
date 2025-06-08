// Extend next-auth types
declare module "next-auth" {
    interface Session {
      user: {
        id: string;
        name: string | null;
        email: string | null;
        role: string | null;
        image?: string | null;
      };
      accessToken: string | null;
      refreshToken: string | null;
    }
  
    interface User {
      id: string;
      name: string | null;
      email: string | null;
      role: string | null;
      image?: string | null;
    }
  }
  
  export { authOptions } from '@/app/api/auth/[...nextauth]/route';
  
  // export const authOptions: NextAuthOptions = { ... }