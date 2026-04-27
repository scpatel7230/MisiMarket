import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MisiMarket — Restaurant Price Intelligence",
  description: "Find the cheapest price. Stop vendor overcharging. Protect the menu. Forecast the future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full flex flex-col" style={{ background: "var(--bg)" }}>
        <Nav />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200/60 mt-8">
          <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium tracking-wide">
              MISIMARKET INTELLIGENCE PLATFORM
            </span>
            <span className="text-[11px] text-slate-300">
              © 2026 · All prices updated daily
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
