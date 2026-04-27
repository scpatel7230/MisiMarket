"use client";

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

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // TODO: wire to real endpoint once /api/register is built:
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
        Create your account
      </h1>
      <p className="text-[13px] mb-6" style={{ color: "var(--text-2)" }}>
        Set up your restaurant&apos;s intelligence dashboard.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {(
          [
            { field: "restaurantName", label: "Restaurant Name", type: "text", placeholder: "Mama's Kitchen" },
            { field: "name", label: "Your Name", type: "text", placeholder: "Full name" },
            { field: "email", label: "Email", type: "email", placeholder: "owner@restaurant.com" },
            { field: "password", label: "Password", type: "password", placeholder: "Min 8 characters" },
          ] as const
        ).map(({ field, label, type, placeholder }) => (
          <div key={field}>
            <label
              className="block text-[11px] font-medium mb-1.5 uppercase tracking-wide"
              style={{ color: "var(--text-3)" }}
            >
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
                color: "var(--text-1)",
              }}
              placeholder={placeholder}
              minLength={field === "password" ? 8 : undefined}
            />
          </div>
        ))}

        {error && (
          <p className="text-[12px]" style={{ color: "var(--red)" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-[13px] font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ backgroundColor: "var(--brand)" }}
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-[11px] text-center mt-6" style={{ color: "var(--text-3)" }}>
        Already have an account?{" "}
        <a href="/login" className="underline font-medium" style={{ color: "var(--brand)" }}>
          Sign in
        </a>
      </p>
    </div>
  );
}
