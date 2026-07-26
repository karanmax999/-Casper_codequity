"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Clock3,
  Lightbulb,
  Plus,
  ShieldCheck,
  Star,
} from "lucide-react";

const stats = [
  {
    icon: Star,
    label: "Total watchlisted",
    value: "0",
    helper: "Saved protocols",
  },
  {
    icon: BarChart3,
    label: "Avg. traction score",
    value: "-",
    helper: "Across your watchlist",
  },
  {
    icon: ShieldCheck,
    label: "Capital potential",
    value: "-",
    helper: "Estimated across rounds",
  },
  {
    icon: Clock3,
    label: "Last updated",
    value: "-",
    helper: "No activity yet",
  },
];

export default function WatchlistPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 py-2 selection:bg-accent selection:text-black">
      <section className="relative overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#060907] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_14%,rgba(69,247,152,0.22),transparent_34%),linear-gradient(120deg,rgba(69,247,152,0.08),transparent_42%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
          <div className="py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-[#45f798]/30 bg-[#45f798]/10 text-[#45f798] shadow-[0_0_36px_rgba(69,247,152,0.14)]">
                <Star className="h-8 w-8" />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#45f798]">
                  Investor watchlist
                </div>
                <h1 className="mt-3 text-4xl font-black leading-none tracking-tight text-white sm:text-6xl">
                  My Watchlist
                </h1>
              </div>
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Monitor your favorite protocols and pre-seed opportunities before they turn into active funding rounds.
            </p>
          </div>

          <WatchlistHeroArt />
        </div>

        <div className="relative mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#070907] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(69,247,152,0.13),transparent_34%)]" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
          <EmptyWatchlistArt />
          <h2 className="mt-5 text-2xl font-black tracking-tight text-white">
            Your watchlist is empty
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
            Start adding protocols you believe in. Track their traction, milestones, and funding potential from one place.
          </p>
          <Link
            href="/dashboard/startups"
            className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-6 text-xs font-black text-black transition-colors hover:bg-[#63ffab]"
          >
            <Plus className="h-4 w-4" />
            Browse Protocols
          </Link>
        </div>

        <div className="relative mx-auto mt-8 flex max-w-5xl flex-col gap-4 rounded-sm border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-[#45f798]/25 bg-[#45f798]/10 text-[#45f798]">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#45f798]">Pro tip</div>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Use your watchlist to compare traction, milestone progress, and funding potential across protocols.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-sm border border-transparent px-4 text-xs font-black text-[#45f798] transition-colors hover:border-[#45f798]/35 hover:bg-[#45f798]/10"
          >
            Go to Dashboard
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-sm border border-white/10 bg-[#0A0A0A]/80 p-4 backdrop-blur transition-colors hover:border-[#45f798]/35 hover:bg-[#0D1510]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-[#45f798]/25 bg-[#45f798]/10 text-[#45f798]">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</div>
          <div className="mt-2 truncate text-2xl font-black tracking-tight text-white">{value}</div>
          <div className="mt-1 truncate text-xs text-zinc-500">{helper}</div>
        </div>
      </div>
    </div>
  );
}

function WatchlistHeroArt() {
  return (
    <div className="relative hidden h-64 lg:block">
      <div className="absolute left-1/2 top-1/2 h-44 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#45f798]/20 bg-[#45f798]/5 shadow-[0_0_80px_rgba(69,247,152,0.2)]" />
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm border border-[#45f798]/40 bg-[#45f798]/10 shadow-[0_0_42px_rgba(69,247,152,0.18)]" />
      <div className="absolute left-1/2 top-[47%] flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-sm border border-[#45f798]/30 bg-[#0A0F0C] text-[#45f798] shadow-[0_18px_60px_rgba(0,0,0,0.4)]">
        <Star className="h-16 w-16" />
      </div>
      <div className="absolute left-12 top-12 h-5 w-5 rounded-sm border border-[#45f798]/20 bg-[#45f798]/20" />
      <div className="absolute right-20 top-16 h-4 w-4 rounded-sm border border-[#45f798]/20 bg-[#45f798]/15" />
      <div className="absolute bottom-12 right-10 h-3 w-3 rounded-sm border border-[#45f798]/20 bg-[#45f798]/20" />
    </div>
  );
}

function EmptyWatchlistArt() {
  return (
    <div className="relative h-36 w-52">
      <div className="absolute inset-x-6 bottom-3 h-12 rounded-full border border-[#45f798]/20 bg-[#45f798]/5 shadow-[0_0_48px_rgba(69,247,152,0.16)]" />
      <div className="absolute left-1/2 top-4 flex h-24 w-24 -translate-x-1/2 items-center justify-center rounded-full border border-white/15 bg-[#101816] text-zinc-400 shadow-[0_18px_55px_rgba(0,0,0,0.36)]">
        <Star className="h-12 w-12" />
      </div>
      <div className="absolute bottom-6 left-1/2 h-px w-28 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#45f798] to-transparent" />
    </div>
  );
}
