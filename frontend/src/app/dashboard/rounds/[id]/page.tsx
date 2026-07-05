import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, ShieldCheck } from "lucide-react";
import { getLaunchpadRound } from "@/lib/launchpad";
import { MilestoneTracker } from "@/components/launchpad/MilestoneTracker";
import { EvaluateRoundButton } from "@/components/launchpad/EvaluateRoundButton";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function RoundDetailPage({ params }: PageProps) {
  const { id } = await params;
  const round = await getLaunchpadRound(id);
  if (!round) notFound();

  const currentScore = round.startup?.traction_score ?? 0;
  const milestones = round.milestones || [];
  const releasedCount = milestones.filter((milestone) => milestone.released_at).length;
  const nextMilestone = [...milestones].sort((a, b) => a.milestone_index - b.milestone_index).find((milestone) => !milestone.released_at);
  const ready = nextMilestone ? currentScore >= nextMilestone.threshold_score : false;
  const escrowReference = escrowReferenceFor(round.escrow_contract_uref);
  const safeMintHref = deployHref(round.safe_nft_mint_hash);

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-[#45f798]">
        <ArrowLeft className="h-3.5 w-3.5" />
        Launchpad rounds
      </Link>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-sm border border-[#45f798]/30 bg-[#45f798]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#45f798]">
                  {round.status}
                </span>
                {ready && (
                  <span className="rounded-sm border border-white/20 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
                    Release ready
                  </span>
                )}
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-white">{round.startup?.name || "Startup round"}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                AI-governed funding round backed by Codequity traction score thresholds and Casper escrow audit trails.
              </p>
            </div>
            {round.startup?.id && (
              <Link
                href={`/dashboard/startups/${round.startup.id}`}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-sm border border-[#2A2A2A] px-3 text-xs font-semibold text-zinc-300 hover:border-[#45f798]/50 hover:text-[#45f798]"
              >
                Startup profile
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <Stat label="Amount" value={`${formatNumber(round.amount_cspr)} CSPR`} />
            <Stat label="Score" value={`${currentScore}/100`} />
            <Stat label="Released" value={`${releasedCount}/${milestones.length}`} />
            <Stat label="Investor" value={round.investor?.firm || round.investor?.name || "Not set"} />
          </div>
        </div>

        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Release control
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Evaluate the current startup score against unreleased milestones and authorize the matching Casper release transaction.
          </p>
          <div className="mt-5">
            <EvaluateRoundButton roundId={round.id} />
          </div>
        </div>
      </section>

      <MilestoneTracker milestones={milestones} currentScore={currentScore} />

      <section className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">On-chain references</div>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <Reference 
            label={escrowReference.label}
            value={escrowReference.value}
            href={escrowReference.href}
          />
          <Reference 
            label="SAFE NFT mint" 
            value={safeMintHref ? round.safe_nft_mint_hash! : "Pending"}
            href={safeMintHref}
          />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-sm border border-[#1F1F1F] bg-black p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function Reference({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <div className="min-w-0 rounded-sm border border-[#1F1F1F] bg-black p-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">{label}</div>
      <div className="mt-1 truncate font-mono text-xs text-zinc-300">{value}</div>
    </div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      {content}
    </a>
  ) : content;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(value);
}

function escrowReferenceFor(value?: string | null) {
  const placeholderHash = "hash-c489f547dc4a855d7a9361cbaf649af8d9c17528a1fa072bbd0c6bb12b008765";
  const normalized = value?.trim() || "";

  if (normalized && normalized.toLowerCase() !== placeholderHash && /^hash-[\da-f]{64}$/i.test(normalized)) {
    return {
      label: "Escrow contract",
      value: normalized,
      href: `https://testnet.cspr.live/contract/${normalized}`,
    };
  }

  const accountPubkey = normalized.startsWith("account-")
    ? normalized.slice("account-".length)
    : process.env.NEXT_PUBLIC_CASPER_ESCROW_PUBLIC_KEY?.trim() || "";

  if (/^(?:01[\da-f]{64}|02[\da-f]{66})$/i.test(accountPubkey)) {
    return {
      label: "Escrow account",
      value: accountPubkey,
      href: `https://testnet.cspr.live/account/${accountPubkey}`,
    };
  }

  return {
    label: "Escrow account",
    value: "Not configured",
    href: undefined,
  };
}

function deployHref(value?: string | null) {
  return value && /^[\da-f]{64}$/i.test(value) ? `https://testnet.cspr.live/deploy/${value}` : undefined;
}
