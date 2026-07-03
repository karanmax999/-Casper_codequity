"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Database,
  FileCheck2,
  GitBranch,
  Network,
  RadioTower,
  Scale,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
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
    title: "AI-Powered Deal Sourcing",
    copy: "Score technical traction and founder momentum before a round becomes obvious.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Technical Intelligence",
    copy: "Connect repo velocity, score thresholds, and release readiness in one investor view.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Portfolio Monitoring",
    copy: "Track milestone status, current score, and release readiness across active rounds.",
  },
  {
    icon: FileCheck2,
    title: "Automated Investor Updates",
    copy: "Create auditable release records for score-gated Casper settlement workflows.",
  },
];

const timeline = [
  {
    step: "01",
    icon: TerminalSquare,
    title: "Setup",
    copy: "Create a funding round with one startup, one investor, CSPR amount, and traction thresholds.",
  },
  {
    step: "02",
    icon: Network,
    title: "Integration",
    copy: "CodeQuity binds public traction signals to milestone logic and Casper testnet records.",
  },
  {
    step: "03",
    icon: FileCheck2,
    title: "Automated Release",
    copy: "When score requirements are met, the launchpad prepares release evidence and transaction history.",
  },
  {
    step: "04",
    icon: Scale,
    title: "Governance",
    copy: "Investors and founders get a transparent record of score movement, escrow state, and release decisions.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#020504] text-white">
      <section className="relative min-h-screen border-b border-[#123626]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(69,247,152,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(69,247,152,0.06)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_16%,rgba(69,247,152,0.18),transparent_30%),linear-gradient(115deg,rgba(2,5,4,0.96)_0%,rgba(4,16,13,0.92)_56%,rgba(2,5,4,0.98)_100%)]" />

        <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <TerminalSquare className="h-7 w-7 text-[#45f798]" />
            <div className="leading-none">
              <div className="text-sm font-black uppercase tracking-[0.16em] text-[#45f798]">CodeQuity</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">Casper Launchpad</div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
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

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-80px)] w-full max-w-7xl grid-cols-1 gap-10 px-5 pb-12 pt-8 md:px-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] lg:items-center">
          <div className="space-y-8">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-black leading-[0.98] tracking-tight text-white md:text-6xl lg:text-7xl">
                Startup funding that releases when traction becomes real.
              </h1>
              <div className="mt-6 inline-flex items-center gap-2 border border-[#45f798]/35 bg-[#45f798]/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.13em] text-[#45f798]">
                <ShieldCheck className="h-4 w-4" />
                Proof-of-traction escrow
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-5 text-xs font-black text-black transition-colors hover:bg-[#63ffab]"
                >
                  View rounds
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard/admin/rounds/create"
                  className="inline-flex h-11 items-center justify-center rounded-sm border border-[#45f798]/40 px-5 text-xs font-bold text-[#45f798] transition-colors hover:bg-[#45f798]/10"
                >
                  Create test round
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((feature) => (
                <div key={feature.title} className="border border-white/12 bg-white/[0.06] p-4 backdrop-blur">
                  <feature.icon className="h-6 w-6 text-[#45f798]" />
                  <h2 className="mt-4 text-sm font-bold leading-5 text-white">{feature.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-zinc-400">{feature.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="border border-white/15 bg-[#0a1110]/80 p-5 shadow-[0_0_60px_rgba(69,247,152,0.12)] backdrop-blur">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <RadioTower className="h-5 w-5 text-[#45f798]" />
                <div className="text-sm font-bold text-white">Threshold release engine</div>
              </div>
              <div className="mt-5 space-y-5 font-mono text-xs">
                <MetricBar label="Startup score" value="83/100" width="83%" color="bg-[#45f798]" />
                <MetricBar label="Milestone threshold" value="80/100" width="80%" color="bg-[#45f798]/80" />
                <div className="flex items-center justify-between border-t border-white/10 pt-4 text-zinc-400">
                  <span>Release amount</span>
                  <span className="text-lg font-bold text-[#45f798]">500 CSPR</span>
                </div>
                <div className="border border-[#45f798]/20 bg-black/60 p-4 leading-6 text-zinc-400">
                  <span className="font-bold uppercase text-[#45f798]">Release ready:</span> founder score crossed the
                  threshold and the round is ready for Casper release evidence.
                </div>
              </div>
            </div>

            <div className="mt-9 grid grid-cols-3 items-center gap-3 text-center font-mono text-xs text-zinc-500">
              <div className="h-px bg-[#45f798]/20" />
              <div className="text-[#45f798]">02</div>
              <div className="h-px bg-[#45f798]/20" />
              <div>CodeQuity score becomes trigger</div>
              <div className="text-[#45f798]">03</div>
              <div>Casper records the release</div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-b border-[#123626] bg-[#020504] px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="font-mono text-3xl font-bold uppercase tracking-[0.16em] text-zinc-200 md:text-4xl">
              The Intelligence Layer
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
              A scoring engine that compresses developer activity, market signals, and on-chain context into release logic.
            </p>
          </div>

          <div className="mt-16 grid items-center gap-8 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
            <div className="space-y-5">
              {dataSources.map((source) => (
                <div key={source.label} className="flex items-center gap-3 border border-white/10 bg-white/[0.05] p-4">
                  <source.icon className="h-5 w-5 text-[#45f798]" />
                  <span className="text-sm font-semibold text-zinc-200">{source.label}</span>
                </div>
              ))}
            </div>

            <div className="relative mx-auto flex aspect-square w-full max-w-[420px] items-center justify-center">
              <div className="absolute inset-0 border border-[#45f798]/20" />
              <div className="absolute inset-8 border border-[#45f798]/15" />
              <div className="absolute h-px w-full bg-[#45f798]/25" />
              <div className="absolute h-full w-px bg-[#45f798]/25" />
              <div className="relative flex h-36 w-36 items-center justify-center border border-[#45f798]/60 bg-[#07120f]">
                <Zap className="h-16 w-16 text-[#45f798]" />
                <span className="absolute bottom-8 text-2xl font-black text-white">AI</span>
              </div>
            </div>

            <div className="border border-[#45f798]/35 bg-[#45f798]/10 p-6 text-center">
              <div className="text-sm font-bold text-zinc-200">CodeQuity Score</div>
              <div className="mt-2 font-mono text-5xl font-black text-[#45f798]">5.500</div>
              <div className="mt-5 inline-flex items-center gap-2 border border-[#45f798]/35 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#45f798]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Trusted by Casper
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#123626] bg-[#020504] px-5 py-20 md:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-black text-white md:text-4xl">How it works</h2>
          <div className="relative mt-14">
            <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[#45f798]/25 md:block" />
            <div className="space-y-10">
              {timeline.map((item, index) => (
                <div
                  key={item.title}
                  className={`relative grid gap-6 md:grid-cols-[1fr_96px_1fr] ${
                    index % 2 === 0 ? "" : "md:[&>div:first-child]:col-start-3 md:[&>div:first-child]:row-start-1"
                  }`}
                >
                  <div className={index % 2 === 0 ? "md:text-right" : "md:text-left"}>
                    <div className="font-mono text-2xl font-bold text-[#45f798]">{item.step}</div>
                    <h3 className="mt-1 text-xl font-bold uppercase tracking-[0.12em] text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-500">{item.copy}</p>
                  </div>
                  <div className="relative hidden items-center justify-center md:flex">
                    <div className="flex h-16 w-16 items-center justify-center border border-[#45f798]/35 bg-white/[0.07] backdrop-blur">
                      <item.icon className="h-7 w-7 text-[#45f798]" />
                    </div>
                  </div>
                  <div className="hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#020504] px-5 py-20 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
            Ready to fund the future?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
            Create a score-gated round, track traction, and prepare auditable Casper release records from one launchpad.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/dashboard/admin/rounds/create"
              className="inline-flex h-11 items-center justify-center rounded-sm bg-[#45f798] px-6 text-xs font-black text-black transition-colors hover:bg-[#63ffab]"
            >
              Create round
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-sm border border-[#45f798]/40 px-6 text-xs font-bold text-[#45f798] transition-colors hover:bg-[#45f798]/10"
            >
              View launchpad
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
          </div>
          <div className="text-xs">2026 CodeQuity Launchpad</div>
        </div>
      </footer>
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
