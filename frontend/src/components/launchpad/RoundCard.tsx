import Link from "next/link";
import { ArrowUpRight, CheckCircle2, CircleDollarSign, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";
import type { LaunchpadRound } from "@/types/launchpad";

export function RoundCard({ round }: { round: LaunchpadRound }) {
  const milestones = [...(round.milestones || [])].sort((a, b) => a.milestone_index - b.milestone_index);
  const releasedCount = milestones.filter((milestone) => milestone.released_at).length;
  const progress = milestones.length ? Math.round((releasedCount / milestones.length) * 100) : 0;
  const score = round.startup?.traction_score ?? 0;
  const nextMilestone = milestones.find((milestone) => !milestone.released_at);
  const ready = nextMilestone ? score >= nextMilestone.threshold_score : false;

  return (
    <Link
      href={`/dashboard/rounds/${round.id}`}
      className="group block overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] transition-colors hover:border-[#45f798]/40 hover:bg-[#0E0E0E]"
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#1F1F1F] p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm border border-[#2A2A2A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
              {round.status}
            </span>
            {ready && (
              <span className="rounded-sm border border-[#45f798]/30 bg-[#45f798]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#45f798]">
                Release ready
              </span>
            )}
          </div>
          <h2 className="mt-3 truncate text-lg font-semibold text-white">{round.startup?.name || "Startup"}</h2>
          <p className="mt-1 truncate text-xs text-zinc-500">
            Backed by {round.investor?.firm || round.investor?.name || "Investor"}
          </p>
        </div>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-[#45f798]" />
      </div>

      <div className="grid grid-cols-3 border-b border-[#1F1F1F]">
        <Metric icon={CircleDollarSign} label="Round" value={`${formatNumber(round.amount_cspr)} CSPR`} />
        <Metric icon={ShieldCheck} label="Score" value={`${score}/100`} />
        <Metric icon={CheckCircle2} label="Released" value={`${releasedCount}/${milestones.length}`} />
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
          <span>Milestone progress</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1F1F1F]">
          <div className="h-full bg-[#45f798]" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {nextMilestone
            ? `Next release at traction score ${nextMilestone.threshold_score}.`
            : "All milestones have been released."}
        </p>
      </div>
    </Link>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 border-r border-[#1F1F1F] p-3 last:border-r-0">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold text-zinc-100">{value}</div>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}
