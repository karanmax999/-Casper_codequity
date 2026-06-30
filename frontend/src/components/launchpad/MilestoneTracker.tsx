import { CheckCircle2, Circle, ExternalLink, LockKeyhole, RadioTower } from "lucide-react";
import type { LaunchpadMilestone } from "@/types/launchpad";

export function MilestoneTracker({
  milestones,
  currentScore,
}: {
  milestones: LaunchpadMilestone[];
  currentScore: number;
}) {
  const sorted = [...milestones].sort((a, b) => a.milestone_index - b.milestone_index);

  return (
    <div className="overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#0A0A0A]">
      <div className="border-b border-[#1F1F1F] p-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
          <RadioTower className="h-3.5 w-3.5" />
          Milestone release logic
        </div>
        <h2 className="mt-2 text-lg font-semibold text-white">Score-gated escrow releases</h2>
      </div>

      <div className="divide-y divide-[#1F1F1F]">
        {sorted.map((milestone) => {
          const released = Boolean(milestone.released_at);
          const ready = !released && currentScore >= milestone.threshold_score;

          return (
            <div key={milestone.id} className="grid gap-4 p-4 md:grid-cols-[220px_1fr_auto] md:items-center">
              <div className="flex items-center gap-3">
                <div
                  className={
                    released
                      ? "flex h-9 w-9 items-center justify-center rounded-full bg-[#45f798]/10 text-[#45f798]"
                      : ready
                        ? "flex h-9 w-9 items-center justify-center rounded-full bg-white text-black"
                        : "flex h-9 w-9 items-center justify-center rounded-full border border-[#2A2A2A] text-zinc-600"
                  }
                >
                  {released ? <CheckCircle2 className="h-4 w-4" /> : ready ? <LockKeyhole className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Milestone {milestone.milestone_index + 1}</div>
                  <div className="text-xs text-zinc-500">{milestone.release_percent}% release</div>
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-zinc-500">Threshold</span>
                  <span className="font-mono font-semibold text-zinc-200">{milestone.threshold_score}/100</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1F1F1F]">
                  <div
                    className={released || ready ? "h-full bg-[#45f798]" : "h-full bg-zinc-600"}
                    style={{ width: `${Math.min(100, Math.max(0, currentScore))}%` }}
                  />
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  {released
                    ? `Released ${formatDate(milestone.released_at)}`
                    : ready
                      ? "Current score satisfies this threshold."
                      : `Needs ${Math.max(0, milestone.threshold_score - currentScore)} more score points.`}
                </div>
              </div>

              <div className="flex items-center gap-2 md:justify-end">
                <span
                  className={
                    released
                      ? "rounded-sm border border-[#45f798]/30 bg-[#45f798]/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#45f798]"
                      : ready
                        ? "rounded-sm border border-white/20 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-black"
                        : "rounded-sm border border-[#2A2A2A] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500"
                  }
                >
                  {released ? "Released" : ready ? "Ready" : "Pending"}
                </span>
                {milestone.tx_hash && (
                  <a
                    href={`https://testnet.casper.network/deploy/${milestone.tx_hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-7 items-center gap-1 rounded-sm border border-[#2A2A2A] px-2 text-[10px] font-semibold text-zinc-300 hover:border-[#45f798]/50 hover:text-[#45f798]"
                  >
                    Tx
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}
