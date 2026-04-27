"use client";
// =============================================================================
// FILE: app/(auth)/login/page.tsx
// PURPOSE:
//   The sign-in page for MisiMarket. Restaurant owners enter their email
//   and password here to access their dashboard.
//   Styled with the MisiMarket design system (dark nav, orange brand, card layout).
//
// HOW IT WORKS (once wired):
//   1. User submits the form
//   2. signIn("credentials", { email, password }) is called from next-auth/react
//   3. NextAuth sends the credentials to the "authorize" function in app/lib/auth.ts
//   4. If valid, a JWT session cookie is set and the user is redirected to /
//   5. If invalid, an error message is shown on the form
//
// CURRENT STATE: The form UI is complete. The actual signIn() call is
//   commented out and replaced with a simulation. It shows an error message
//   until you wire it up.
//
// TO ACTIVATE:
//   Step 1: Install next-auth:
//           npm install next-auth@beta
//   Step 2: Complete setup in app/lib/auth.ts
//   Step 3: In this file, uncomment:
//           - The import at the top:  import { signIn } from "next-auth/react"
//           - The real signIn block inside handleSubmit()
//           - Delete the placeholder simulation below it
//
// NOTE: The (auth) folder name with parentheses is a Next.js "route group".
//   It means /login and /register share a layout WITHOUT the main Nav bar,
//   so auth pages look clean. The parentheses folder does NOT appear in the URL.
// =============================================================================

import { useState } from "react";
// import { signIn } from "next-auth/react"; // uncomment when next-auth is installed

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // TODO: replace with real NextAuth call:
    // const result = await signIn("credentials", {
    //   email,
    //   password,
    //   redirect: false,
    // });
    // if (result?.error) {
    //   setError("Invalid email or password.");
    // } else {
    //   window.location.href = "/";
    // }

    // Placeholder simulation:
    await new Promise((r) => setTimeout(r, 800));
    setError("Auth not yet wired — install next-auth to enable login.");
    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      <div className="card w-full max-w-sm p-8">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-8">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#f97316" />
            <polyline
              points="4,20 10,12 16,16 24,6"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span className="font-semibold text-[15px] tracking-tight" style={{ color: "var(--text)" }}>
            MisiMarket
          </span>
        </div>

        <h1 className="text-[1.25rem] font-semibold mb-1" style={{ color: "var(--text)" }}>
          Sign in
        </h1>
        <p className="text-[13px] mb-6" style={{ color: "var(--text-muted)" }}>
          Enter your credentials to access your dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              EMAIL
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg)",
                color: "var(--text)",
              }}
              placeholder="owner@restaurant.com"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
              PASSWORD
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all"
              style={{
                border: "1px solid var(--border)",
                backgroundColor: "var(--bg)",
                color: "var(--text)",
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[12px] text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "var(--brand)" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-[11px] text-center mt-6" style={{ color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <a href="/register" className="underline" style={{ color: "var(--brand)" }}>
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
