"use client";

import { useState } from "react";
import Link from "next/link";
import { InvestorSection } from "@/components/landing/InvestorSection";
import { IntelligenceLayer } from "@/components/landing/IntelligenceLayer";
import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { TractionSimulator } from "@/components/landing/TractionSimulator";
import {
  ArrowRight,
  BarChart3,
  Database,
  FileCheck2,
  GitBranch,
  Menu,
  Network,
  RadioTower,
  Scale,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  X,
  Zap,
} from "lucide-react";

const dataSources = [
  { icon: GitBranch, label: "GitHub API" },
  { icon: Network, label: "On-chain activity" },
  { icon: BarChart3, label: "Market signal" },
  { icon: Database, label: "The Graph" },
];

const featureCards = [
  {
    icon: Sparkles,
    title: "Discover Winners Early",
    copy: "Stop relying on warm intros. Our AI finds the best founders based on raw technical traction before the VC echo chamber catches on.",
  },
  {
    icon: ShieldCheck,
    title: "Code is Truth",
    copy: "No more pitch deck illusions. We connect real GitHub velocity and product momentum directly to funding logic.",
  },
  {
    icon: BarChart3,
    title: "Milestone-Driven Execution",
    copy: "Funds only release when the work gets done. Align founder ambition with investor security, programmatically.",
  },
  {
    icon: FileCheck2,
    title: "Auditable Trust",
    copy: "Replace endless board meetings with transparent, on-chain execution on the Casper network.",
  },
];

const navItems = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/docs", label: "Docs" },
  { href: "/dashboard/startups", label: "Startups" },
];

export default function LandingPage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#020504] text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#050806]/88 shadow-[0_16px_44px_rgba(0,0,0,0.32)] backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="group flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[#45f798]/45 bg-[#45f798]/10 text-[#45f798] shadow-[0_0_24px_rgba(69,247,152,0.12)] transition-colors group-hover:bg-[#45f798]/15">
              <TerminalSquare className="h-5 w-5" />
            </span>
            <span className="min-w-0 leading-none">
              <span className="block truncate text-sm font-black uppercase tracking-[0.18em] text-[#45f798]">CodeQuity</span>
              <span className="mt-1.5 block truncate text-[10px] font-bold uppercase tracking-[0.26em] text-zinc-500">
                Casper Launchpad
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-sm border border-white/10 bg-white/[0.035] p-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-sm px-4 py-2 text-xs font-bold text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/dashboard/admin/rounds/create"
              className="inline-flex h-10 items-center justify-center rounded-sm border border-[#45f798]/35 px-4 text-xs font-black text-[#45f798] transition-colors hover:bg-[#45f798]/10 hover:text-[#78ffb8]"
            >
              Create Round
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-5 text-xs font-black text-black transition-colors hover:bg-[#63ffab]"
            >
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-sm bg-[#45f798] px-4 text-xs font-black text-black transition-colors hover:bg-[#63ffab] max-[360px]:hidden"
            >
              Launch
            </Link>
            <button
              type="button"
              aria-label="Toggle navigation"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-white/[0.04] text-white transition-colors hover:bg-white/[0.08]"
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileNavOpen ? (
          <div className="border-t border-white/10 bg-[#050806]/96 px-4 py-4 shadow-[0_24px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl md:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-sm border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-bold text-zinc-200 transition-colors hover:bg-white/[0.08] hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/dashboard/admin/rounds/create"
                  onClick={() => setMobileNavOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-sm border border-[#45f798]/35 px-3 text-xs font-black text-[#45f798] transition-colors hover:bg-[#45f798]/10"
                >
                  Create Round
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-3 text-xs font-black text-black transition-colors hover:bg-[#63ffab]"
                >
                  Launch App
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="/landing_page.mp4"
        mobileMediaSrc="/phone_landing_page.mp4"
        bgImageSrc="/landing_background.jpg"
        title="Code Quity"
        date="The Financial Revolution"
        scrollToExpand="Scroll to unlock capital"
        textBlend={true}
      >
        <section className="relative min-h-screen border-b border-[#123626]">
          {/* Subtle grid and radial gradients for extra tech texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(69,247,152,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(69,247,152,0.06)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_16%,rgba(69,247,152,0.18),transparent_30%),linear-gradient(115deg,rgba(2,5,4,0.4)_0%,rgba(4,16,13,0.4)_56%,rgba(2,5,4,0.4)_100%)]" />

          <div className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-7xl flex-col items-center pt-24 pb-20 px-5 md:px-8">
            <div className="max-w-4xl text-center flex flex-col items-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#45f798]/20 bg-[#45f798]/10 px-4 py-1.5 text-xs font-bold text-[#45f798]">
                <ShieldCheck className="h-4 w-4" />
                Milestone-backed capital on Casper
              </div>
              <h1 className="font-space-grotesk text-5xl font-black leading-[1.05] tracking-tight text-white md:text-6xl lg:text-[80px]">
                Funding That Unlocks<br />When Traction Is Real.
              </h1>
              <p className="mt-8 max-w-2xl text-xl text-zinc-400 leading-relaxed mx-auto">
                CodeQuity verifies GitHub, product, and growth milestones so capital releases only when progress is proven.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
                <Link
                  href="/dashboard/admin/rounds/create"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded bg-[#45f798] px-10 text-base font-black text-black transition-colors hover:bg-[#66f4ff]"
                >
                  Start a Round
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded border border-white/10 px-10 text-base font-bold text-white transition-colors hover:bg-white/5"
                >
                  View as Investor
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                    <Network className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </div>

            <div className="w-full mt-24 relative z-20">
              <TractionSimulator />
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden border-y border-[#123626] bg-[#020504] px-5 py-24 md:px-8">
          <div className="absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(circle_at_50%_100%,rgba(69,247,152,0.22),transparent_56%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:80px_80px] opacity-25" />

          <div className="relative mx-auto max-w-7xl">
            <div className="grid gap-8 border-b border-white/10 pb-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#45f798]">
                  <Sparkles className="h-4 w-4" />
                  Launchpad Operating System
                </div>
                <h2 className="font-space-grotesk mt-5 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-white md:text-6xl">
                  One rail.
                  <br />
                  Zero capital ambiguity.
                </h2>
              </div>
              <div className="max-w-xl lg:justify-self-end">
                <p className="text-sm leading-6 text-zinc-400 md:text-base md:leading-7">
                  CodeQuity turns startup funding into a score-gated workflow: discover real builders, verify traction,
                  escrow capital, and release money only when the milestone proof is visible.
                </p>
                <Link
                  href="/dashboard"
                  className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-white px-4 text-xs font-black text-black transition-colors hover:bg-[#45f798]"
                >
                  Explore launchpad
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((feature, idx) => (
                <div
                  key={feature.title}
                  className="group relative min-h-[280px] overflow-hidden rounded-sm border border-white/10 bg-[#0A0F0C]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] transition-colors hover:border-[#45f798]/40 hover:bg-[#0D1510]"
                >
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#45f798]/12 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-sm border border-white/12 bg-white/[0.04] text-white transition-colors group-hover:border-[#45f798]/35 group-hover:text-[#45f798]">
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <span className="font-mono text-sm font-black text-[#45f798]">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="mt-auto pt-10">
                      <h3 className="font-space-grotesk text-2xl font-black leading-tight text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-4 text-sm leading-6 text-zinc-400">
                        {feature.copy}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>



        <InvestorSection />

        <IntelligenceLayer />

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

        <footer className="border-t border-[#123626] bg-[#020504] px-5 py-8 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-sm text-zinc-500 md:flex-row">
            <div className="font-mono text-xl text-white">Terminal</div>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
              <Link href="/dashboard/startups" className="hover:text-white">Startups</Link>
              <Link href="/dashboard/investors" className="hover:text-white">Investors</Link>
              <Link href="/dashboard/admin/rounds/create" className="hover:text-white">Create Round</Link>
              <Link href="/docs" className="hover:text-white">Docs</Link>
            </div>
            <div className="text-xs">2026 CodeQuity Launchpad</div>
          </div>
        </footer>
      </ScrollExpandMedia>
    </main>
  );
}

function MetricBar({
  label,
  value,
  width,
  color,
}: {
  label: string;
  value: string;
  width: string;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-zinc-400">
        <span>{label}</span>
        <span className="text-zinc-200">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden bg-white/10">
        <div className={`h-full ${color}`} style={{ width }} />
      </div>
    </div>
  );
}
