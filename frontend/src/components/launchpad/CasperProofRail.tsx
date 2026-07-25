import {
  CheckCircle2,
  ExternalLink,
  FileKey2,
  KeyRound,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
  Timer,
} from "lucide-react";
import {
  CODEQUITY_ESCROW_PUBLIC_KEY,
  CSPR_TESTNET_EXPLORER,
  ESCROW_CONTRACT_UREF,
  csprContractHref,
} from "@/lib/casper-deployment";
import type { LaunchpadRound, LaunchpadTransaction } from "@/types/launchpad";

export function CasperProofRail({ round }: { round: LaunchpadRound }) {
  const transactions = round.on_chain_transactions || [];
  const depositTx = findLatestTransaction(transactions, "deposit");
  const escrowDeployTx = findLatestTransaction(transactions, "create_escrow");
  const safeMintTx = findLatestTransaction(transactions, "mint_safe");
  const releaseHashes = releaseDeployHashes(round);
  const escrow = escrowDetails(round.escrow_contract_uref);
  const publicKey = process.env.NEXT_PUBLIC_CASPER_AGENT_PUBLIC_KEY?.trim()
    || process.env.NEXT_PUBLIC_CASPER_ESCROW_PUBLIC_KEY?.trim()
    || CODEQUITY_ESCROW_PUBLIC_KEY
    || "";

  return (
    <section className="overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#0A0A0A]">
      <div className="flex flex-col gap-3 border-b border-[#1F1F1F] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
            <RadioTower className="h-3.5 w-3.5" />
            Casper proof rail
          </div>
          <h2 className="mt-2 text-lg font-semibold text-white">Casper Testnet audit trail</h2>
        </div>
        <a
          href={CSPR_TESTNET_EXPLORER}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-sm border border-[#2A2A2A] px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-300 hover:border-[#45f798]/50 hover:text-[#45f798]"
        >
          Testnet explorer
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="grid gap-px bg-[#1F1F1F] lg:grid-cols-3">
        <ProofCell
          icon={FileKey2}
          label="Deposit deploy"
          value={depositTx?.transaction_hash || "Pending"}
          status={depositTx?.status || "pending"}
          href={deployHref(depositTx?.transaction_hash)}
        />
        <ProofCell
          icon={LockKeyhole}
          label="Escrow deploy"
          value={escrowDeployTx?.transaction_hash || "Pending"}
          status={escrowDeployTx?.status || "pending"}
          href={deployHref(escrowDeployTx?.transaction_hash)}
        />
        <ProofCell
          icon={ShieldCheck}
          label="SAFE NFT mint"
          value={safeMintTx?.transaction_hash || round.safe_nft_mint_hash || "Pending"}
          status={safeMintTx?.status || (round.safe_nft_mint_hash ? "success" : "pending")}
          href={deployHref(safeMintTx?.transaction_hash || round.safe_nft_mint_hash)}
        />
        <ProofCell
          icon={CheckCircle2}
          label="Escrow mode"
          value={escrow.mode}
          status={escrow.mode === "Not configured" ? "missing" : "success"}
        />
        <ProofCell
          icon={LockKeyhole}
          label={escrow.label}
          value={escrow.value}
          status={escrow.value === "Not configured" ? "missing" : "success"}
          href={escrow.href}
        />
        <ProofCell
          icon={KeyRound}
          label="Agent / escrow public key"
          value={publicKey || "Not configured"}
          status={publicKey ? "success" : "missing"}
          href={accountHref(publicKey)}
        />
      </div>

      <div className="border-t border-[#1F1F1F] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">Release deploy hashes</div>
            <p className="mt-1 text-xs text-zinc-500">
              Milestone releases appear here after the escrow wallet signs and the backend records the release.
            </p>
          </div>
          {releaseHashes.length === 0 ? (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-[#2A2A2A] px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
              <Timer className="h-3 w-3" />
              Pending
            </span>
          ) : (
            <div className="flex flex-wrap gap-2 md:justify-end">
              {releaseHashes.map((hash, index) => (
                <a
                  key={hash}
                  href={deployHref(hash)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-[#45f798]/30 bg-[#45f798]/10 px-2 font-mono text-[10px] font-semibold text-[#45f798] hover:bg-[#45f798]/15"
                >
                  Release {index + 1}: {shortRef(hash)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProofCell({
  icon: Icon,
  label,
  value,
  status,
  href,
}: {
  icon: typeof RadioTower;
  label: string;
  value: string;
  status: string;
  href?: string;
}) {
  const tone = status === "success"
    ? "border-[#45f798]/25 bg-[#45f798]/10 text-[#45f798]"
    : status === "failed"
      ? "border-red-400/25 bg-red-400/10 text-red-300"
      : "border-[#2A2A2A] bg-black text-zinc-500";

  const body = (
    <div className="min-w-0 bg-[#0A0A0A] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
        <span className={`rounded-sm border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] ${tone}`}>
          {statusLabel(status)}
        </span>
      </div>
      <div className="mt-3 truncate font-mono text-xs text-zinc-300">{displayValue(value)}</div>
    </div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className="block hover:bg-[#0D0D0D]">
      {body}
    </a>
  ) : body;
}

function findLatestTransaction(transactions: LaunchpadTransaction[], action: string) {
  return [...transactions]
    .filter((transaction) => transaction.action === action)
    .sort((a, b) => Date.parse(b.created_at || "") - Date.parse(a.created_at || ""))[0];
}

function releaseDeployHashes(round: LaunchpadRound) {
  const hashes = [
    ...(round.milestones || []).map((milestone) => milestone.tx_hash),
    ...(round.on_chain_transactions || [])
      .filter((transaction) => transaction.action === "release_funds")
      .map((transaction) => transaction.transaction_hash),
  ].filter((hash): hash is string => Boolean(hash && deployHref(hash)));

  return Array.from(new Set(hashes));
}

function escrowDetails(value?: string | null) {
  const normalized = value?.trim() || ESCROW_CONTRACT_UREF;

  if (normalized && /^hash-[\da-f]{64}$/i.test(normalized)) {
    return {
      mode: "Contract escrow",
      label: "Escrow contract",
      value: normalized,
      href: csprContractHref(normalized),
    };
  }

  if (normalized.startsWith("deploy-")) {
    const deployHash = normalized.slice("deploy-".length);
    return {
      mode: "Contract escrow",
      label: "Escrow deploy reference",
      value: deployHash,
      href: deployHref(deployHash),
    };
  }

  const accountPubkey = normalized.startsWith("account-")
    ? normalized.slice("account-".length)
    : process.env.NEXT_PUBLIC_CASPER_ESCROW_PUBLIC_KEY?.trim() || CODEQUITY_ESCROW_PUBLIC_KEY;

  if (isCasperPublicKey(accountPubkey)) {
    return {
      mode: "Wallet escrow",
      label: "Escrow account",
      value: accountPubkey,
      href: accountHref(accountPubkey),
    };
  }

  return {
    mode: "Not configured",
    label: "Escrow reference",
    value: "Not configured",
    href: undefined,
  };
}

function deployHref(value?: string | null) {
  return value && /^[\da-f]{64}$/i.test(value) ? `${CSPR_TESTNET_EXPLORER}/deploy/${value}` : undefined;
}

function accountHref(value?: string | null) {
  return isCasperPublicKey(value) ? `${CSPR_TESTNET_EXPLORER}/account/${value}` : undefined;
}

function isCasperPublicKey(value?: string | null) {
  return Boolean(value && /^(?:01[\da-f]{64}|02[\da-f]{66})$/i.test(value));
}

function shortRef(value: string) {
  if (value.length <= 18) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function displayValue(value: string) {
  return value.length > 42 ? shortRef(value) : value;
}

function statusLabel(status: string) {
  if (status === "success") return "Recorded";
  if (status === "failed") return "Failed";
  if (status === "missing") return "Not configured";
  return "Pending";
}
