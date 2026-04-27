// =============================================================================
// FILE: app/lib/auth.ts
// PURPOSE:
//   Configures NextAuth.js — the authentication library that handles login,
//   sessions, and protecting routes. This is the central auth config that
//   every part of the app references.
//
// HOW IT WORKS:
//   1. User submits email + password on /login
//   2. The "authorize" function here checks the DB for a matching user
//   3. It uses bcrypt to safely compare the submitted password against the
//      hashed password stored in the DB (passwords are NEVER stored in plain text)
//   4. If valid, NextAuth creates a signed JWT (token) and stores it in a
//      secure HTTP-only cookie — the user is now "logged in"
//   5. The jwt() callback adds restaurantId + role to the token
//   6. The session() callback exposes those values to the frontend
//   7. Any API route can call auth() to get the current session
//
// EXPORTS:
//   handlers  — used in app/api/auth/[...nextauth]/route.ts
//   auth      — call in API routes to get the current session: const session = await auth()
//   signIn    — call in server actions to log in programmatically
//   signOut   — call to log out
//
// TO ACTIVATE:
//   Step 1: Install packages:
//           npm install next-auth@beta bcryptjs
//           npm install -D @types/bcryptjs
//   Step 2: Set these in .env.local:
//           NEXTAUTH_SECRET=  (generate: openssl rand -base64 32)
//           NEXTAUTH_URL=http://localhost:3000
//   Step 3: Make sure prisma/schema.prisma User model is migrated
//   Step 4: The login page (app/(auth)/login/page.tsx) calls signIn() —
//           uncomment the real signIn block in that file
//
// NO FURTHER CHANGES NEEDED unless you want to add Google/GitHub OAuth.
// To add Google OAuth: add a GoogleProvider() entry to the providers array
// and set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in .env.local
// =============================================================================
//
// Add to app/api/auth/[...nextauth]/route.ts:
//   import { handlers } from "@/app/lib/auth";
//   export const { GET, POST } = handlers;

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { restaurant: true },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
          restaurantId: user.restaurantId,
          restaurantName: user.restaurant.name,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.restaurantId = (user as any).restaurantId;
        token.restaurantName = (user as any).restaurantName;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).restaurantId = token.restaurantId;
      (session.user as any).restaurantName = token.restaurantName;
      (session.user as any).role = token.role;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: { strategy: "jwt" },
});
