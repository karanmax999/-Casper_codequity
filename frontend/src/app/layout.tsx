import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, TerminalSquare } from "lucide-react";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeQuity Launchpad",
  description: "AI-governed milestone funding on Casper",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-dvh bg-[#050606] text-white">
          <header className="sticky top-0 z-30 border-b border-[#1F1F1F] bg-[#050606]/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
              <Link href="/" className="flex items-center gap-3">
                <TerminalSquare className="h-7 w-7 text-[#45f798]" />
                <div>
                  <div className="text-sm font-black uppercase tracking-tight text-white">CodeQuity</div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#45f798]">Casper Launchpad</div>
                </div>
              </Link>
              <nav className="flex items-center gap-2">
                <Link
                  href="/"
                  className="hidden h-9 items-center rounded-sm border border-[#1F1F1F] px-3 text-xs font-semibold text-zinc-300 transition-colors hover:border-[#45f798]/50 hover:text-[#45f798] sm:inline-flex"
                >
                  Rounds
                </Link>
                <Link
                  href="/admin/rounds/create"
                  className="inline-flex h-9 items-center gap-2 rounded-sm bg-[#45f798] px-3 text-xs font-bold text-black transition-colors hover:bg-[#63ffab]"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Create
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
