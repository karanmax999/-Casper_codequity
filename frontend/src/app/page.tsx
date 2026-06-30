import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { listLaunchpadRounds } from "@/lib/launchpad";
import { RoundCard } from "@/components/launchpad/RoundCard";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
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
              CodeQuity x Casper
            </div>
            <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Proof-of-traction funding rounds.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
              Investor escrow releases tied to CodeQuity traction score milestones, prepared for Casper testnet settlement.
            </p>
          </div>
          <Link
            href="/admin/rounds/create"
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
        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-8 text-center">
          <p className="text-sm font-semibold text-white">No funding rounds yet.</p>
          <p className="mt-2 text-xs text-zinc-500">Create the first demo round after assigning startup and investor wallet public keys.</p>
        </div>
      )}
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
