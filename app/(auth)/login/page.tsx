"use client";

import { useState } from "react";
// import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // TODO: replace with real NextAuth call once next-auth is installed:
    // const result = await signIn("credentials", { email, password, redirect: false });
    // if (result?.error) {
    //   setError("Invalid email or password.");
    // } else {
    //   window.location.href = "/";
    // }

    await new Promise((r) => setTimeout(r, 800));
    setError("Auth not yet wired — install next-auth to enable login.");
    setLoading(false);
  }

  return (
    <div className="card w-full max-w-sm p-8 animate-in">
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
        <span className="font-semibold text-[15px] tracking-tight" style={{ color: "var(--text-1)" }}>
          Misi<span style={{ color: "var(--brand)" }}>Market</span>
        </span>
      </div>

      <h1 className="text-[1.25rem] font-semibold mb-1" style={{ color: "var(--text-1)" }}>
        Sign in
      </h1>
      <p className="text-[13px] mb-6" style={{ color: "var(--text-2)" }}>
        Enter your credentials to access your dashboard.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
            Email
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
              color: "var(--text-1)",
            }}
            placeholder="owner@restaurant.com"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-3)" }}>
            Password
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
              color: "var(--text-1)",
            }}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-[12px]" style={{ color: "var(--red)" }}>{error}</p>
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

      <p className="text-[11px] text-center mt-6" style={{ color: "var(--text-3)" }}>
        Don&apos;t have an account?{" "}
        <a href="/register" className="underline font-medium" style={{ color: "var(--brand)" }}>
          Register
        </a>
      </p>
    </div>
  );
}
