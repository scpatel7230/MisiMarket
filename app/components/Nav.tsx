"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

function BrandMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <rect width="26" height="26" rx="7" fill="#f97316" />
      <polyline
        points="5,19 9,11 13,15 17,8 21,19"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NAV_LINKS = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/price-comparison",
    label: "Shop-Hop",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
  },
  {
    href: "/invoice-scanner",
    label: "Price Creep",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="15" x2="15" y2="15" />
        <line x1="12" y1="12" x2="12" y2="18" />
      </svg>
    ),
  },
  {
    href: "/dish-guard",
    label: "Dish Guard",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    href: "/forecasts",
    label: "Forecasts",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export default function Nav() {
  const pathname = usePathname();

  if (pathname === "/login" || pathname === "/register") return null;

  return (
    <nav
      style={{ backgroundColor: "var(--nav-bg)" }}
      className="sticky top-0 z-50 border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[58px] items-center gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <BrandMark />
            <span className="text-[14px] font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors">
              Misi<span className="text-orange-400">Market</span>
            </span>
          </Link>

          {/* Separator */}
          <div className="h-4 w-px bg-white/10 shrink-0 hidden sm:block" />

          {/* Nav links */}
          <div className="flex items-center gap-0.5 flex-1 overflow-x-auto">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150 whitespace-nowrap select-none ${
                    active
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/50 hover:text-white/85 hover:bg-white/5 font-normal"
                  }`}
                >
                  <span className={`shrink-0 transition-colors ${active ? "text-orange-400" : ""}`}>
                    {link.icon}
                  </span>
                  {link.label}
                  {active && (
                    <span className="ml-1 w-1 h-1 rounded-full bg-orange-400 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right status */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-[7px] h-[7px] rounded-full bg-emerald-400 live-dot" />
              <span className="text-[11px] text-white/35 font-medium">Live</span>
            </div>
            <div className="h-3.5 w-px bg-white/10" />
            <span className="text-[11px] text-white/30">Apr 26, 2026</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

