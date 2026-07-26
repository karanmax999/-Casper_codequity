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
      className="group relative block overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#0A0F0C] transition-colors hover:border-[#45f798]/45 hover:bg-[#0D1510]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_88%_10%,rgba(69,247,152,0.14),transparent_24%)] opacity-80" />
      <div className="relative flex items-start justify-between gap-4 border-b border-[#1F1F1F] p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm border border-[#45f798]/25 bg-[#45f798]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#45f798]">
              {round.status}
            </span>
            {ready && (
              <span className="rounded-sm border border-[#66f4ff]/30 bg-[#66f4ff]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#66f4ff]">
                Release ready
              </span>
            )}
          </div>
          <h2 className="mt-4 truncate text-lg font-semibold text-white">{round.startup?.name || "Startup"}</h2>
          <p className="mt-1 truncate text-xs text-zinc-500">
            Backed by {round.investor?.firm || round.investor?.name || "Investor"}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <ArrowUpRight className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-[#45f798]" />
          <ProtocolGlyph />
        </div>
      </div>

      <div className="relative grid grid-cols-3 border-b border-[#1F1F1F]">
        <Metric icon={CircleDollarSign} label="Round" value={`${formatNumber(round.amount_cspr)} CSPR`} />
        <Metric icon={ShieldCheck} label="Score" value={`${score}/100`} />
        <Metric icon={CheckCircle2} label="Released" value={`${releasedCount}/${milestones.length}`} />
      </div>

      <div className="relative p-4">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
          <span>Milestone progress</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1F1F1F]">
          <div className="h-full bg-gradient-to-r from-[#45f798] to-[#66f4ff]" style={{ width: `${progress}%` }} />
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

function ProtocolGlyph() {
  return (
    <div className="relative h-14 w-14">
      <div className="absolute inset-x-2 bottom-1 h-8 rotate-45 border border-[#45f798]/20 bg-[#45f798]/5" />
      <div className="absolute inset-x-3 bottom-3 h-8 rotate-45 border border-[#45f798]/35 bg-[#45f798]/10" />
      <div className="absolute inset-x-4 bottom-5 h-8 rotate-45 border border-[#45f798]/45 bg-[#45f798]/15" />
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value);
}
