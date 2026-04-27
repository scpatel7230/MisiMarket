"use client";
// =============================================================================
// FILE: app/(auth)/register/page.tsx
// PURPOSE:
//   The sign-up / onboarding page. A new restaurant owner fills in their
//   restaurant name, their own name, email, and password to create an account.
//   On submit, it calls POST /api/register which creates both the Restaurant
//   record and the owner User in a single database transaction.
//
// HOW IT WORKS (once wired):
//   1. User submits the form
//   2. fetch("POST", "/api/register", body) is called
//   3. /api/register validates input, hashes the password, creates the records
//   4. On success, signIn() is called automatically to log them in
//   5. They land on the dashboard (/) already authenticated
//
// CURRENT STATE: The form UI is complete. The actual fetch() + signIn() calls
//   are commented out and replaced with a simulation error message.
//
// TO ACTIVATE:
//   Step 1: Complete app/api/register/route.ts setup (Prisma + bcryptjs)
//   Step 2: Install next-auth:
//           npm install next-auth@beta
//   Step 3: In this file's handleSubmit(), uncomment the real fetch() + signIn()
//           block and delete the placeholder simulation below it
//
// TO CUSTOMISE THE ONBOARDING:
//   You can add extra fields here later (e.g. phone number, restaurant address,
//   number of covers, cuisine type). Just add them to the form state, the
//   rendered fields array below, and the POST body.
//   Add corresponding columns to the Restaurant model in prisma/schema.prisma
//   and run: npx prisma migrate dev --name add-restaurant-fields
// =============================================================================

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    restaurantName: "",
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // TODO: wire to real endpoint once /api/register is built
    // const res = await fetch("/api/register", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(form),
    // });
    // if (!res.ok) {
    //   const data = await res.json();
    //   setError(data.error ?? "Registration failed.");
    //   setLoading(false);
    //   return;
    // }
    // await signIn("credentials", { email: form.email, password: form.password, callbackUrl: "/" });

    await new Promise((r) => setTimeout(r, 800));
    setError("Registration not yet wired — build /api/register to enable.");
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
          Create your account
        </h1>
        <p className="text-[13px] mb-6" style={{ color: "var(--text-muted)" }}>
          Set up your restaurant&apos;s intelligence dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(
            [
              { field: "restaurantName", label: "RESTAURANT NAME", type: "text", placeholder: "Mama's Kitchen" },
              { field: "name", label: "YOUR NAME", type: "text", placeholder: "Full name" },
              { field: "email", label: "EMAIL", type: "email", placeholder: "owner@restaurant.com" },
              { field: "password", label: "PASSWORD", type: "password", placeholder: "Min 8 characters" },
            ] as const
          ).map(({ field, label, type, placeholder }) => (
            <div key={field}>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: "var(--text-muted)" }}>
                {label}
              </label>
              <input
                type={type}
                required
                value={form[field]}
                onChange={set(field)}
                className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all"
                style={{
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--bg)",
                  color: "var(--text)",
                }}
                placeholder={placeholder}
                minLength={field === "password" ? 8 : undefined}
              />
            </div>
          ))}

          {error && <p className="text-[12px] text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "var(--brand)" }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-[11px] text-center mt-6" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <a href="/login" className="underline" style={{ color: "var(--brand)" }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
