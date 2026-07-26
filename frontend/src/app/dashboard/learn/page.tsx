import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpenText,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileCheck2,
  GitBranch,
  Landmark,
  LineChart,
  LockKeyhole,
  RadioTower,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import {
  CODEQUITY_ESCROW_PUBLIC_KEY,
  DEMO_PROTOCOL_PUBLIC_KEY,
  ESCROW_CONTRACT_UREF,
  SAFE_CONTRACT_UREF,
  csprAccountHref,
  csprContractHref,
} from "@/lib/casper-deployment";

const workflowSteps = [
  {
    title: "Discover",
    copy: "Start from the protocol directory and shortlist teams with visible product progress, GitHub velocity, and a credible funding need.",
    href: "/dashboard/startups",
    cta: "Browse startups",
  },
  {
    title: "Evaluate",
    copy: "Use CodeQuity scoring to compare technical execution, traction quality, milestone clarity, and investor readiness.",
    href: "/dashboard/startups",
    cta: "Review scores",
  },
  {
    title: "Fund",
    copy: "Create a round where capital is escrowed against milestones instead of being released entirely at signing.",
    href: "/dashboard/admin/rounds/create",
    cta: "Create round",
  },
  {
    title: "Monitor",
    copy: "Track milestone status, release history, and Casper proof records from the launchpad instead of chasing manual updates.",
    href: "/dashboard/transactions",
    cta: "View proof",
  },
];

const scoreSignals = [
  { icon: GitBranch, label: "GitHub velocity", copy: "Commit consistency, repo activity, and builder momentum." },
  { icon: Code2, label: "Product maturity", copy: "Working product signals instead of only pitch-deck claims." },
  { icon: LineChart, label: "Market traction", copy: "Growth, user interest, and external validation signals." },
  { icon: FileCheck2, label: "Milestone clarity", copy: "Whether the next release trigger is measurable and auditable." },
];

const revenueRows = [
  ["Success fee", "0.5% to 2%", "Charged only when milestone capital is released."],
  ["Investor intelligence", "Subscription", "Premium scoring, watchlists, alerts, and fund workflows."],
  ["AI diligence reports", "Credits or reports", "Paid technical and traction reports for investment teams."],
  ["Accelerator launchpad", "SaaS license", "White-label workflow for funds, accelerators, and ecosystems."],
];

const proofLinks = [
  {
    label: "Escrow account",
    value: CODEQUITY_ESCROW_PUBLIC_KEY,
    href: csprAccountHref(CODEQUITY_ESCROW_PUBLIC_KEY),
  },
  {
    label: "Demo protocol account",
    value: DEMO_PROTOCOL_PUBLIC_KEY,
    href: csprAccountHref(DEMO_PROTOCOL_PUBLIC_KEY),
  },
  {
    label: "Escrow contract",
    value: ESCROW_CONTRACT_UREF,
    href: csprContractHref(ESCROW_CONTRACT_UREF),
  },
  {
    label: "SAFE contract",
    value: SAFE_CONTRACT_UREF,
    href: csprContractHref(SAFE_CONTRACT_UREF),
  },
];

const demoCards = [
  {
    icon: Target,
    title: "Judge flow",
    copy: "Open a startup, review the traction score, create a milestone round, then check transaction proof.",
    href: "/docs#demo",
  },
  {
    icon: WalletCards,
    title: "Capital flow",
    copy: "Show how investor funds move into escrow and unlock only after milestone evaluation.",
    href: "/dashboard/admin/rounds/create",
  },
  {
    icon: RadioTower,
    title: "Casper proof",
    copy: "Use the transaction page and explorer links to prove the chain-backed settlement path.",
    href: "/dashboard/transactions",
  },
];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 py-2">
      <section className="relative overflow-hidden rounded-sm border border-[#1F1F1F] bg-[#080B09]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#45f798] to-transparent" />
        <div className="grid gap-8 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#45f798]">
              <BookOpenText className="h-3.5 w-3.5" />
              Investor Hub
            </div>
            <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Understand the deal, the proof, and how CodeQuity makes money.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
              This hub is built for funders, VCs, angels, founders, and hackathon judges who need a fast product-level
              view of how milestone-backed startup financing works.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard/startups"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-sm bg-[#45f798] px-5 text-xs font-bold text-black transition-colors hover:bg-[#63ffab]"
              >
                Start evaluating
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex h-10 items-center justify-center rounded-sm border border-white/10 px-5 text-xs font-bold text-zinc-200 transition-colors hover:bg-white/[0.05] hover:text-white"
              >
                Technical docs
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <HeroMetric label="Investor risk reduced by" value="Milestones" tone="green" />
            <HeroMetric label="Revenue trigger" value="Capital release" tone="blue" />
            <HeroMetric label="Trust layer" value="Casper proof" tone="violet" />
          </div>
        </div>
      </section>

      <section className="grid items-start gap-6 overflow-hidden border border-[#1F1F1F] bg-[#070907] p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div className="space-y-5">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#45f798]">
              <Users className="h-3.5 w-3.5" />
              Who this helps
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              One workflow for every capital role.
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              CodeQuity explains the same funding rail differently for VCs, angels, and founders, so each user knows
              exactly why the platform matters to them.
            </p>
          </div>

          <div className="space-y-2.5">
            <AudienceCard
              icon={Landmark}
              label="For VCs"
              title="Turn diligence into a repeatable pipeline."
              copy="Compare technical execution and milestone credibility before committing capital, then monitor releases from one dashboard."
            />
            <AudienceCard
              icon={Users}
              label="For Angels"
              title="Invest with clearer protection."
              copy="Back early builders while keeping capital tied to visible execution instead of promises made at pitch time."
            />
            <AudienceCard
              icon={Sparkles}
              label="For Founders"
              title="Raise by proving progress."
              copy="Use real traction and transparent milestones to earn investor confidence without relying only on network access."
            />
          </div>
        </div>

        <div className="w-full lg:justify-self-end">
          <div className="border border-white/10 bg-[#0A0A0A] p-3 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <div className="mb-3 px-1">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
                  <BookOpenText className="h-3.5 w-3.5" />
                  Investor walkthrough
                </div>
                <p className="mt-1 max-w-xs text-xs leading-5 text-zinc-500">
                  A quick visual guide for funders reviewing the launchpad.
                </p>
              </div>
            </div>
            <div className="relative mx-auto aspect-[9/16] w-full max-w-[260px] overflow-hidden border border-white/10 bg-black sm:max-w-[280px]">
              <video
                src="/docs_Investor.mp4"
                className="h-full w-full object-contain"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <VideoFact label="Mode" value="Loop" />
              <VideoFact label="Frame" value="9:16" />
              <VideoFact label="Use" value="Demo" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={Target}
          eyebrow="Workflow"
          title="How an investor uses CodeQuity"
          copy="The app should explain itself while users work. Each step below links back to the live workflow."
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <Link
              key={step.title}
              href={step.href}
              className="group rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-5 transition-colors hover:border-[#45f798]/45 hover:bg-[#0D110F]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#45f798]/30 bg-[#45f798]/10 font-mono text-xs font-bold text-[#45f798]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <h3 className="mt-5 text-sm font-bold text-white">{step.title}</h3>
              <p className="mt-2 min-h-[72px] text-xs leading-5 text-zinc-500">{step.copy}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#45f798]">
                {step.cta}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-6">
          <SectionHeader
            icon={BarChart3}
            eyebrow="Scoring"
            title="What the traction score means"
            copy="CodeQuity is designed to move investor attention from storytelling to verified execution signals."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {scoreSignals.map((signal) => (
              <div key={signal.label} className="rounded-sm border border-white/10 bg-white/[0.025] p-4">
                <signal.icon className="h-5 w-5 text-[#66f4ff]" />
                <h3 className="mt-3 text-sm font-bold text-white">{signal.label}</h3>
                <p className="mt-2 text-xs leading-5 text-zinc-500">{signal.copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-6">
          <SectionHeader
            icon={LockKeyhole}
            eyebrow="Escrow"
            title="Why milestone-backed capital matters"
            copy="The investor does not need blind trust, and the founder does not need to wait for manual approvals once proof is available."
          />
          <div className="mt-6 space-y-3">
            <TrustRow title="Before investment" copy="Investor reviews traction score, round terms, wallet details, and milestone definitions." />
            <TrustRow title="During round" copy="Funds are allocated against the milestone plan and tracked inside the launchpad." />
            <TrustRow title="At release" copy="Milestone evaluation and Casper proof create an audit trail for why money moved." />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-6">
          <SectionHeader
            icon={Scale}
            eyebrow="Business model"
            title="How CodeQuity generates revenue"
            copy="The business model is aligned with useful capital movement, investor intelligence, and ecosystem distribution."
          />
          <div className="mt-6 overflow-hidden rounded-sm border border-[#1F1F1F]">
            {revenueRows.map(([stream, pricing, why]) => (
              <div
                key={stream}
                className="grid gap-3 border-b border-[#1F1F1F] p-4 last:border-b-0 md:grid-cols-[0.85fr_0.55fr_1.3fr]"
              >
                <div className="text-sm font-bold text-white">{stream}</div>
                <div className="font-mono text-xs font-bold text-[#45f798]">{pricing}</div>
                <div className="text-xs leading-5 text-zinc-500">{why}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-6">
          <SectionHeader
            icon={ShieldCheck}
            eyebrow="Casper proof"
            title="Explorer-ready references"
            copy="Use these links during a demo to show that the Casper layer is not hidden behind screenshots."
          />
          <div className="mt-6 space-y-2">
            {proofLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-sm border border-white/10 bg-white/[0.025] p-3 transition-colors hover:border-[#45f798]/35 hover:bg-[#45f798]/5"
              >
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-white">{link.label}</span>
                  <span className="mt-1 block truncate font-mono text-[10px] text-zinc-500">{shortValue(link.value)}</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 text-[#45f798]" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          icon={CheckCircle2}
          eyebrow="Demo readiness"
          title="What to show when time is limited"
          copy="These shortcuts keep the story clear: investor discovery, capital protection, and Casper settlement proof."
        />
        <div className="grid gap-3 md:grid-cols-3">
          {demoCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-sm border border-[#1F1F1F] bg-[#0A0A0A] p-5 transition-colors hover:border-[#45f798]/45 hover:bg-[#0D110F]"
            >
              <card.icon className="h-5 w-5 text-[#45f798]" />
              <h3 className="mt-4 text-sm font-bold text-white">{card.title}</h3>
              <p className="mt-2 text-xs leading-5 text-zinc-500">{card.copy}</p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#45f798]">
                Open
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "blue" | "violet";
}) {
  const tones = {
    green: "border-[#45f798]/25 bg-[#45f798]/10 text-[#45f798]",
    blue: "border-[#66f4ff]/25 bg-[#66f4ff]/10 text-[#66f4ff]",
    violet: "border-violet-400/25 bg-violet-400/10 text-violet-300",
  };

  return (
    <div className={`rounded-sm border p-4 ${tones[tone]}`}>
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-75">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}

function AudienceCard({
  icon: Icon,
  label,
  title,
  copy,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="group relative overflow-hidden border border-[#1F1F1F] bg-[#0A0A0A] p-4 transition-colors hover:border-[#45f798]/35 hover:bg-[#0D110F]">
      <div className="absolute inset-y-0 left-0 w-px bg-[#45f798]/40" />
      <div className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#45f798]/25 bg-[#45f798]/10 text-[#45f798] transition-colors group-hover:bg-[#45f798]/15">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            {label}
          </div>
          <h2 className="mt-2 text-base font-semibold tracking-tight text-white sm:text-lg">{title}</h2>
          <p className="mt-1.5 text-xs leading-5 text-zinc-500">{copy}</p>
        </div>
      </div>
    </div>
  );
}

function VideoFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.025] px-2 py-2">
      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-zinc-600">{label}</div>
      <div className="mt-1 font-mono text-[10px] font-bold text-zinc-300">{value}</div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  eyebrow,
  title,
  copy,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#45f798]">
        <Icon className="h-3.5 w-3.5" />
        {eyebrow}
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{copy}</p>
    </div>
  );
}

function TrustRow({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="flex gap-3 rounded-sm border border-white/10 bg-white/[0.025] p-4">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#45f798]" />
      <div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
        <p className="mt-1 text-xs leading-5 text-zinc-500">{copy}</p>
      </div>
    </div>
  );
}

function shortValue(value: string) {
  return value.length > 28 ? `${value.slice(0, 18)}...${value.slice(-8)}` : value;
}
