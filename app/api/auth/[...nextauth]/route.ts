// =============================================================================
// FILE: app/api/auth/[...nextauth]/route.ts
// PURPOSE:
//   Registers NextAuth's built-in HTTP handlers at the URL path
//   /api/auth/*  — this single file handles ALL authentication endpoints:
//
//     GET  /api/auth/session       — returns the current user session
//     GET  /api/auth/csrf          — CSRF token for form submissions
//     GET  /api/auth/providers     — lists configured providers (email, Google, etc.)
//     POST /api/auth/callback/credentials — processes the login form
//     GET  /api/auth/signout       — logs the user out
//
//   You never need to build these endpoints yourself — NextAuth handles them
//   all. The configuration for what happens at each endpoint lives in
//   app/lib/auth.ts.
//
// TO ACTIVATE:
//   Step 1: Install NextAuth:
//           npm install next-auth@beta
//   Step 2: Complete the setup in app/lib/auth.ts
//   Step 3: This file needs NO changes — it just re-exports the handlers.
//
// NO FURTHER CHANGES NEEDED TO THIS FILE.
// =============================================================================

import { handlers } from "@/app/lib/auth";

export const { GET, POST } = handlers;
