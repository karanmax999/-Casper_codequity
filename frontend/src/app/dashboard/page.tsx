import Link from "next/link";
import { ArrowRight, Database, RadioTower, ShieldCheck, WalletCards, Sparkles, BarChart3 } from "lucide-react";
import type { ComponentType } from "react";
import { listLaunchpadRounds } from "@/lib/launchpad";
import { RoundCard } from "@/components/launchpad/RoundCard";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email;
  const isUserAdmin = isAdmin(email);

  if (isUserAdmin) {
    const rounds = await listLaunchpadRounds();
    const activeRounds = rounds.filter((round) => round.status === "active").length;
    const releasedMilestones = rounds.reduce(
      (count, round) => count + (round.milestones || []).filter((milestone) => milestone.released_at).length,
      0,
    );
    const totalCapital = rounds.reduce((sum, round) => sum + Number(round.amount_cspr || 0), 0);

    return (
      <div className="space-y-8">
        <section className="border-b border-[#1F1F1F] pb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
                <ShieldCheck className="h-3.5 w-3.5" />
                CodeQuity x Casper [Admin Mode]
              </div>
              <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Proof-of-traction funding rounds.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                Investor escrow releases tied to Codequity traction score milestones, prepared for Casper testnet settlement.
              </p>
            </div>
            <Link
              href="/dashboard/admin/rounds/create"
              className="inline-flex h-10 items-center justify-center rounded-sm bg-[#45f798] px-5 text-xs font-bold text-black transition-colors hover:bg-[#63ffab]"
            >
              Create round
            </Link>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Active rounds" value={String(activeRounds)} />
          <Stat label="Milestones released" value={String(releasedMilestones)} />
          <Stat label="Capital tracked" value={`${formatNumber(totalCapital)} CSPR`} />
        </div>

        {rounds.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {rounds.map((round) => (
              <RoundCard key={round.id} round={round} />
            ))}
          </div>
        ) : (
          <EmptyLaunchpad />
        )}
      </div>
    );
  }

  // Non-Admin Command Center View
  const { count: startupsCount } = await supabase
    .from("startups")
    .select("*", { count: "exact", head: true });
  
  const { count: investorsCount } = await supabase
    .from("investors")
    .select("*", { count: "exact", head: true });

  const { data: recommendedStartups } = await supabase
    .from("startups")
    .select("id, name, slug, description, traction_score")
    .order("traction_score", { ascending: false })
    .limit(3);

  const startupCountVal = startupsCount || 0;
  const investorCountVal = investorsCount || 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2 selection:bg-accent selection:text-black">
      {/* Welcome Section */}
      <section className="border-b border-[#1F1F1F] pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#45f798]">
              <Sparkles className="h-3.5 w-3.5" />
              INVESTOR PIPELINE SEED
            </div>
            <h1 className="mt-3 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              Build your working intelligence set
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
              Start by saving protocols you follow, or register your own protocol to unlock founder pipeline tools.
            </p>
          </div>
          <Link
            href="/dashboard/startups"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-6 text-xs font-bold text-black hover:bg-[#63ffab] transition-all"
          >
            Browse protocols
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Recommended Pre-Seed Opportunities */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          RECOMMENDED PRE-SEED OPPORTUNITIES
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {recommendedStartups && recommendedStartups.length > 0 ? (
            recommendedStartups.map((startup) => (
              <Link
                key={startup.id}
                href={`/dashboard/startups/${startup.id}`}
                className="group relative rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-5 hover:border-zinc-500 transition-all space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-[#45f798] transition-colors">
                      {startup.name}
                    </h3>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">DEFI</p>
                  </div>
                  <span className="rounded bg-[#1F1F1F] border border-[#2A2A2A] px-2 py-0.5 font-mono text-[10px] font-bold text-[#45f798]">
                    {startup.traction_score}/100
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                  {startup.description || "No description provided."}
                </p>
              </Link>
            ))
          ) : (
            <div className="col-span-3 rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-6 text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono">No recommended opportunities available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom Grid Info */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="PUBLISHED PROTOCOLS" value={String(startupCountVal)} />
        <StatCard label="INVESTOR DIRECTORY" value={String(investorCountVal)} />
        <StatCard label="YOUR WATCHLIST" value="0" />
        <StatCard label="PROFILE VIEWS THIS WEEK" value="12" />
      </div>

      {/* Verified Intelligence Feed */}
      <section className="space-y-4 rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-5">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          VERIFIED INTELLIGENCE FEED
        </h2>
        <div className="divide-y divide-[#1F1F1F] space-y-4 pt-1">
          <FeedItem
            title="ZEC Volatility Alert"
            description="Zcash moved 5.8% in the last 24 hours."
            meta="SRC: MARKET DATA · PRICE MOVE"
          />
          <FeedItem
            title="SOL Volatility Alert"
            description="Solana moved 4.3% in the last 24 hours."
            meta="SRC: MARKET DATA · PRICE MOVE"
            className="pt-4"
          />
          <FeedItem
            title="ETH Volatility Alert"
            description="Ethereum moved 2.7% in the last 24 hours."
            meta="SRC: MARKET DATA · PRICE MOVE"
            className="pt-4"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#1F1F1F] bg-[#0A0A0A] p-5 flex flex-col justify-between min-h-[90px]">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
        {label}
      </div>
      <div className="mt-3 text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function FeedItem({
  title,
  description,
  meta,
  className,
}: {
  title: string;
  description: string;
  meta: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-white">{title}</span>
        <span className="text-[10px] text-zinc-600 font-mono">LESS THAN A MINUTE AGO</span>
      </div>
      <p className="text-xs text-zinc-400 mt-1">{description}</p>
      <div className="text-[9px] font-bold text-zinc-500 font-mono mt-1 tracking-wider">
        {meta}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-4">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);
}

function EmptyLaunchpad() {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-6">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
          <RadioTower className="h-3.5 w-3.5" />
          Ready for first demo round
        </div>
        <h2 className="mt-3 text-2xl font-semibold text-white">Connect one startup, one investor, and one score threshold.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
          The dashboard is waiting for live Supabase records. Once a round exists, cards will show current score, milestone status, release readiness, and Casper explorer references.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/admin/rounds/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-4 text-xs font-bold text-black hover:bg-[#63ffab]"
          >
            Create first round
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-sm border border-[#2A2A2A] px-4 text-xs font-semibold text-zinc-300 hover:border-[#45f798]/50 hover:text-[#45f798]"
          >
            View launchpad overview
          </Link>
        </div>
      </div>

      <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Setup checklist</div>
        <div className="mt-4 space-y-3">
          <ChecklistItem icon={Database} title="Supabase tables" description="funding_rounds, milestones, and on_chain_transactions are queried here." />
          <ChecklistItem icon={WalletCards} title="Wallet public keys" description="Both startup and investor need wallet_pubkey before backend creation." />
          <ChecklistItem icon={ShieldCheck} title="Backend admin key" description="Create and evaluate use codequity-analytics with ADMIN_API_KEY." />
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-sm border border-[#1F1F1F] bg-black p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#45f798]" />
      <div>
        <div className="text-sm font-semibold text-white">{title}</div>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
