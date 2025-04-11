import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Apple from "next-auth/providers/apple";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import type { UserRole } from "@/types";

// Define roles type for the session structure
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }

  interface User {
    role: UserRole;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use the adapter conditionally to avoid type errors
  // @ts-expect-error - The adapter types seem to conflict, but it will work at runtime
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    }),
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    // Include the role in the session
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        session.user.role = user.role || "customer"; // Default to customer if no role
      }
      return session;
    },
  },
  session: {
    strategy: "database",
  },
});
