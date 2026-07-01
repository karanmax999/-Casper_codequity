import Link from "next/link";
import { ArrowRight, CircleDollarSign, RadioTower, ShieldCheck, TerminalSquare, WalletCards } from "lucide-react";
import type { ComponentType } from "react";

const proofSteps = [
  {
    label: "01",
    title: "Investor opens a milestone round",
    description: "A CSPR escrow is linked to a startup profile, investor wallet, and release schedule.",
  },
  {
    label: "02",
    title: "CodeQuity score becomes the trigger",
    description: "GitHub, market, team, and funding signals resolve into a traction score threshold.",
  },
  {
    label: "03",
    title: "Casper records the release",
    description: "When a threshold is met, the backend submits the release transaction and stores the explorer trace.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <TerminalSquare className="h-7 w-7 text-accent" />
            <div>
              <div className="text-sm font-black uppercase tracking-tight text-white">CodeQuity</div>
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-accent">Casper Launchpad</div>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/sign-in" className="hidden h-9 items-center rounded-sm border border-border px-3 text-xs font-semibold text-zinc-300 hover:border-accent/50 hover:text-accent sm:inline-flex">
              Sign in
            </Link>
            <Link href="/dashboard" className="inline-flex h-9 items-center gap-2 rounded-sm bg-accent px-3 text-xs font-bold text-black hover:bg-[#63ffab]">
              Open demo
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100dvh-4rem)] max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:py-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-sm border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
            <ShieldCheck className="h-3.5 w-3.5" />
            Proof-of-traction escrow
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            Startup funding that releases when traction becomes real.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400">
            CodeQuity Launchpad connects AI traction scoring to Casper milestone escrow. Investors define thresholds, founders build, and release events become auditable on-chain.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/dashboard" className="inline-flex h-11 items-center justify-center gap-2 rounded-sm bg-accent px-5 text-sm font-bold text-black hover:bg-[#63ffab]">
              View rounds
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard/admin/rounds/create" className="inline-flex h-11 items-center justify-center rounded-sm border border-border px-5 text-sm font-semibold text-zinc-200 hover:border-accent/50 hover:text-accent">
              Create test round
            </Link>
          </div>
        </div>

        <div className="rounded-sm border border-border bg-[#0A0A0A] p-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Demo state</div>
              <div className="mt-1 text-lg font-semibold text-white">Threshold release engine</div>
            </div>
            <RadioTower className="h-5 w-5 text-accent" />
          </div>
          <div className="mt-5 space-y-3">
            <Signal label="Startup score" value="83/100" tone="green" />
            <Signal label="Milestone threshold" value="80/100" tone="green" />
            <Signal label="Release amount" value="500 CSPR" tone="white" />
          </div>
          <div className="mt-5 rounded-sm border border-accent/30 bg-accent/10 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Release ready</div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              The frontend is ready for dummy DB evaluation today and real Casper release once the contract adapter is connected.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {proofSteps.map((step) => (
            <div key={step.label} className="rounded-sm border border-border bg-[#0A0A0A] p-5">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">{step.label}</div>
              <h2 className="mt-4 text-lg font-semibold text-white">{step.title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-3">
          <FooterStat icon={CircleDollarSign} label="Funding primitive" value="Milestone escrow" />
          <FooterStat icon={WalletCards} label="Settlement layer" value="Casper testnet" />
          <FooterStat icon={ShieldCheck} label="Decision source" value="CodeQuity score" />
        </div>
      </section>
    </main>
  );
}

function Signal({ label, value, tone }: { label: string; value: string; tone: "green" | "white" }) {
  return (
    <div className="flex items-center justify-between rounded-sm border border-border bg-black px-3 py-3">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className={tone === "green" ? "font-mono text-sm font-bold text-accent" : "font-mono text-sm font-bold text-white"}>{value}</span>
    </div>
  );
}

function FooterStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-[#0A0A0A] text-accent">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">{label}</div>
        <div className="text-sm font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}
