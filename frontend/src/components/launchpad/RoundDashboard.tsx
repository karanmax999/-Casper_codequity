"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  CheckCircle2,
  CircleDollarSign,
  Filter,
  Search,
  ShieldCheck,
  TrendingUp,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { RoundCard } from "@/components/launchpad/RoundCard";
import type { LaunchpadRound } from "@/types/launchpad";

type RoundDashboardProps = {
  rounds: LaunchpadRound[];
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
};

const tabs = [
  { id: "all", label: "All rounds" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
  { id: "upcoming", label: "Upcoming" },
] as const;

export function RoundDashboard({
  rounds,
  eyebrow,
  title,
  description,
  ctaLabel,
}: RoundDashboardProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [startupFilter, setStartupFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const stats = useMemo(() => getStats(rounds), [rounds]);
  const startupOptions = useMemo(
    () => Array.from(new Set(rounds.map((round) => round.startup?.name).filter(Boolean) as string[])).sort(),
    [rounds],
  );

  const visibleRounds = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rounds
      .filter((round) => {
        const matchesTab = activeTab === "all" || round.status === activeTab;
        const startupName = round.startup?.name || "Startup";
        const investorName = round.investor?.firm || round.investor?.name || "Investor";
        const matchesStartup = startupFilter === "all" || startupName === startupFilter;
        const matchesQuery =
          !normalizedQuery ||
          startupName.toLowerCase().includes(normalizedQuery) ||
          investorName.toLowerCase().includes(normalizedQuery) ||
          round.id.toLowerCase().includes(normalizedQuery);

        return matchesTab && matchesStartup && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === "largest") return Number(b.amount_cspr || 0) - Number(a.amount_cspr || 0);
        if (sortBy === "score") return Number(b.startup?.traction_score || 0) - Number(a.startup?.traction_score || 0);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [activeTab, query, rounds, sortBy, startupFilter]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-2">
      <section className="relative overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#060907] shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_16%,rgba(69,247,152,0.2),transparent_36%),linear-gradient(120deg,rgba(69,247,152,0.08),transparent_45%)]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#45f798]/35 to-transparent" />
        <div className="relative grid gap-4 p-5 pb-2 sm:p-7 sm:pb-3 lg:grid-cols-[minmax(0,1fr)_minmax(420px,520px)] lg:items-center">
          <div className="pb-5 lg:pb-8">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#45f798]">
              <TrendingUp className="h-3.5 w-3.5" />
              {eyebrow}
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
              {description}
            </p>
            <Link
              href="/dashboard/admin/rounds/create"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-5 text-xs font-black text-black transition-colors hover:bg-[#63ffab]"
            >
              {ctaLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="relative hidden min-h-[280px] self-stretch lg:block">
            <div className="absolute inset-y-0 right-[-28px] w-[calc(100%+48px)] bg-gradient-to-l from-black/40 via-transparent to-transparent" />
            <Image
              src="/dashboard_head.png"
              alt="CodeQuity dashboard capital rail illustration"
              fill
              priority
              sizes="520px"
              className="object-contain object-right"
            />
          </div>
        </div>

        <div className="relative grid gap-3 border-t border-white/10 bg-black/10 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-4">
          <DashboardMetric icon={Blocks} label="Active rounds" value={String(stats.activeRounds)} helper={`${stats.uniqueStartups} startups`} />
          <DashboardMetric icon={WalletCards} label="Total allocated" value={`${formatCompact(stats.totalCapital)} CSPR`} helper="Across all rounds" tone="blue" />
          <DashboardMetric icon={CircleDollarSign} label="Capital released" value={`${formatCompact(stats.releasedCapital)} CSPR`} helper="Based on milestones" tone="green" />
          <DashboardMetric icon={ShieldCheck} label="Avg. traction score" value={`${stats.averageScore}/100`} helper="Across active rounds" tone="violet" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid gap-3 rounded-sm border border-[#1F1F1F] bg-[#070707] p-3 xl:grid-cols-[minmax(0,1fr)_640px] xl:items-center">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-10 rounded-sm px-4 text-xs font-bold transition-colors ${
                  activeTab === tab.id
                    ? "border border-[#45f798]/40 bg-[#45f798]/10 text-[#45f798]"
                    : "border border-transparent text-zinc-500 hover:border-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(220px,1fr)_180px_160px]">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search rounds or startups..."
                className="h-10 w-full rounded-sm border border-white/10 bg-black/30 pl-9 pr-3 text-xs text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-[#45f798]/45"
              />
            </label>
            <label className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
              <select
                value={startupFilter}
                onChange={(event) => setStartupFilter(event.target.value)}
                className="h-10 w-full appearance-none rounded-sm border border-white/10 bg-black/30 px-9 text-xs text-zinc-300 outline-none transition-colors focus:border-[#45f798]/45"
              >
                <option value="all">All startups</option>
                {startupOptions.map((startup) => (
                  <option key={startup} value={startup}>
                    {startup}
                  </option>
                ))}
              </select>
            </label>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-10 rounded-sm border border-white/10 bg-black/30 px-3 text-xs text-zinc-300 outline-none transition-colors focus:border-[#45f798]/45"
            >
              <option value="newest">Newest first</option>
              <option value="largest">Largest first</option>
              <option value="score">Highest score</option>
            </select>
          </div>
        </div>

        {visibleRounds.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {visibleRounds.map((round) => (
              <RoundCard key={round.id} round={round} />
            ))}
          </div>
        ) : (
          <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-10 text-center">
            <h2 className="text-lg font-semibold text-white">No rounds match this view.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Clear the search or switch back to all rounds to see the full funding pipeline.
            </p>
          </div>
        )}
      </section>

      <div className="flex items-center justify-center gap-2 border-t border-[#1F1F1F] pt-5 text-xs text-zinc-500">
        <ShieldCheck className="h-4 w-4 text-[#45f798]" />
        All capital is secured by the <span className="font-bold text-[#45f798]">Casper Trust Layer</span>
      </div>
    </div>
  );
}

function DashboardMetric({
  icon: Icon,
  label,
  value,
  helper,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "green" | "blue" | "violet";
}) {
  const tones = {
    default: "text-[#45f798]",
    green: "text-[#45f798]",
    blue: "text-[#66f4ff]",
    violet: "text-violet-300",
  };

  return (
    <div className="rounded-sm border border-white/10 bg-[#0A0A0A]/80 p-4 backdrop-blur transition-colors hover:border-[#45f798]/35 hover:bg-[#0D1510]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-[#45f798]/25 bg-[#45f798]/10 text-[#45f798]">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">{label}</div>
          <div className={`mt-2 truncate text-2xl font-black tracking-tight text-white ${tones[tone] === "text-[#45f798]" ? "" : tones[tone]}`}>
            {value}
          </div>
          <div className="mt-1 truncate text-xs text-zinc-500">{helper}</div>
        </div>
      </div>
    </div>
  );
}

function getStats(rounds: LaunchpadRound[]) {
  const activeRounds = rounds.filter((round) => round.status === "active").length;
  const totalCapital = rounds.reduce((sum, round) => sum + Number(round.amount_cspr || 0), 0);
  const releasedCapital = rounds.reduce((sum, round) => {
    const releasedPercent = (round.milestones || [])
      .filter((milestone) => milestone.released_at)
      .reduce((milestoneSum, milestone) => milestoneSum + Number(milestone.release_percent || 0), 0);
    return sum + Number(round.amount_cspr || 0) * (releasedPercent / 100);
  }, 0);
  const scores = rounds.map((round) => Number(round.startup?.traction_score || 0)).filter((score) => score > 0);
  const uniqueStartups = new Set(rounds.map((round) => round.startup_id)).size;

  return {
    activeRounds,
    uniqueStartups,
    totalCapital,
    releasedCapital,
    averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
  };
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
    notation: value >= 100_000 ? "compact" : "standard",
  }).format(value);
}
