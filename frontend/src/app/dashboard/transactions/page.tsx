import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  RadioTower,
  ShieldCheck,
  Sparkles,
  WalletCards,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { CSPR_TESTNET_EXPLORER } from "@/lib/casper-deployment";
import { listOnChainTransactions } from "@/lib/launchpad";
import type { LaunchpadTransaction } from "@/types/launchpad";

export const dynamic = "force-dynamic";

type TransactionRow = LaunchpadTransaction & {
  funding_round?: {
    id?: string | null;
    startup?: {
      name?: string | null;
    } | null;
  } | null;
};

const actionOrder = ["release_funds", "deposit", "mint_safe", "create_escrow"];

export default async function TransactionsPage() {
  const transactions = (await listOnChainTransactions()) as TransactionRow[];
  const stats = getTransactionStats(transactions);
  const activity = getActivityBuckets(transactions);
  const actionMix = getActionMix(transactions);

  return (
    <div className="mx-auto max-w-7xl space-y-6 py-2">
      <section className="flex flex-col gap-5 border-b border-[#1F1F1F] pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#45f798]">
            <RadioTower className="h-3.5 w-3.5" />
            On-chain audit trail
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Transaction command center
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Track escrow deploys, SAFE mints, deposits, and milestone releases with explorer-ready Casper proof.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/dashboard/admin/rounds/create"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-4 text-xs font-bold text-black transition-colors hover:bg-[#63ffab]"
          >
            Create round
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <a
            href={`${CSPR_TESTNET_EXPLORER}/`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-sm border border-white/10 px-4 text-xs font-bold text-zinc-200 transition-colors hover:bg-white/[0.05] hover:text-white"
          >
            Casper explorer
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={FileCheck2} label="Total events" value={String(stats.total)} helper="Recorded ledger entries" />
        <MetricCard icon={ShieldCheck} label="Successful" value={`${stats.successRate}%`} helper={`${stats.success} confirmed events`} tone="green" />
        <MetricCard icon={WalletCards} label="Releases" value={String(stats.releases)} helper="Milestone capital moves" tone="blue" />
        <MetricCard icon={Clock3} label="Latest proof" value={stats.latestLabel} helper="Most recent chain activity" tone="violet" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#0A0A0A]">
          <div className="border-b border-[#1F1F1F] p-5">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Transaction overview</h2>
              <p className="mt-1 text-xs text-zinc-500">
                Latest recorded transaction days across deposits, SAFE mints, escrow deploys, and releases.
              </p>
            </div>
          </div>
          <div className="p-5">
            <ActivityChart buckets={activity} />
          </div>
        </div>

        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Action mix</h2>
              <p className="mt-1 text-xs text-zinc-500">What the audit trail is proving.</p>
            </div>
            <Sparkles className="h-5 w-5 text-[#45f798]" />
          </div>
          <div className="mt-6 space-y-4">
            {actionMix.map((item) => (
              <div key={item.action}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <ActionBadge action={item.action} />
                  <span className="font-mono text-xs font-bold text-white">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-sm bg-white/[0.06]">
                  <div className={`h-full ${item.barClass}`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {transactions.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#0A0A0A]">
          <div className="flex items-center justify-between border-b border-[#1F1F1F] px-5 py-4">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white">Ledger</h2>
              <p className="mt-1 text-xs text-zinc-500">Explorer links, contract references, round IDs, and timestamps.</p>
            </div>
            <span className="hidden rounded-sm border border-[#45f798]/30 bg-[#45f798]/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#45f798] sm:inline">
              {transactions.length} rows
            </span>
          </div>

          <div className="hidden lg:block">
            <div className="grid grid-cols-[128px_minmax(0,1fr)_160px_130px_130px] border-b border-[#1F1F1F] bg-white/[0.02] px-5 py-3">
              <TableHead>Status</TableHead>
              <TableHead>Transaction proof</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Round</TableHead>
              <TableHead align="right">Time</TableHead>
            </div>
            <div className="divide-y divide-[#1F1F1F]">
              {transactions.map((tx) => (
                <TransactionTableRow key={tx.id} tx={tx} />
              ))}
            </div>
          </div>

          <div className="divide-y divide-[#1F1F1F] lg:hidden">
            {transactions.map((tx) => (
              <TransactionMobileCard key={tx.id} tx={tx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TransactionTableRow({ tx }: { tx: TransactionRow }) {
  return (
    <div className="grid grid-cols-[128px_minmax(0,1fr)_160px_130px_130px] items-center px-5 py-4 transition-colors hover:bg-[#0D110F]">
      <StatusPill status={tx.status} />
      <ProofCell tx={tx} />
      <div>
        <ActionBadge action={tx.action} />
      </div>
      <RoundCell tx={tx} />
      <div className="text-right text-xs text-zinc-500">{tx.created_at ? formatDate(tx.created_at) : "-"}</div>
    </div>
  );
}

function TransactionMobileCard({ tx }: { tx: TransactionRow }) {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <StatusPill status={tx.status} />
        <ActionBadge action={tx.action} />
      </div>
      <ProofCell tx={tx} />
      <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3">
        <RoundCell tx={tx} />
        <span className="text-xs text-zinc-500">{tx.created_at ? formatDate(tx.created_at) : "-"}</span>
      </div>
    </div>
  );
}

function ProofCell({ tx }: { tx: TransactionRow }) {
  const href = deployHref(tx.transaction_hash);

  return (
    <div className="min-w-0">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-2 font-mono text-xs font-semibold text-zinc-200 transition-colors hover:text-[#45f798]"
        >
          <span className="truncate">{tx.transaction_hash}</span>
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      ) : (
        <span className={tx.status === "failed" ? "font-mono text-xs font-semibold text-red-400" : "font-mono text-xs text-zinc-500"}>
          {tx.transaction_hash || "pending"}
        </span>
      )}
      <div className="mt-1 flex min-w-0 items-center gap-2">
        <span className="rounded-sm bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-600">
          {contractKind(tx.contract_uref)}
        </span>
        <span className="truncate font-mono text-[10px] text-zinc-600">
          {tx.contract_uref || "No contract reference"}
        </span>
      </div>
    </div>
  );
}

function RoundCell({ tx }: { tx: TransactionRow }) {
  if (!tx.funding_round_id) {
    return <span className="font-mono text-xs text-zinc-700">No round</span>;
  }

  return (
    <Link
      href={`/dashboard/rounds/${tx.funding_round_id}`}
      className="block min-w-0 font-mono text-xs text-zinc-400 transition-colors hover:text-[#45f798]"
      title={tx.funding_round_id}
    >
      <span className="block truncate">{tx.funding_round?.startup?.name || `${tx.funding_round_id.slice(0, 8)}...`}</span>
      <span className="mt-0.5 block truncate text-[10px] text-zinc-700">{tx.funding_round_id.slice(0, 8)}...</span>
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "success") {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-sm border border-[#45f798]/25 bg-[#45f798]/10 px-2.5 py-1 text-xs font-bold text-[#45f798]">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Success
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-sm border border-red-400/25 bg-red-400/10 px-2.5 py-1 text-xs font-bold text-red-300">
        <XCircle className="h-3.5 w-3.5" />
        Failed
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-sm border border-zinc-500/25 bg-zinc-500/10 px-2.5 py-1 text-xs font-bold text-zinc-300">
      <span className="h-3.5 w-3.5 rounded-full border-2 border-zinc-500 border-t-transparent" />
      Pending
    </span>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    release_funds: "border-[#45f798]/30 bg-[#45f798]/10 text-[#45f798]",
    create_escrow: "border-[#66f4ff]/30 bg-[#66f4ff]/10 text-[#66f4ff]",
    mint_safe: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    deposit: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  };
  const labels: Record<string, string> = {
    release_funds: "Release",
    create_escrow: "Escrow",
    mint_safe: "Mint SAFE",
    deposit: "Deposit",
  };
  const cls = styles[action] ?? "border-zinc-600 bg-[#1A1A1A] text-zinc-400";
  return (
    <span className={`inline-flex w-fit rounded-sm border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${cls}`}>
      {labels[action] ?? action.replaceAll("_", " ")}
    </span>
  );
}

function ActivityChart({ buckets }: { buckets: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...buckets.map((bucket) => bucket.value));
  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0);

  return (
    <div className="rounded-sm border border-white/10 bg-[#070707] p-4 sm:p-5">
      <div className="mb-5 flex items-start justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-600">Activity window</div>
          <div className="mt-1 text-sm font-semibold text-white">Latest 10 transaction days</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-semibold text-[#45f798]">{total}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">Events</div>
        </div>
      </div>

      <div className="space-y-3">
        {buckets.map((bucket, index) => {
          const width = Math.max(8, Math.round((bucket.value / max) * 100));
          return (
            <div key={bucket.label} className="grid gap-2 sm:grid-cols-[86px_1fr_58px] sm:items-center">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-sm border border-white/10 bg-white/[0.04] font-mono text-[10px] text-zinc-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="font-mono text-xs font-semibold text-zinc-300">{bucket.label}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-sm bg-white/[0.06]">
                <div className="h-full rounded-sm bg-gradient-to-r from-[#45f798] to-[#66f4ff]" style={{ width: `${width}%` }} />
              </div>
              <div className="font-mono text-xs font-bold text-white sm:text-right">
                {bucket.value} <span className="text-zinc-600">tx</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-zinc-500">
        <CheckCircle2 className="h-3.5 w-3.5 text-[#45f798]" />
        Showing recorded on-chain events from the launchpad audit table.
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
  tone?: "default" | "green" | "blue" | "violet";
}) {
  const tones = {
    default: "text-white",
    green: "text-[#45f798]",
    blue: "text-[#66f4ff]",
    violet: "text-violet-300",
  };

  return (
    <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">{label}</div>
        <Icon className={`h-4 w-4 ${tones[tone]}`} />
      </div>
      <div className={`mt-4 text-3xl font-semibold tracking-tight ${tones[tone]}`}>{value}</div>
      <p className="mt-1 text-xs text-zinc-500">{helper}</p>
    </div>
  );
}

function TableHead({ children, align = "left" }: { children: ReactNode; align?: "left" | "right" }) {
  return (
    <div className={`text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600 ${align === "right" ? "text-right" : ""}`}>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <section className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-10 text-center">
      <RadioTower className="mx-auto h-9 w-9 text-zinc-600" />
      <h2 className="mt-5 text-lg font-semibold text-white">No transactions yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Create a round and run a milestone evaluation to see deposits, SAFE mints, and release records appear here.
      </p>
      <Link
        href="/dashboard/admin/rounds/create"
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-5 text-xs font-bold text-black transition-colors hover:bg-[#63ffab]"
      >
        Create first round
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}

function getTransactionStats(transactions: TransactionRow[]) {
  const total = transactions.length;
  const success = transactions.filter((tx) => tx.status === "success").length;
  const releases = transactions.filter((tx) => tx.action === "release_funds").length;
  const latest = transactions[0]?.created_at;

  return {
    total,
    success,
    releases,
    successRate: total > 0 ? Math.round((success / total) * 100) : 0,
    latestLabel: latest ? relativeDate(latest) : "No activity",
  };
}

function getActionMix(transactions: TransactionRow[]) {
  const counts = new Map<string, number>();
  for (const tx of transactions) {
    counts.set(tx.action, (counts.get(tx.action) || 0) + 1);
  }

  const actions = [...new Set([...actionOrder, ...counts.keys()])].filter((action) => counts.has(action));
  const max = Math.max(1, ...actions.map((action) => counts.get(action) || 0));

  return actions.map((action) => ({
    action,
    count: counts.get(action) || 0,
    percent: Math.max(8, Math.round(((counts.get(action) || 0) / max) * 100)),
    barClass: actionBarClass(action),
  }));
}

function getActivityBuckets(transactions: TransactionRow[]) {
  const formatter = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
  const map = new Map<string, number>();

  for (const tx of transactions) {
    if (!tx.created_at) continue;
    const date = new Date(tx.created_at);
    if (Number.isNaN(date.getTime())) continue;
    const key = date.toISOString().slice(0, 10);
    map.set(key, (map.get(key) || 0) + 1);
  }

  const buckets = [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-10)
    .map(([key, value]) => ({
      label: formatter.format(new Date(`${key}T00:00:00`)),
      value,
    }));

  return buckets.length > 0 ? buckets : [{ label: "Today", value: 0 }];
}

function actionBarClass(action: string) {
  const styles: Record<string, string> = {
    release_funds: "bg-[#45f798]",
    create_escrow: "bg-[#66f4ff]",
    mint_safe: "bg-violet-400",
    deposit: "bg-zinc-400",
  };

  return styles[action] ?? "bg-zinc-500";
}

function contractKind(value?: string | null) {
  if (!value) return "ref";
  if (value.startsWith("hash-")) return "hash";
  if (value.startsWith("account-")) return "account";
  return "ref";
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

function relativeDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown";

  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(value);
}

function deployHref(value?: string | null) {
  return value && /^[\da-f]{64}$/i.test(value) ? `${CSPR_TESTNET_EXPLORER}/deploy/${value}` : undefined;
}
