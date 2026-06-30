"use client";

import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { createFundingRound } from "@/actions";
import type { LaunchpadInvestor, LaunchpadStartup } from "@/types/launchpad";

type DraftMilestone = {
  threshold_score: number;
  release_percent: number;
};

export function CreateRoundForm({
  startups,
  investors,
}: {
  startups: LaunchpadStartup[];
  investors: LaunchpadInvestor[];
}) {
  const [startupId, setStartupId] = useState("");
  const [investorId, setInvestorId] = useState("");
  const [amount, setAmount] = useState("");
  const [milestones, setMilestones] = useState<DraftMilestone[]>([
    { threshold_score: 60, release_percent: 50 },
    { threshold_score: 80, release_percent: 50 },
  ]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const releaseTotal = useMemo(
    () => milestones.reduce((sum, milestone) => sum + milestone.release_percent, 0),
    [milestones],
  );
  const selectedStartup = startups.find((startup) => startup.id === startupId);
  const selectedInvestor = investors.find((investor) => investor.id === investorId);
  const canSubmit = startupId && investorId && Number(amount) > 0 && Math.abs(releaseTotal - 100) <= 0.001;

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        startTransition(async () => {
          try {
            const result = await createFundingRound({
              startup_id: startupId,
              investor_id: investorId,
              amount_cspr: Number(amount),
              milestones,
            });
            setMessage(`Round created: ${result.id}`);
            setStartupId("");
            setInvestorId("");
            setAmount("");
            setMilestones([
              { threshold_score: 60, release_percent: 50 },
              { threshold_score: 80, release_percent: 50 },
            ]);
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Failed to create round.");
          }
        });
      }}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Startup">
          <select
            value={startupId}
            onChange={(event) => setStartupId(event.target.value)}
            className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
            required
          >
            <option value="">Select startup</option>
            {startups.map((startup) => (
              <option key={startup.id} value={startup.id}>
                {startup.name} {startup.wallet_pubkey ? "" : "(missing wallet)"}
              </option>
            ))}
          </select>
          {selectedStartup && (
            <p className="mt-2 text-xs text-zinc-500">
              Score {selectedStartup.traction_score ?? 0}/100 - {selectedStartup.wallet_pubkey ? "Wallet ready" : "Wallet missing"}
            </p>
          )}
        </Field>

        <Field label="Investor">
          <select
            value={investorId}
            onChange={(event) => setInvestorId(event.target.value)}
            className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
            required
          >
            <option value="">Select investor</option>
            {investors.map((investor) => (
              <option key={investor.id} value={investor.id}>
                {investor.firm ? `${investor.name} - ${investor.firm}` : investor.name} {investor.wallet_pubkey ? "" : "(missing wallet)"}
              </option>
            ))}
          </select>
          {selectedInvestor && (
            <p className="mt-2 text-xs text-zinc-500">
              {selectedInvestor.firm || "Independent"} - {selectedInvestor.wallet_pubkey ? "Wallet ready" : "Wallet missing"}
            </p>
          )}
        </Field>
      </div>

      <Field label="Round amount">
        <div className="flex h-10 overflow-hidden rounded-sm border border-[#2A2A2A] bg-[#080808] focus-within:border-[#45f798]/50">
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="1000"
            className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none"
            required
          />
          <span className="flex items-center border-l border-[#2A2A2A] px-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">
            CSPR
          </span>
        </div>
      </Field>

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Milestones</div>
            <p className="mt-1 text-xs text-zinc-500">Release percentages must total 100.</p>
          </div>
          <span className={Math.abs(releaseTotal - 100) <= 0.001 ? "text-xs font-semibold text-[#45f798]" : "text-xs font-semibold text-red-400"}>
            {releaseTotal}% total
          </span>
        </div>

        {milestones.map((milestone, index) => (
          <div key={index} className="grid gap-2 rounded-sm border border-[#1F1F1F] bg-[#080808] p-3 sm:grid-cols-[1fr_1fr_auto]">
            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Score threshold</span>
              <input
                value={milestone.threshold_score}
                onChange={(event) => updateMilestone(index, { threshold_score: Number(event.target.value) })}
                type="number"
                min="0"
                max="100"
                className="h-9 w-full rounded-sm border border-[#2A2A2A] bg-black px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
              />
            </label>
            <label className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-600">Release percent</span>
              <input
                value={milestone.release_percent}
                onChange={(event) => updateMilestone(index, { release_percent: Number(event.target.value) })}
                type="number"
                min="0"
                max="100"
                step="0.01"
                className="h-9 w-full rounded-sm border border-[#2A2A2A] bg-black px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
              />
            </label>
            <button
              type="button"
              onClick={() => setMilestones((current) => current.filter((_, milestoneIndex) => milestoneIndex !== index))}
              disabled={milestones.length === 1}
              className="inline-flex h-9 items-center justify-center gap-2 self-end rounded-sm border border-[#2A2A2A] px-3 text-xs font-semibold text-zinc-400 transition-colors hover:border-red-400/40 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setMilestones((current) => [...current, { threshold_score: 90, release_percent: 0 }])}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-[#2A2A2A] px-3 text-xs font-semibold text-zinc-300 transition-colors hover:border-[#45f798]/50 hover:text-[#45f798]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add milestone
        </button>
      </div>

      <div className="flex flex-col gap-3 border-t border-[#1F1F1F] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-zinc-500">
          This creates the DB round and placeholder chain records until Casper release is connected.
        </p>
        <button
          type="submit"
          disabled={!canSubmit || isPending}
          className="inline-flex h-10 items-center justify-center rounded-sm bg-[#45f798] px-5 text-xs font-bold text-black transition-colors hover:bg-[#63ffab] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create round"}
        </button>
      </div>

      {message && <p className="text-xs text-zinc-400">{message}</p>}
    </form>
  );

  function updateMilestone(index: number, patch: Partial<DraftMilestone>) {
    setMilestones((current) =>
      current.map((milestone, milestoneIndex) =>
        milestoneIndex === index ? { ...milestone, ...patch } : milestone,
      ),
    );
  }
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
