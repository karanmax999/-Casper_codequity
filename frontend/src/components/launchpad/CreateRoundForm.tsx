"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import { broadcastCasperDeploy, createFundingRound } from "@/actions";
import { CSPR_TESTNET_EXPLORER } from "@/lib/casper-deployment";
import {
  CASPER_CHAIN_NAME,
  CASPER_ESCROW_PUBLIC_KEY,
  getConnectedCasperPublicKey,
  isValidCasperPublicKey,
  shortHash,
  signDeployWithCasperWallet,
} from "@/lib/casper-wallet";
import type { LaunchpadInvestor, LaunchpadStartup } from "@/types/launchpad";

type DraftMilestone = {
  threshold_score: number;
  release_percent: number;
};

type FormNotice =
  | {
      type: "info" | "error" | "success";
      title: string;
      body: string;
      roundId?: string;
      deployHash?: string;
    }
  | null;

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
  const [notice, setNotice] = useState<FormNotice>(null);
  const [isPending, startTransition] = useTransition();

  const releaseTotal = useMemo(
    () => milestones.reduce((sum, milestone) => sum + milestone.release_percent, 0),
    [milestones],
  );
  const selectedStartup = startups.find((startup) => startup.id === startupId);
  const selectedInvestor = investors.find((investor) => investor.id === investorId);
  const selectedStartupHasValidWallet = isValidCasperPublicKey(selectedStartup?.wallet_pubkey);
  const selectedInvestorHasValidWallet = isValidCasperPublicKey(selectedInvestor?.wallet_pubkey);
  const escrowReady = isValidCasperPublicKey(CASPER_ESCROW_PUBLIC_KEY);
  const amountNumber = Number(amount);

  const blockingIssues = useMemo(() => {
    const issues: string[] = [];

    if (!startupId) issues.push("Select the startup receiving the round.");
    if (!investorId) issues.push("Select the investor profile that will sign the deposit.");
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) issues.push("Enter a positive CSPR amount.");
    if (milestones.length === 0) issues.push("Add at least one milestone.");
    if (Math.abs(releaseTotal - 100) > 0.001) issues.push("Milestone release percentages must total exactly 100%.");
    if (selectedStartup && !selectedStartupHasValidWallet) issues.push("Selected startup is missing a valid Casper public key.");
    if (selectedInvestor && !selectedInvestorHasValidWallet) issues.push("Selected investor is missing a valid Casper public key.");
    if (!escrowReady) issues.push("NEXT_PUBLIC_CASPER_ESCROW_PUBLIC_KEY is not configured with a valid Casper public key.");

    return issues;
  }, [
    amountNumber,
    escrowReady,
    investorId,
    milestones.length,
    releaseTotal,
    selectedInvestor,
    selectedInvestorHasValidWallet,
    selectedStartup,
    selectedStartupHasValidWallet,
    startupId,
  ]);

  const canSubmit = blockingIssues.length === 0;

  return (
    <form
      className="space-y-0"
      onSubmit={(event) => {
        event.preventDefault();
        setNotice(null);

        if (!canSubmit) {
          setNotice({
            type: "error",
            title: "Review required before signing",
            body: blockingIssues[0],
          });
          return;
        }

        startTransition(async () => {
          let signature: string | undefined;
          let pubKey: string | undefined;
          let messageString: string | undefined;

          try {
            setNotice({
              type: "info",
              title: "Waiting for Casper Wallet",
              body: `Review the ${amountNumber} CSPR transfer to ${shortHash(CASPER_ESCROW_PUBLIC_KEY)} on ${CASPER_CHAIN_NAME}.`,
            });

            const casperSDK = require("casper-js-sdk");
            const { DeployUtil, CLPublicKey } = casperSDK.default || casperSDK;

            pubKey = await getConnectedCasperPublicKey();
            if (pubKey.toLowerCase() !== selectedInvestor!.wallet_pubkey!.toLowerCase()) {
              setNotice({
                type: "error",
                title: "Wallet mismatch",
                body: `Connected wallet ${shortHash(pubKey)} does not match selected investor wallet ${shortHash(selectedInvestor!.wallet_pubkey!)}. Switch wallets or update the investor profile before signing.`,
              });
              return;
            }

            const senderKey = CLPublicKey.fromHex(pubKey);
            const deployParams = new DeployUtil.DeployParams(senderKey, CASPER_CHAIN_NAME);
            const amountMotes = Math.floor(amountNumber * 1_000_000_000).toString();
            const session = DeployUtil.ExecutableDeployItem.newTransfer(
              amountMotes,
              CLPublicKey.fromHex(CASPER_ESCROW_PUBLIC_KEY),
              null,
              Date.now(),
            );
            const payment = DeployUtil.standardPayment(100000000);
            const deploy = DeployUtil.makeDeploy(deployParams, session, payment);

            const signed = await signDeployWithCasperWallet(
              deploy,
              casperSDK.default || casperSDK,
              "Payment signature was cancelled.",
              pubKey,
            );
            const signedDeploy = signed.deploy;
            pubKey = signed.publicKeyHex;

            setNotice({
              type: "info",
              title: "Broadcasting deposit",
              body: "Signed payment is being sent to Casper Testnet through the backend.",
            });

            const broadcastRes = await broadcastCasperDeploy(DeployUtil.deployToJson(signedDeploy), {
              wait: false,
            });
            if (!broadcastRes.ok) {
              setNotice({
                type: "error",
                title: "Casper deposit rejected",
                body: broadcastRes.error,
              });
              return;
            }

            const acceptedDeployHash = broadcastRes.data.deploy_hash || signed.deployHashHex;

            signature = signed.signatureHex;
            messageString = acceptedDeployHash;

            setNotice({
              type: "info",
              title: "Deposit accepted",
              body: `Casper Testnet accepted deploy ${shortHash(acceptedDeployHash)}. Creating the score-gated round record now.`,
              deployHash: acceptedDeployHash,
            });
          } catch (err: any) {
            console.error("Casper wallet error:", err);
            setNotice({
              type: "error",
              title: "Casper Wallet error",
              body: readableWalletError(err),
            });
            return;
          }

          const result = await createFundingRound({
            startup_id: startupId,
            investor_id: investorId,
            amount_cspr: amountNumber,
            milestones,
            investor_signature: signature,
            wallet_pubkey: pubKey,
            message_string: messageString,
            deposit_deploy_hash: messageString,
          });

          if (!result.ok) {
            setNotice({
              type: "error",
              title: "Round creation failed",
              body: result.error,
              deployHash: messageString,
            });
            return;
          }

          setNotice({
            type: "success",
            title: "Round created",
            body: `${selectedStartup?.name || "Startup"} now has a CSPR-backed, score-gated funding round on Casper Testnet.`,
            roundId: result.data.id,
            deployHash: messageString,
          });
        });
      }}
    >
      <FormSection step="01" title="Parties" description="Choose the startup receiving capital and the investor wallet that will sign the deposit.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Startup">
            <select
              value={startupId}
              onChange={(event) => {
                setStartupId(event.target.value);
                setNotice(null);
              }}
              className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
              required
            >
              <option value="">Select startup</option>
              {startups.map((startup) => (
                <option key={startup.id} value={startup.id}>
                  {startup.name} {isValidCasperPublicKey(startup.wallet_pubkey) ? "" : " (invalid or missing Casper wallet)"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Investor signer">
            <select
              value={investorId}
              onChange={(event) => {
                setInvestorId(event.target.value);
                setNotice(null);
              }}
              className="h-10 w-full rounded-sm border border-[#2A2A2A] bg-[#080808] px-3 text-sm text-white outline-none focus:border-[#45f798]/50"
              required
            >
              <option value="">Select investor</option>
              {investors.map((investor) => (
                <option key={investor.id} value={investor.id}>
                  {investor.firm ? `${investor.name} - ${investor.firm}` : investor.name} {isValidCasperPublicKey(investor.wallet_pubkey) ? "" : " (invalid or missing Casper wallet)"}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </FormSection>

      <FormSection step="02" title="Startup diligence" description="Check the funding signal before authorizing payment.">
        {selectedStartup ? (
          <div className="grid gap-px overflow-hidden border border-[#1F1F1F] bg-[#1F1F1F] md:grid-cols-3">
            <DiligenceMetric label="Traction score" value={`${selectedStartup.traction_score ?? 0}/100`} ok={(selectedStartup.traction_score ?? 0) >= 60} />
            <DiligenceMetric label="Data quality" value={`${selectedStartup.data_quality_score ?? 0}/100`} ok={(selectedStartup.data_quality_score ?? 0) >= 60} />
            <DiligenceMetric label="Verification" value={formatStatus(selectedStartup.verification_status)} ok={selectedStartup.verification_status === "verified"} />
            <DiligenceMetric label="GitHub signals" value={selectedStartup.github_url ? "Repository linked" : "Not linked"} ok={Boolean(selectedStartup.github_url)} />
            <DiligenceMetric label="Stage" value={selectedStartup.stage || "Not set"} ok={Boolean(selectedStartup.stage)} />
            <DiligenceMetric label="Startup wallet" value={selectedStartupHasValidWallet ? shortHash(selectedStartup.wallet_pubkey!) : "Missing or invalid"} ok={selectedStartupHasValidWallet} />
          </div>
        ) : (
          <EmptyReview text="Select a startup to preview traction, verification, GitHub, and wallet readiness." />
        )}
      </FormSection>

      <FormSection step="03" title="Round terms" description="Define the CSPR amount and score thresholds that unlock each release.">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <Field label="Round amount">
            <div className="flex h-10 overflow-hidden rounded-sm border border-[#2A2A2A] bg-[#080808] focus-within:border-[#45f798]/50">
              <input
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setNotice(null);
                }}
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
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Milestones</div>
              <span className={Math.abs(releaseTotal - 100) <= 0.001 ? "text-xs font-semibold text-[#45f798]" : "text-xs font-semibold text-red-400"}>
                {releaseTotal}% total
              </span>
            </div>

            {milestones.map((milestone, index) => (
              <div key={index} className="grid gap-2 border border-[#1F1F1F] bg-[#080808] p-3 sm:grid-cols-[1fr_1fr_auto]">
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
                  onClick={() => {
                    setMilestones((current) => current.filter((_, milestoneIndex) => milestoneIndex !== index));
                    setNotice(null);
                  }}
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
              onClick={() => {
                setMilestones((current) => [...current, { threshold_score: 90, release_percent: 0 }]);
                setNotice(null);
              }}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-[#2A2A2A] px-3 text-xs font-semibold text-zinc-300 transition-colors hover:border-[#45f798]/50 hover:text-[#45f798]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add milestone
            </button>
          </div>
        </div>
      </FormSection>

      <FormSection step="04" title="Review and sign" description="This is the exact payment context shown before Casper Wallet opens.">
        <div className="grid gap-px overflow-hidden border border-[#1F1F1F] bg-[#1F1F1F] lg:grid-cols-3">
          <ReviewItem label="Network" value={`${CASPER_CHAIN_NAME} Testnet`} />
          <ReviewItem label="Escrow recipient" value={escrowReady ? shortHash(CASPER_ESCROW_PUBLIC_KEY) : "Not configured"} />
          <ReviewItem label="Investor signer" value={selectedInvestor?.wallet_pubkey ? shortHash(selectedInvestor.wallet_pubkey) : "Select investor"} />
          <ReviewItem label="Amount" value={amountNumber > 0 ? `${amountNumber} CSPR` : "Enter amount"} />
          <ReviewItem label="Startup recipient" value={selectedStartup?.wallet_pubkey ? shortHash(selectedStartup.wallet_pubkey) : "Select startup"} />
          <ReviewItem label="Milestone releases" value={milestones.map((milestone) => `${milestone.threshold_score}:${milestone.release_percent}%`).join(" / ")} />
        </div>

        {blockingIssues.length > 0 && (
          <div className="mt-4 border border-amber-300/20 bg-amber-300/10 p-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-amber-200">
              <AlertCircle className="h-4 w-4" />
              Before signing
            </div>
            <div className="mt-2 space-y-1">
              {blockingIssues.map((issue) => (
                <p key={issue} className="text-xs text-amber-100/80">{issue}</p>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-zinc-500">
            Casper Wallet will sign a CSPR transfer to the configured escrow key. The backend stores the accepted deploy hash with the new round.
          </p>
          <button
            type="submit"
            disabled={!canSubmit || isPending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-5 text-xs font-bold text-black transition-colors hover:bg-[#63ffab] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />}
            {isPending ? "Signing and creating..." : "Review in Wallet"}
          </button>
        </div>
      </FormSection>

      {notice && <FormNoticeView notice={notice} />}
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

function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-[#1F1F1F] py-6 first:pt-0 last:border-b-0 last:pb-0">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">Step {step}</div>
          <h2 className="mt-1 text-sm font-semibold text-white">{title}</h2>
        </div>
        <p className="max-w-xl text-xs leading-5 text-zinc-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function DiligenceMetric({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="min-w-0 bg-[#080808] p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">{label}</span>
        {ok ? <CheckCircle2 className="h-3.5 w-3.5 text-[#45f798]" /> : <AlertCircle className="h-3.5 w-3.5 text-amber-300" />}
      </div>
      <div className="mt-2 truncate text-sm font-semibold text-zinc-200">{value}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-[#080808] p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-600">{label}</div>
      <div className="mt-2 truncate font-mono text-sm font-semibold text-zinc-200" title={value}>
        {value}
      </div>
    </div>
  );
}

function EmptyReview({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 border border-[#1F1F1F] bg-[#080808] p-4 text-sm text-zinc-500">
      <ShieldCheck className="h-4 w-4 text-zinc-600" />
      {text}
    </div>
  );
}

function FormNoticeView({ notice }: { notice: NonNullable<FormNotice> }) {
  const className =
    notice.type === "success"
      ? "border-[#45f798]/30 bg-[#45f798]/10 text-[#45f798]"
      : notice.type === "error"
        ? "border-red-400/30 bg-red-400/10 text-red-200"
        : "border-[#1F1F1F] bg-[#080808] text-zinc-300";

  return (
    <div className={`mt-5 border p-4 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em]">
            {notice.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {notice.title}
          </div>
          <p className="mt-2 text-sm leading-6 text-current/80">{notice.body}</p>
        </div>
      </div>

      {(notice.roundId || notice.deployHash) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {notice.roundId && (
            <Link
              href={`/dashboard/rounds/${notice.roundId}`}
              className="inline-flex h-9 items-center gap-2 rounded-sm bg-[#45f798] px-3 text-xs font-bold text-black"
            >
              Open live round
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {notice.deployHash && (
            <a
              href={`${CSPR_TESTNET_EXPLORER}/deploy/${notice.deployHash}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-sm border border-current/30 px-3 text-xs font-bold"
            >
              Casper deploy
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function formatStatus(value?: string | null) {
  return value ? value.replace(/_/g, " ") : "Self claimed";
}

function readableWalletError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown wallet error.";

  if (message.toLowerCase().includes("cancel")) {
    return "The Casper Wallet signature was cancelled. No round was created and no backend record was written.";
  }

  if (message.toLowerCase().includes("extension")) {
    return "Casper Wallet extension was not detected. Install or unlock the extension, then retry.";
  }

  if (message.toLowerCase().includes("rejected")) {
    return "Casper Wallet rejected the connection or signature request. Approve the request to continue.";
  }

  return message;
}
