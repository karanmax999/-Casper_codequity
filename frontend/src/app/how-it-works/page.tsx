"use client";

import Link from "next/link";
import {
  FileCheck2,
  Network,
  Scale,
  TerminalSquare,
} from "lucide-react";
import { usePathname } from "next/navigation";

const timeline = [
  {
    step: "01",
    icon: TerminalSquare,
    title: "Define the Deal",
    copy: "Founders and investors lock in a funding round, defining the exact traction thresholds that trigger capital release.",
  },
  {
    step: "02",
    icon: Network,
    title: "Prove the Work",
    copy: "Founders build. CodeQuity monitors GitHub, market signals, and on-chain data to objectively score momentum.",
  },
  {
    step: "03",
    icon: FileCheck2,
    title: "Automate the Payout",
    copy: "No red tape. When the score hits the threshold, Casper automatically releases the funds.",
  },
  {
    step: "04",
    icon: Scale,
    title: "Total Alignment",
    copy: "Founders keep their equity until they prove their worth. Investors keep their capital until traction is real.",
  },
];

export default function HowItWorksPage() {
  const pathname = usePathname();
  
  return (
    <main className="min-h-screen bg-[#020504] text-white flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 mx-auto flex w-full items-center justify-between px-5 py-5 md:px-8 border-b border-white/10 bg-[#020504]/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-3">
          <TerminalSquare className="h-7 w-7 text-[#45f798]" />
          <div className="leading-none">
            <div className="text-sm font-black uppercase tracking-[0.16em] text-[#45f798]">CodeQuity</div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">Casper Launchpad</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link 
            href="/how-it-works" 
            className={`hidden text-xs font-semibold sm:inline ${pathname === "/how-it-works" ? "text-white" : "text-zinc-300 hover:text-white"}`}
          >
            How It Works
          </Link>
          <Link href="/sign-in" className="hidden text-xs font-semibold text-zinc-300 hover:text-white sm:inline">
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center rounded-sm bg-[#45f798] px-4 text-xs font-black text-black transition-colors hover:bg-[#63ffab]"
          >
            Launch App
          </Link>
        </div>
      </header>

      <div className="flex-1 mt-[80px]">
        <section className="border-b border-[#123626] bg-[#020504] px-5 py-24 md:px-8 min-h-[70vh] flex items-center">
          <div className="mx-auto max-w-4xl w-full">
            <h1 className="font-space-grotesk text-center text-4xl font-black text-white md:text-6xl">How it works</h1>
            <p className="mt-4 text-center text-zinc-400 text-lg max-w-2xl mx-auto">
              The deterministic process that converts technical traction into programmable capital.
            </p>
            <div className="mt-16 overflow-hidden rounded-md border border-white/10 bg-[#0a1110] font-mono text-sm shadow-2xl">
              <div className="flex items-center gap-2 border-b border-white/5 bg-white/5 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="ml-4 text-xs text-zinc-500">CodeQuity_Smart_Contract.ts</span>
              </div>
              <div className="p-6 md:p-8 space-y-8 text-zinc-300">
                {timeline.map((item, index) => (
                  <div key={item.title} className="group flex gap-4 transition-colors hover:text-white">
                    <div className="text-zinc-600 select-none">{(index + 1).toString().padStart(2, '0')}</div>
                    <div>
                      <div className="text-electric-blue">
                        <span className="text-cyber-purple">function</span> {item.title.replace(/\s+/g, '_')}(): void {'{'}
                      </div>
                      <div className="pl-4 text-zinc-400 mt-2">
                        <span className="text-zinc-600">//</span> {item.copy}
                      </div>
                      <div className="text-electric-blue mt-2">{'}'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#020504] px-5 py-20 md:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="font-space-grotesk text-3xl font-black uppercase tracking-tight text-white md:text-5xl">
              Ready to Rewrite the Rules of Venture?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
              Create a score-gated round, track traction, and prepare auditable Casper release records from one launchpad.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/dashboard/admin/rounds/create"
                className="inline-flex h-11 items-center justify-center rounded-sm bg-[#45f798] px-6 text-xs font-black text-black transition-colors hover:bg-[#63ffab]"
              >
                Start a Round
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-sm border border-[#45f798]/40 px-6 text-xs font-bold text-[#45f798] transition-colors hover:bg-[#45f798]/10"
              >
                View Launchpad
              </Link>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-[#123626] bg-[#020504] px-5 py-8 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-sm text-zinc-500 md:flex-row">
          <div className="font-mono text-xl text-white">Terminal</div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link href="/dashboard/startups" className="hover:text-white">Startups</Link>
            <Link href="/dashboard/investors" className="hover:text-white">Investors</Link>
            <Link href="/dashboard/admin/rounds/create" className="hover:text-white">Create Round</Link>
          </div>
          <div className="text-xs">2026 CodeQuity Launchpad</div>
        </div>
      </footer>
    </main>
  );
}
