import Link from "next/link";
import { ArrowLeft, CheckCircle2, ExternalLink, RadioTower, XCircle } from "lucide-react";
import { listOnChainTransactions } from "@/lib/launchpad";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const transactions = await listOnChainTransactions();

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
          <RadioTower className="h-3.5 w-3.5" />
          On-chain audit trail
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Transaction history
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Every escrow deploy, SAFE mint, and milestone release recorded by the Codequity Launchpad agent.
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-8 text-center">
          <RadioTower className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-4 text-sm font-semibold text-white">No transactions yet.</p>
          <p className="mt-2 text-xs text-zinc-500">
            Create a round and run an evaluation to see on-chain events appear here.
          </p>
          <Link
            href="/dashboard/admin/rounds/create"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-sm bg-[#45f798] px-4 text-xs font-bold text-black hover:bg-[#63ffab]"
          >
            Create first round
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#0A0A0A]">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 border-b border-[#1F1F1F] px-4 py-2.5">
            <div className="col-span-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">Status</div>
            <div className="pl-4 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">Transaction</div>
            <div className="px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">Action</div>
            <div className="px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">Round</div>
            <div className="pl-4 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">Time</div>
          </div>

          <div className="divide-y divide-[#1F1F1F]">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-0 px-4 py-3 hover:bg-[#0D0D0D]"
              >
                {/* Status icon */}
                <div>
                  {tx.status === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-[#45f798]" />
                  ) : tx.status === "failed" ? (
                    <XCircle className="h-4 w-4 text-red-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-zinc-600 border-t-transparent animate-spin" />
                  )}
                </div>

                {/* Tx hash */}
                <div className="min-w-0 pl-4">
                  {tx.transaction_hash && tx.transaction_hash !== "failed" ? (
                    <a
                      href={`https://testnet.casper.network/deploy/${tx.transaction_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 font-mono text-xs text-zinc-300 hover:text-[#45f798]"
                    >
                      <span className="truncate">{tx.transaction_hash}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="font-mono text-xs text-red-400">failed</span>
                  )}
                  <div className="mt-0.5 truncate font-mono text-[10px] text-zinc-600">
                    {tx.contract_uref}
                  </div>
                </div>

                {/* Action badge */}
                <div className="px-4">
                  <ActionBadge action={tx.action} />
                </div>

                {/* Round link */}
                <div className="px-4">
                  {tx.funding_round_id ? (
                    <Link
                      href={`/dashboard/rounds/${tx.funding_round_id}`}
                      className="font-mono text-[10px] text-zinc-500 hover:text-[#45f798]"
                    >
                      {tx.funding_round_id.slice(0, 8)}…
                    </Link>
                  ) : (
                    <span className="text-[10px] text-zinc-700">—</span>
                  )}
                </div>

                {/* Timestamp */}
                <div className="pl-4 text-[10px] text-zinc-600 whitespace-nowrap">
                  {tx.created_at ? formatDate(tx.created_at) : "—"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    release_funds:
      "border-[#45f798]/30 bg-[#45f798]/10 text-[#45f798]",
    create_escrow:
      "border-blue-400/30 bg-blue-400/10 text-blue-400",
    mint_safe:
      "border-purple-400/30 bg-purple-400/10 text-purple-400",
    deposit:
      "border-zinc-600 bg-[#1A1A1A] text-zinc-400",
  };
  const labels: Record<string, string> = {
    release_funds: "Release",
    create_escrow: "Deploy",
    mint_safe: "Mint SAFE",
    deposit: "Deposit",
  };
  const cls = styles[action] ?? "border-zinc-600 bg-[#1A1A1A] text-zinc-400";
  return (
    <span className={`rounded-sm border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] ${cls}`}>
      {labels[action] ?? action}
    </span>
  );
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
