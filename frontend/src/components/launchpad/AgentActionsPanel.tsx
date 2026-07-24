"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  generateInvestorMemo,
  refreshStartupSignals,
  runStartupEvaluation,
} from "@/actions";
import type { LaunchpadAgentOutput } from "@/types/launchpad";

type StartupActionProfile = {
  id: string;
  name: string;
  traction_score?: number | null;
  data_quality_score?: number | null;
  github_url?: string | null;
  last_enriched_at?: string | null;
};

type RunningAction = "score" | "memo" | "enrich" | null;

type Notice = {
  type: "success" | "error";
  title: string;
  body: string;
} | null;

const ACTION_META = {
  score: {
    label: "Run AI Score",
    progress: [
      "Loading startup profile and GitHub signals",
      "Scoring traction, readiness, and execution",
      "Persisting score to Supabase and updating traction_score",
    ],
  },
  memo: {
    label: "Generate Investor Memo",
    progress: [
      "Loading latest durable score context",
      "Writing investor memo from startup evidence",
      "Persisting memo into agent_outputs",
    ],
  },
  enrich: {
    label: "Refresh External Signals",
    progress: [
      "Refreshing external company and repository signals",
      "Recomputing profile data quality",
      "Revalidating startup profile views",
    ],
  },
} as const;

export function AgentActionsPanel({
  startup,
  latestScore,
  latestMemo,
}: {
  startup: StartupActionProfile;
  latestScore: LaunchpadAgentOutput | null;
  latestMemo: LaunchpadAgentOutput | null;
}) {
  const router = useRouter();
  const [runningAction, setRunningAction] = useState<RunningAction>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [isPending, startTransition] = useTransition();

  const currentScore = latestScore?.output_json?.total ?? startup.traction_score ?? 0;
  const memo = latestMemo?.output_json;

  return (
    <section className="overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] text-white">
      <div className="flex flex-col gap-4 border-b border-[#1F1F1F] p-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
            <Brain className="h-3.5 w-3.5" />
            Agent actions
          </div>
          <h2 className="mt-2 text-xl font-semibold">Run and persist AI work</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Trigger scoring, memo generation, and signal enrichment from the startup profile. Outputs are stored as durable `agent_outputs` records when the backend completes.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
          <ActionButton
            icon={Sparkles}
            label={ACTION_META.score.label}
            disabled={isPending}
            active={runningAction === "score"}
            onClick={() => runAction("score")}
          />
          <ActionButton
            icon={FileText}
            label={ACTION_META.memo.label}
            disabled={isPending}
            active={runningAction === "memo"}
            onClick={() => runAction("memo")}
          />
          <ActionButton
            icon={RefreshCw}
            label={ACTION_META.enrich.label}
            disabled={isPending}
            active={runningAction === "enrich"}
            onClick={() => runAction("enrich")}
          />
        </div>
      </div>

      <div className="grid gap-px bg-[#1F1F1F] lg:grid-cols-[0.85fr_1.15fr]">
        <div className="bg-[#0A0A0A] p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <StatusTile label="Latest score" value={`${currentScore}/100`} />
            <StatusTile label="Score verdict" value={latestScore?.output_json?.verdict || "Not scored"} />
            <StatusTile label="Memo recommendation" value={memo?.recommendation || "Not generated"} />
            <StatusTile label="Data quality" value={`${startup.data_quality_score ?? 0}/100`} />
          </div>
          <div className="mt-4 border border-[#1F1F1F] bg-black p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">Signal freshness</div>
            <p className="mt-2 text-sm text-zinc-300">
              {startup.last_enriched_at
                ? `Last enriched ${new Date(startup.last_enriched_at).toLocaleString()}`
                : "External signals have not been refreshed yet."}
            </p>
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-5">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">Agent workstream</div>
          {runningAction ? (
            <div className="mt-4 grid gap-2">
              {ACTION_META[runningAction].progress.map((line, index) => (
                <div key={line} className="flex items-center gap-2 border border-[#1F1F1F] bg-black px-3 py-2 text-sm text-zinc-300">
                  {index === ACTION_META[runningAction].progress.length - 1 ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#45f798]" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#45f798]" />
                  )}
                  {line}
                </div>
              ))}
            </div>
          ) : memo ? (
            <div className="mt-4 border border-[#1F1F1F] bg-black p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-white">{memo.title || "Latest investor memo"}</span>
                {memo.risk_level && (
                  <span className="rounded-sm border border-[#2A2A2A] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
                    Risk {memo.risk_level}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                {memo.one_liner || "Investor memo was generated and persisted, but no one-liner was returned."}
              </p>
            </div>
          ) : (
            <div className="mt-4 border border-[#1F1F1F] bg-black p-4 text-sm text-zinc-500">
              Generate an investor memo to turn the latest score and startup profile into a durable diligence artifact.
            </div>
          )}

          {notice && (
            <div className={`mt-4 border p-3 ${notice.type === "success" ? "border-[#45f798]/30 bg-[#45f798]/10 text-[#45f798]" : "border-red-400/30 bg-red-400/10 text-red-200"}`}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]">
                {notice.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {notice.title}
              </div>
              <p className="mt-2 text-sm leading-6 text-current/80">{notice.body}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  function runAction(action: Exclude<RunningAction, null>) {
    setRunningAction(action);
    setNotice(null);

    startTransition(async () => {
      const result =
        action === "score"
          ? await runStartupEvaluation(startup.id)
          : action === "memo"
            ? await generateInvestorMemo(startup.id)
            : await refreshStartupSignals(startup.id);

      if (!result.ok) {
        setNotice({
          type: "error",
          title: `${ACTION_META[action].label} failed`,
          body: result.error,
        });
        setRunningAction(null);
        return;
      }

      setNotice({
        type: "success",
        title: `${ACTION_META[action].label} complete`,
        body: successMessage(action, result.data),
      });
      setRunningAction(null);
      router.refresh();
    });
  }
}

function ActionButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: typeof Sparkles;
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-[#2A2A2A] bg-black px-3 text-xs font-bold text-zinc-200 transition-colors hover:border-[#45f798]/50 hover:text-[#45f798] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function StatusTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 border border-[#1F1F1F] bg-black p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">{label}</div>
      <div className="mt-2 truncate font-mono text-sm font-semibold text-zinc-200" title={value}>
        {value}
      </div>
    </div>
  );
}

function successMessage(action: Exclude<RunningAction, null>, data: unknown) {
  if (action === "score") {
    const score = typeof data === "object" && data && "traction_score" in data ? (data as { traction_score?: number }).traction_score : undefined;
    return `Startup score persisted${typeof score === "number" ? ` at ${score}/100` : ""}. Release logic will use the updated traction_score.`;
  }

  if (action === "memo") {
    return "Investor memo persisted as an agent_outputs record and is now available on this profile.";
  }

  const message = typeof data === "object" && data && "message" in data ? (data as { message?: string }).message : undefined;
  return message || "External startup signals refreshed.";
}
