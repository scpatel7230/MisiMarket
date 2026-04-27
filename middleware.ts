// =============================================================================
// FILE: middleware.ts  (must stay in the project ROOT, not inside app/)
// PURPOSE:
//   Acts as a security gate that runs before EVERY page request.
//   Its job is to check if the user is logged in and redirect them to /login
//   if they're not. This protects the entire dashboard from unauthenticated access.
//
// HOW IT WORKS (once activated):
//   - Next.js runs this file's default export on every matched route
//   - auth() checks the JWT cookie (set by NextAuth on login)
//   - If no valid session exists AND the user is not already on /login or /register,
//     they are 302-redirected to /login
//   - Auth pages (/login, /register) are excluded from the check so users
//     can still reach the login form when not authenticated
//
// CURRENT STATE: The real auth check is commented out. Currently it just passes
//   all requests through (NextResponse.next()) so the app works without auth.
//
// TO ACTIVATE:
//   Step 1: Install next-auth:
//           npm install next-auth@beta
//   Step 2: Complete setup in app/lib/auth.ts
//   Step 3: In this file:
//           - Delete the temporary middleware() function (marked STEP 2)
//           - Uncomment the auth() import and the real export default auth(...) block
//             (marked STEP 1)
//
// IMPORTANT: This file MUST stay at the project root (same level as package.json).
//   Moving it inside app/ will break it. Next.js specifically looks for middleware.ts
//   at the root.
//
// THE matcher config at the bottom:
//   Tells Next.js which routes to run middleware on.
//   The pattern excludes static files, images, and favicon to avoid slowing
//   down asset delivery. All actual pages and API routes are protected.
// =============================================================================

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── STEP 1: Uncomment this block once next-auth is installed ──
// import { auth } from "@/app/lib/auth";
// export default auth((req) => {
//   const isAuthed = !!req.auth;
//   const isAuthPage = req.nextUrl.pathname.startsWith("/login") ||
//                      req.nextUrl.pathname.startsWith("/register");
//   if (!isAuthed && !isAuthPage) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }
// });

// ── STEP 2 (temporary — remove once auth is wired): pass-through ──
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // Apply to all routes except static files, images, and Next.js internals
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
