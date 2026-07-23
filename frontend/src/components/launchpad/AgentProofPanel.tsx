"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  GitBranch,
  Loader2,
  RadioTower,
  Sparkles,
  XCircle,
} from "lucide-react";
import { runStartupEvaluation } from "@/actions";
import type { LaunchpadAgentOutput, LaunchpadMilestone } from "@/types/launchpad";

type AgentProofPanelProps = {
  proof: LaunchpadAgentOutput | null;
  proofError?: string | null;
  startupId?: string | null;
  roundId: string;
  currentScore: number;
  nextMilestone?: LaunchpadMilestone | null;
};

export function AgentProofPanel({
  proof,
  proofError,
  startupId,
  roundId,
  currentScore,
  nextMilestone,
}: AgentProofPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const output = proof?.output_json || null;
  const score = Number(output?.total ?? currentScore ?? 0);
  const verdict = output?.verdict || readinessVerdict(score, nextMilestone);
  const ready = nextMilestone ? score >= nextMilestone.threshold_score : true;
  const dimensions = useMemo(() => Object.entries(output?.dimensions || {}), [output]);
  const githubSignals = output?.signals?.github || null;

  const handleRun = () => {
    if (!startupId) {
      setMessage("Startup id is missing for this round.");
      return;
    }

    setMessage(null);
    startTransition(async () => {
      const result = await runStartupEvaluation(startupId, roundId);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }

      setMessage(`AI evaluation saved. New traction score: ${result.data.traction_score}/100.`);
      router.refresh();
    });
  };

  return (
    <section className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A]">
      <div className="flex flex-col gap-4 border-b border-[#1F1F1F] p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
            <Bot className="h-3.5 w-3.5" />
            Agent proof
          </div>
          <h2 className="mt-2 text-xl font-semibold text-white">CodeQuity traction evaluation</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
            The release decision is tied to the latest startup scorer output and the next unreleased milestone threshold.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRun}
          disabled={isPending || !startupId}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-4 text-xs font-bold text-black transition-colors hover:bg-[#63ffab] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          {isPending ? "Running agent..." : "Run AI evaluation"}
        </button>
      </div>

      <div className="grid gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="border-b border-[#1F1F1F] p-5 lg:border-b-0 lg:border-r">
          <div className="grid grid-cols-2 gap-3">
            <ProofMetric label="Agent Score" value={`${score}/100`} tone="strong" />
            <ProofMetric label="Verdict" value={verdict} tone={verdictTone(verdict)} />
          </div>

          <div className="mt-4 rounded-sm border border-[#1F1F1F] bg-black p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              {ready ? (
                <CheckCircle2 className="h-4 w-4 text-[#45f798]" />
              ) : (
                <AlertCircle className="h-4 w-4 text-amber-400" />
              )}
              {ready ? "Milestone condition satisfied" : "Milestone condition not met"}
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              {nextMilestone
                ? `Next release requires score ${nextMilestone.threshold_score}. Current agent score is ${score}.`
                : "All milestone thresholds for this round have already been evaluated."}
            </p>
          </div>

          <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
            Latest proof
          </div>
          <div className="mt-2 text-xs text-zinc-500">
            {proof?.created_at ? formatDate(proof.created_at) : "No saved agent proof yet"}
          </div>
        </div>

        <div className="space-y-5 p-5">
          {proofError ? (
            <StateMessage
              icon={XCircle}
              title="Agent proof unavailable"
              message={proofError}
              tone="error"
            />
          ) : !output ? (
            <StateMessage
              icon={RadioTower}
              title="No saved agent proof"
              message="Run an AI evaluation to persist a startup scorer output and update the traction score used by milestone release logic."
              tone="muted"
            />
          ) : (
            <>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Explanation</div>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {output.summary || "The agent returned a score without a written explanation."}
                </p>
              </div>

              {dimensions.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Score dimensions</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                    {dimensions.map(([key, value]) => (
                      <DimensionBar key={key} label={formatDimension(key)} value={Number(value)} />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-4 lg:grid-cols-2">
                <FlagList title="Green flags" flags={output.green_flags || []} positive />
                <FlagList title="Red flags" flags={output.red_flags || []} />
              </div>

              <SignalStrip signals={githubSignals} />
            </>
          )}

          {message && (
            <div className="rounded-sm border border-[#1F1F1F] bg-black p-3 text-xs text-zinc-400">
              {message}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProofMetric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "strong" | "positive" | "warning";
}) {
  const valueClass =
    tone === "positive"
      ? "text-[#45f798]"
      : tone === "warning"
        ? "text-amber-300"
        : "text-white";

  return (
    <div className="rounded-sm border border-[#1F1F1F] bg-black p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">{label}</div>
      <div className={`mt-1 truncate text-lg font-semibold ${valueClass}`}>{value}</div>
    </div>
  );
}

function DimensionBar({ label, value }: { label: string; value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 20) * 100));

  return (
    <div className="rounded-sm border border-[#1F1F1F] bg-black p-3">
      <div className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">{label}</div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-white">{value}/20</span>
        <span className="text-zinc-600">{Math.round(pct)}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1F1F1F]">
        <div className="h-full bg-[#45f798]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FlagList({ title, flags, positive = false }: { title: string; flags: string[]; positive?: boolean }) {
  return (
    <div className="rounded-sm border border-[#1F1F1F] bg-black p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{title}</div>
      {flags.length > 0 ? (
        <div className="mt-3 space-y-2">
          {flags.slice(0, 4).map((flag, index) => (
            <div key={`${flag}-${index}`} className="flex gap-2 text-xs leading-5 text-zinc-400">
              {positive ? (
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#45f798]" />
              ) : (
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
              )}
              <span>{flag}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-zinc-600">No flags saved in the latest evaluation.</p>
      )}
    </div>
  );
}

function SignalStrip({ signals }: { signals?: Record<string, unknown> | null }) {
  if (!signals) {
    return (
      <div className="rounded-sm border border-[#1F1F1F] bg-black p-4 text-xs text-zinc-600">
        No external signal payload was saved with this proof.
      </div>
    );
  }

  const rows = [
    ["Repository", repoLabel(signals)],
    ["Stars", valueLabel(signals.stars)],
    ["Forks", valueLabel(signals.forks)],
    ["Recent commits", valueLabel(signals.recent_commits)],
    ["Contributors", valueLabel(signals.contributors)],
  ];

  return (
    <div className="rounded-sm border border-[#1F1F1F] bg-black p-4">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        <GitBranch className="h-3.5 w-3.5" />
        Relevant signals
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-5">
        {rows.map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-sm border border-[#1F1F1F] bg-[#080808] p-2">
            <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-zinc-700">{label}</div>
            <div className="mt-1 truncate text-xs font-semibold text-zinc-300">{value}</div>
          </div>
        ))}
      </div>
      {typeof signals.error === "string" && (
        <p className="mt-3 text-xs text-amber-300">GitHub signal fetch warning: {signals.error}</p>
      )}
    </div>
  );
}

function StateMessage({
  icon: Icon,
  title,
  message,
  tone,
}: {
  icon: typeof RadioTower;
  title: string;
  message: string;
  tone: "muted" | "error";
}) {
  return (
    <div className="rounded-sm border border-[#1F1F1F] bg-black p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Icon className={tone === "error" ? "h-4 w-4 text-red-400" : "h-4 w-4 text-[#45f798]"} />
        {title}
      </div>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{message}</p>
    </div>
  );
}

function readinessVerdict(score: number, nextMilestone?: LaunchpadMilestone | null) {
  if (nextMilestone && score >= nextMilestone.threshold_score) return "INVEST";
  if (score >= 70) return "HOLD";
  return "PASS";
}

function verdictTone(verdict: string) {
  if (verdict === "INVEST") return "positive";
  if (verdict === "HOLD") return "warning";
  return "default";
}

function formatDimension(value: string) {
  return value.replace(/_/g, " ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function repoLabel(signals: Record<string, unknown>) {
  const owner = typeof signals.owner === "string" ? signals.owner : "";
  const repo = typeof signals.repo === "string" ? signals.repo : "";
  return owner && repo ? `${owner}/${repo}` : "N/A";
}

function valueLabel(value: unknown) {
  return typeof value === "number" || typeof value === "string" ? String(value) : "N/A";
}
